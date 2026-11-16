import { describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/constants', () => ({
  SITE_NAME: 'Yuri Cunha',
  SITE_DESCRIPTION: 'Personal site',
  SITE_URL: 'https://example.com'
}))

vi.mock('../../lib/seo', () => ({
  getLocalizedPath: ({ slug, locale }: { slug: string; locale: string }) => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`
    return `${localePrefix}${slug}`
  },
  build_absolute_language_alternates: ({ slug, locales }: { slug: string; locales?: string[] }) => {
    const availableLocales = locales && locales.length > 0 ? locales : ['en', 'pt']
    const languages: Record<string, string> = {}
    for (const locale of availableLocales) {
      const localePrefix = locale === 'en' ? '' : `/${locale}`
      languages[locale] = `https://example.com${localePrefix}${slug}`
    }
    languages['x-default'] = 'https://example.com' + slug
    return languages
  }
}))

vi.mock('content-collections', () => ({
  allSnippets: [],
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

// Extract every <loc> and the alternates of one <url> block.
const extractUrls = (xml: string): string[] =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

const extractUrlBlock = (xml: string, url: string): string => {
  const start = xml.indexOf(`<url><loc>${url}</loc>`)
  if (start === -1) return ''
  const end = xml.indexOf('</url>', start)
  return xml.slice(start, end + 6)
}

describe('app sitemap.xml generator', () => {
  it('does not generate duplicate URLs', async () => {
    const { _sitemapXml } = await import('@/routes/sitemap.xml/+server')

    const xml = _sitemapXml()
    const urls = extractUrls(xml)

    expect(new Set(urls).size).toBe(urls.length)
  })

  it('includes critical routes for each supported locale', async () => {
    const { _sitemapXml } = await import('@/routes/sitemap.xml/+server')

    const xml = _sitemapXml()
    const urls = new Set(extractUrls(xml))

    // default locale (en) has no prefix
    expect(urls.has('https://example.com')).toBe(true)
    expect(urls.has('https://example.com/sitemap')).toBe(true)
    // RSS feeds are discoverable via robots.txt, not sitemap entries
    expect(urls.has('https://example.com/rss.xml')).toBe(false)

    // non-default locale is prefixed
    expect(urls.has('https://example.com/pt')).toBe(true)
    expect(urls.has('https://example.com/pt/sitemap')).toBe(true)
    expect(urls.has('https://example.com/pt/rss.xml')).toBe(false)

    const home = extractUrlBlock(xml, 'https://example.com')

    expect(home).toContain('hreflang="en" href="https://example.com"')
    expect(home).toContain('hreflang="pt" href="https://example.com/pt"')
    expect(home).toContain('hreflang="x-default" href="https://example.com"')
  })

  it('uses post modifiedTime when available', async () => {
    const { _sitemapXml } = await import('@/routes/sitemap.xml/+server')

    const xml = _sitemapXml()
    const post = extractUrlBlock(xml, 'https://example.com/blog/hello')

    expect(post).toBeTruthy()
    expect(post).toContain('<lastmod>2023-02-01T00:00:00.000Z</lastmod>')
  })

  it('uses post date when modifiedTime is missing', async () => {
    const { _sitemapXml } = await import('@/routes/sitemap.xml/+server')

    const xml = _sitemapXml()
    const post = extractUrlBlock(xml, 'https://example.com/pt/blog/ola')

    expect(post).toBeTruthy()
    expect(post).toContain('<lastmod>2023-01-10T00:00:00.000Z</lastmod>')
  })
})
