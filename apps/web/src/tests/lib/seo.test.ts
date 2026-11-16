import { describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/i18n/config', () => ({
  i18n: {
    locales: ['en', 'pt'],
    defaultLocale: 'en'
  }
}))

vi.mock('@/lib/constants', () => ({
  SITE_URL: 'https://example.com',
  SITE_NAME: 'Example',
  SITE_DESCRIPTION: 'Example description'
}))

vi.mock('@/utils/get-localized-path', () => ({
  getLocalizedPath: ({ slug, locale }: { slug: string; locale: string }) => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`
    return `${localePrefix}${slug}`
  }
}))

describe('seo helpers', () => {
  it('build_alternates returns canonical + languages + x-default respecting default locale prefix', async () => {
    const { build_alternates } = await import('@/lib/seo')

    const alternates = build_alternates({
      slug: '/blog/hello',
      locale: 'en',
      locales: ['en', 'pt']
    })

    expect(alternates.canonical).toBe('/blog/hello')
    expect(alternates.languages?.en).toBe('/blog/hello')
    expect(alternates.languages?.pt).toBe('/pt/blog/hello')
    expect(alternates.languages?.['x-default']).toBe('/blog/hello')
  })

  it('buildSeoHead builds canonical and hreflang without double locale prefix', async () => {
    const { buildSeoHead } = await import('@/lib/seo')

    const seo = buildSeoHead({
      slug: '/blog/hello',
      locale: 'pt',
      title: 'Hello',
      description: 'Hi'
    })

    expect(seo.canonicalPath).toBe('/pt/blog/hello')
    expect(seo.alternates.languages.pt).toBe('/pt/blog/hello')
    expect(seo.alternates.languages.en).toBe('/blog/hello')
    expect(seo.alternates.languages['x-default']).toBe('/blog/hello')
  })

  it('buildSeoHead does not double the locale prefix when the slug already carries it', async () => {
    const { buildSeoHead } = await import('@/lib/seo')

    const seo = buildSeoHead({
      slug: '/pt/blog/hello',
      locale: 'pt',
      title: 'Hello',
      description: 'Hi'
    })

    expect(seo.canonicalPath).toBe('/pt/blog/hello')
  })

  it('buildSeoHead keeps the title as provided without appending the site name', async () => {
    const { buildSeoHead } = await import('@/lib/seo')

    const seo = buildSeoHead({
      slug: '/',
      locale: 'en',
      title: 'Hello',
      description: 'Hi'
    })

    expect(seo.title).toBe('Hello')
    expect(seo.description).toBe('Hi')
  })
})
