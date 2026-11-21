import { describe, expect, it, vi } from 'vitest'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { config } from '@/proxy'

vi.mock('@isyuricunha/i18n/middleware', () => ({ i18nMiddleware: vi.fn() }))
vi.mock('@isyuricunha/i18n/config', () => ({
  i18n: { defaultLocale: 'en', locales: ['en', 'pt'] }
}))
vi.mock('@isyuricunha/env', () => ({ env: { NODE_ENV: 'test' } }))

const matches = (pathname: string) =>
  unstable_doesMiddlewareMatch({
    config,
    nextConfig: {},
    url: 'https://yuricunha.com' + pathname
  })

describe('i18n Proxy matcher for static assets', () => {
  it.each(['/sw.js', '/robots.txt', '/rss.xml', '/api/health', '/favicon/favicon.svg'])(
    'does not rewrite static content or API path %s',
    (pathname) => expect(matches(pathname)).toBe(false)
  )

  it.each(['/', '/projects', '/pt/blog', '/zh-CN/projects', '/admin'])(
    'still uses locale routing for %s',
    (pathname) => expect(matches(pathname)).toBe(true)
  )
})
