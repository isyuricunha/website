import { describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/i18n/config', () => ({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt']
  },
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
  allSnippets: [],
  allPosts: [],
  allProjects: [],
  allPages: []
}))

describe('dbg sitemap home', () => {
  it('all entries', async () => {
    const { default: sitemap } = await import('@/app/sitemap')
    const entries = sitemap()
    for (const e of entries) {
      console.log('ENTRY:', e.url, '| LANGS:', JSON.stringify(e.alternates?.languages))
    }
    expect(entries.length).toBeGreaterThan(0)
  })
})
