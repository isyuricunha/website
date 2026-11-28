import type { NextRequest, NextResponse } from 'next/server'

const STATIC_NOT_FOUND_SEGMENT = '404'

const protectedRoots = new Set([
  '_next',
  '_vercel',
  'api',
  'og',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'rss.xml',
  'llms.txt',
  'sw.js'
])

/** Only rewrite HTML requests whose first localized segment cannot be a route.
 * RSC requests, known route families and ambiguous encodings use Next's
 * existing catch-all so the normal App Router semantics remain intact.
 */
export function getStaticNotFoundUrl(
  request: NextRequest,
  response: NextResponse,
  locales: readonly string[],
  routeRoots: readonly string[] | null
): URL | null {
  if (!response.ok || !['GET', 'HEAD'].includes(request.method)) return null

  const url = new URL(response.headers.get('x-middleware-rewrite') || request.url)
  const [, locale, rawRoot] = url.pathname.split('/')
  if (!locale || !rawRoot || !locales.includes(locale)) return null

  let root: string
  try {
    root = decodeURIComponent(rawRoot).toLowerCase()
  } catch {
    return null
  }
  if (root === '.' || root === '..' || root.includes('/') || root.includes('\\')) return null

  const isInternalPage = root === STATIC_NOT_FOUND_SEGMENT
  if (!isInternalPage) {
    if (!routeRoots || protectedRoots.has(root) || routeRoots.includes(root)) return null
    if (
      request.headers.has('rsc') ||
      request.headers.has('next-router-state-tree') ||
      request.headers.has('next-router-prefetch') ||
      request.headers.has('next-router-segment-prefetch') ||
      url.searchParams.has('_rsc')
    )
      return null
  }
  url.pathname = `/${locale}/${STATIC_NOT_FOUND_SEGMENT}`
  return url
}
