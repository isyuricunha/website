import type { Handle } from '@sveltejs/kit/hooks'
import { i18n } from '@isyuricunha/i18n/config'
import { isLocale, localeFromPathname } from '#lib/i18n/config.ts'
import { LOCALE_COOKIE, negotiateLocale } from '#lib/i18n/locale.ts'

/**
 * Paths that never take part in locale negotiation, mirroring the Next.js
 * middleware matcher: APIs, protocol discovery files, static assets and SEO
 * surfaces.
 */
const SKIPPED_PREFIXES = [
  '/api/',
  '/og',
  '/.well-known/',
  '/rss.xml',
  '/robots.txt',
  '/llms.txt',
  '/sitemap.xml',
  '/favicon',
  '/fonts/',
  '/images/',
  '/videos/'
]

const isSkippedPath = (pathname: string) => {
  if (SKIPPED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true
  }

  // Static assets carry a file extension.
  return /\.[\w]+$/.test(pathname)
}

/** Hardened CSP, report-only until inline-script nonces land. */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' *.yuricunha.com *.umami.is vercel.live va.vercel-scripts.com unpkg.com challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' vercel.live",
  "img-src 'self' https: data: blob:",
  "font-src 'self' data: assets.vercel.com vercel.live",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "connect-src 'self' https: wss:",
  "media-src 'self'",
  "frame-ancestors 'none'",
  'frame-src vercel.live challenges.cloudflare.com',
  "worker-src blob: 'self'"
].join('; ')

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname, search } = event.url

  if (isSkippedPath(pathname)) {
    return resolve(event)
  }

  const { locale: pathLocale, unprefixed } = localeFromPathname(pathname)
  const explicitPrefix = isLocale(pathname.split('/')[1])

  if (explicitPrefix) {
    event.locals.locale = pathLocale

    if (event.cookies.get(LOCALE_COOKIE) !== pathLocale) {
      event.cookies.set(LOCALE_COOKIE, pathLocale, {
        path: '/',
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365
      })
    }
  } else {
    const negotiated = negotiateLocale(
      event.request.headers.get('cookie'),
      event.request.headers.get('accept-language')
    )

    event.locals.locale = negotiated

    if (negotiated !== i18n.defaultLocale) {
      const target = `/${negotiated}${unprefixed}${search}`
      return new Response(null, { status: 307, headers: { location: target } })
    }
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.locale)
  })

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy-Report-Only', contentSecurityPolicy)
  }

  return response
}
