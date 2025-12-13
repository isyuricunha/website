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
    const entries = Array.from(rateLimitMap.entries())
    entries.forEach(([key, value]) => {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    })
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

    const looksLikeIpv4WithPort = first.includes('.') && first.includes(':')
    if (looksLikeIpv4WithPort) {
      const [ip] = first.split(':')
      return ip?.trim() || null
    }

    return first
  }

  const cfConnectingIp = normalizeIp(headers.get('cf-connecting-ip'))
  if (cfConnectingIp) return cfConnectingIp

  const trueClientIp = normalizeIp(headers.get('true-client-ip'))
  if (trueClientIp) return trueClientIp

  const vercelForwardedFor = normalizeIp(headers.get('x-vercel-forwarded-for'))
  if (vercelForwardedFor) return vercelForwardedFor

  const forwardedFor = normalizeIp(headers.get('x-forwarded-for'))
  if (forwardedFor) return forwardedFor

  const realIp = normalizeIp(headers.get('x-real-ip'))
  if (realIp) return realIp

  return normalizeIp(headers.get('x-client-ip')) ?? 'unknown'
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
      body: formData
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
