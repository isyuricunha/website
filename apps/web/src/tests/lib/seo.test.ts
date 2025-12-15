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

    it('generateSEO builds canonical and hreflang without double locale prefix', async () => {
        const { generateSEO } = await import('@/lib/seo')

        const seo = generateSEO({
            title: 'Hello',
            url: '/pt/blog/hello',
            locale: 'pt',
            alternateLocales: ['en']
        })

        expect(seo.alternates?.canonical).toBe('/pt/blog/hello')
        expect(seo.alternates?.languages?.pt).toBe('/pt/blog/hello')
        expect(seo.alternates?.languages?.en).toBe('/blog/hello')
        expect(seo.alternates?.languages?.['x-default']).toBe('/blog/hello')

        expect(seo.openGraph?.url).toBe('https://example.com/pt/blog/hello')
    })

    it('generateSEO accepts absolute URLs and normalizes the pathname', async () => {
        const { generateSEO } = await import('@/lib/seo')

        const seo = generateSEO({
            title: 'Hello',
            url: 'https://example.com/pt/blog/hello',
            locale: 'pt',
            alternateLocales: ['en']
        })

        expect(seo.alternates?.canonical).toBe('/pt/blog/hello')
        expect(seo.openGraph?.url).toBe('https://example.com/pt/blog/hello')
    })
})
