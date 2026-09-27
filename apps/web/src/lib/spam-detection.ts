/**
 * Anti-spam utilities for contact form
 */

// In-memory rate limiter (em produção, considere usar Redis ou similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3 // Max 3 emails por hora por IP

/**
 * Check if IP has exceeded rate limit
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    const entries = Array.from(rateLimitMap)
    for (const [key, value] of entries) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }
  }

  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true }
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  record.count++
  return { allowed: true }
}

/**
 * Crawler / automation user-agent detection.
 *
 * Bare substring matching is NOT safe here: 'sogou' also matches the real
 * Sogou Mobile Browser and Sogou Explorer (human users), and a bare 'bot'
 * matches Android device models such as 'CUBOT_NOTE_S'. Each marker below is
 * therefore either a string that cannot appear in a shipping browser, or a
 * regex anchored on the punctuation real crawlers use ('Googlebot/2.1',
 * 'TelegramBot (like ...)').
 *
 * Deliberately ABSENT: generic HTTP client stacks ('okhttp',
 * 'apache-httpclient', plain 'httpclient'). Native mobile apps and RSS
 * readers ship OkHttp's default user agent, so matching it would 403 real
 * people. A crawler that hides behind a bare client UA gets counted; a human
 * being blocked is the worse failure.
 */
const BOT_UA_PATTERNS: readonly RegExp[] = [
  // 'bot' only at a token boundary: matches Googlebot/2.1, bingbot;,
  // Googlebot-Image/1.0 and a trailing 'bot', but not Android device models
  // such as CUBOT_NOTE_S.
  /(bot[-/;)\s])|(bot$)/,
  /crawler|crawling/,
  /spider/,
  /slurp/,
  /facebookexternalhit/,
  /telegrambot/,
  /embedly/,
  /lighthouse/,
  /headlesschrome/,
  /phantomjs/,
  /puppeteer|playwright/,
  /python-requests|python-urllib|aiohttp/,
  /\bcurl\//,
  /\bwget\//,
  /go-http-client/,
  /axios\//,
  /node-fetch/,
  /\bundici\b/,
  /scrapy/,
  /libwww/,
  /\bjava\/\d/,
  // Crawlers that identify themselves without the word 'bot'.
  /googleother/,
  /google-inspectiontool/,
  /bingpreview/,
  /duckduckgo-favicons/,
  /petalbot|applebot|semrush|ahrefs|mj12|dotbot|dataforseo/,
  // Vendor crawlers whose bare brand name also ships in a human browser.
  // Only the explicit crawler token matches: the Pinterest APP sends
  // 'Pinterest/<version>' and WhatsApp's in-app browser/fetcher sends
  // 'WhatsApp/<version>', and both carry real human traffic (WhatsApp is a
  // major referral source in Brazil), so they are counted as humans even
  // though that also counts their link-preview fetches as views.
  /pinterestbot/,
  /sogou\s*(web\s*)?spider/,
  /yandex(bot|images|video|media|blogs|favicons|webmaster)/
] as const

/**
 * True when the user agent matches a known crawler/automation marker.
 * A MISSING user agent is NOT considered a bot here (some privacy browsers
 * strip it); call sites that want to treat missing UA as noise check that
 * themselves.
 */
export function is_bot_user_agent(userAgent?: string | null): boolean {
  if (!userAgent) return false
  const lowered = userAgent.toLowerCase()
  return BOT_UA_PATTERNS.some((pattern) => pattern.test(lowered))
}

/**
 * Get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
  const normalizeIp = (value: string | null): string | null => {
    const trimmed = value?.trim()
    if (!trimmed) return null

    const first = trimmed.split(',')[0]?.trim()
    if (!first) return null

    const bracketedIpv6 = /^\[(.+)]:(\d+)$/.exec(first)
    if (bracketedIpv6?.[1]) return bracketedIpv6[1]

    // Only strip a trailing ":<port>" when what's left of the last colon is an
    // actual dotted-quad IPv4 address. A bare `.includes('.') && .includes(':')`
    // check also matches IPv4-mapped IPv6 (`::ffff:192.168.1.1`) and NAT64
    // (`64:ff9b::203.0.113.5`) addresses, silently truncating them to `null` or
    // a garbage fragment (e.g. `"64"`) since they contain both characters
    // without carrying a port at all.
    const lastColonIndex = first.lastIndexOf(':')
    if (lastColonIndex !== -1) {
      const beforeColon = first.slice(0, lastColonIndex)
      const afterColon = first.slice(lastColonIndex + 1)
      const isDottedQuadIpv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(beforeColon)
      const isNumericPort = /^\d+$/.test(afterColon)
      if (isDottedQuadIpv4 && isNumericPort) {
        return beforeColon
      }
    }

    return first
  }

  // Only platform-set headers are trustworthy. A client can send
  // cf-connecting-ip, true-client-ip, x-forwarded-for, x-real-ip and
  // x-client-ip on any request that does not transit the edge that owns
  // those headers, forging the identity every rate limiter keys on.
  //
  // - x-vercel-forwarded-for is injected by Vercel's edge from the actual
  //   connection and cannot be spoofed by clients.
  // - cf-connecting-ip is written by Cloudflare's edge (overwriting anything
  //   the client sent) and is only trusted when cf-ray proves the request
  //   actually transited Cloudflare.
  const cfRay = headers.get('cf-ray')
  if (cfRay) {
    const cfConnectingIp = normalizeIp(headers.get('cf-connecting-ip'))
    if (cfConnectingIp) return cfConnectingIp
  }

  const vercelForwardedFor = normalizeIp(headers.get('x-vercel-forwarded-for'))
  if (vercelForwardedFor) return vercelForwardedFor

  return 'unknown'
}

/**
 * Verify Cloudflare Turnstile token
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (remoteIp) {
      formData.append('remoteip', remoteIp)
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      // Interactive routes call this mid-request; do not let a hung siteverify
      // hold the response until the platform timeout.
      signal: AbortSignal.timeout(10_000)
    })

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'Turnstile verification failed'
      }
    }

    return { success: true }
  } catch {
    return {
      success: false,
      error: 'Failed to verify Turnstile token'
    }
  }
}
