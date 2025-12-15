import { describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/i18n/config', () => ({
    supportedLanguages: [
        { code: 'en', label: 'English', default: true },
        { code: 'pt', label: 'Português' }
    ]
}))

vi.mock('@/lib/constants', () => ({
    SITE_URL: 'https://example.com'
}))

vi.mock('@/utils/get-localized-path', () => ({
    getLocalizedPath: ({ slug, locale }: { slug: string; locale: string }) => {
        const localePrefix = locale === 'en' ? '' : `/${locale}`
        return `${localePrefix}${slug}`
    }
}))

vi.mock('content-collections', () => ({
    allPosts: [
        {
            locale: 'en',
            slug: 'hello',
            date: '2023-01-01T00:00:00.000Z',
            modifiedTime: '2023-02-01T00:00:00.000Z'
        },
        {
            locale: 'pt',
            slug: 'ola',
            date: '2023-01-10T00:00:00.000Z',
            modifiedTime: '2023-01-10T00:00:00.000Z'
        }
    ],
    allProjects: [
        {
            locale: 'en',
            slug: 'proj',
            name: 'Proj'
        }
    ],
    allPages: [
        {
            locale: 'en',
            slug: 'about'
        },
        {
            locale: 'pt',
            slug: 'uses'
        }
    ]
}))

describe('app sitemap.xml generator', () => {
    it('does not generate duplicate URLs', async () => {
        const { default: sitemap } = await import('@/app/sitemap')

        const entries = sitemap()
        const urls = entries.map((e) => e.url)

        expect(new Set(urls).size).toBe(urls.length)
    })

    it('includes critical routes for each supported locale', async () => {
        const { default: sitemap } = await import('@/app/sitemap')

        const entries = sitemap()
        const urls = new Set(entries.map((e) => e.url))

        // default locale (en) has no prefix
        expect(urls.has('https://example.com')).toBe(true)
        expect(urls.has('https://example.com/sitemap')).toBe(true)
        expect(urls.has('https://example.com/rss.xml')).toBe(true)

        // non-default locale is prefixed
        expect(urls.has('https://example.com/pt')).toBe(true)
        expect(urls.has('https://example.com/pt/sitemap')).toBe(true)
        expect(urls.has('https://example.com/pt/rss.xml')).toBe(true)
    })

    it('uses post modifiedTime when available', async () => {
        const { default: sitemap } = await import('@/app/sitemap')

        const entries = sitemap()
        const post = entries.find((e) => e.url === 'https://example.com/blog/hello')

        expect(post).toBeTruthy()
        expect(post?.lastModified).toBeInstanceOf(Date)

        if (!(post?.lastModified instanceof Date)) {
            throw new TypeError('Expected lastModified to be a Date')
        }

        expect(post.lastModified.toISOString()).toBe('2023-02-01T00:00:00.000Z')
    })
})
