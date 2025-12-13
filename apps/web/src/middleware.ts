import type { NextRequest } from 'next/server'

import { i18nMiddleware } from '@tszhong0411/i18n/middleware'

const middleware = (request: NextRequest) => {
  const is_production = process.env.NODE_ENV === 'production'

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.yuricunha.com *.umami.is vercel.live va.vercel-scripts.com unpkg.com challenges.cloudflare.com",
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

  const response = i18nMiddleware(request)

  if (is_production) {
    response.headers.set('Content-Security-Policy-Report-Only', csp)
  }

  return response
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - _vercel (Vercel internal)
   * - favicon.ico (favicon file)
   * - folders in public (which resolve to /foldername)
   * - sitemap.xml
   * - robots.txt
   * - rss.xml
   */
  matcher: [
    '/((?!api|_next/static|_next/image|_vercel|og|favicon|fonts|images|videos|favicon.ico|sitemap.xml|robots.txt|rss.xml).*)'
  ]
}

export default middleware
