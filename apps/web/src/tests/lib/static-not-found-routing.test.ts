import { describe, expect, it } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

import { getStaticNotFoundUrl } from '@/lib/static-not-found-routing'

const locales = ['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh-CN']
const roots = ['404', 'admin', 'blog', 'projects', 'u', 'guestbook', 'images', 'rss.xml']
const origin = 'https://yuricunha.com'

const route = (
  path: string,
  {
    internalPath = path,
    init
  }: {
    internalPath?: string
    init?: ConstructorParameters<typeof NextRequest>[1]
  } = {}
) => {
  const request = new NextRequest(origin + path, init)
  return getStaticNotFoundUrl(
    request,
    NextResponse.rewrite(new URL(internalPath, origin)),
    locales,
    roots
  )
}

describe('localized static 404 routing', () => {
  it.each(locales)(
    'rewrites an unknown path in %s without redirecting or losing query parameters',
    (locale) => {
      const url = route('/missing/path?a=1', {
        internalPath: '/' + locale + '/missing/path?a=1'
      })
      expect(url?.pathname).toBe('/' + locale + '/404')
      expect(url?.search).toBe('?a=1')
    }
  )

  it.each([
    '/pt',
    '/pt/blog',
    '/pt/blog/unknown',
    '/pt/projects/deep/path',
    '/pt/admin/foo',
    '/pt/u/handle',
    '/pt/guestbook',
    '/pt/images/file.png',
    '/pt/rss.xml',
    '/pt/api/health',
    '/pt/_next/static/example.js',
    '/pt/og/unknown',
    '/pt/%62log',
    '/pt/a%2Fb',
    '/pt/a%5Cb',
    '/pt/%xx',
    '/xx/missing'
  ])('does not intercept ambiguous, real or protected paths: %s', (path) =>
    expect(route(path)).toBeNull()
  )

  it.each([
    'rsc',
    'next-router-state-tree',
    'next-router-prefetch',
    'next-router-segment-prefetch'
  ])('keeps %s traffic on the original App Router catch-all', (header) =>
    expect(
      route('/pt/missing', { internalPath: '/pt/missing', init: { headers: { [header]: '1' } } })
    ).toBeNull()
  )

  it('keeps RSC query traffic and non-GET requests on the existing router', () => {
    expect(route('/pt/missing?_rsc=abc')).toBeNull()
    expect(
      route('/pt/missing', { internalPath: '/pt/missing', init: { method: 'POST' } })
    ).toBeNull()
  })

  it('respects locale redirects before serving errors', () => {
    const request = new NextRequest(origin + '/en/missing')
    const response = NextResponse.redirect(origin + '/missing')
    expect(getStaticNotFoundUrl(request, response, locales, roots)).toBeNull()
  })

  it('preserves the catch-all if route discovery cannot prove the path is absent', () => {
    const request = new NextRequest(origin + '/pt/missing')
    expect(getStaticNotFoundUrl(request, NextResponse.next(), locales, null)).toBeNull()
  })

  it('always serves the reserved 404 page as an error even if discovery is disabled', () => {
    const request = new NextRequest(origin + '/pt/404')
    expect(getStaticNotFoundUrl(request, NextResponse.next(), locales, null)?.pathname).toBe(
      '/pt/404'
    )
  })

  it('supports HEAD without redirecting', () => {
    expect(
      route('/pt/missing', { internalPath: '/pt/missing', init: { method: 'HEAD' } })?.pathname
    ).toBe('/pt/404')
  })
})
