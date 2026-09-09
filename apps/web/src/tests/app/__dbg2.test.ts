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

describe('dbg explicit locales', () => {
  it('explicit locales render both', async () => {
    const { build_absolute_language_alternates } = await import('@/lib/seo')
    const languages = build_absolute_language_alternates({ slug: '/', locales: ['en', 'pt'] })
    console.log('EXPLICIT:', JSON.stringify(languages))
    expect(Object.keys(languages)).toContain('pt')
  })
})
