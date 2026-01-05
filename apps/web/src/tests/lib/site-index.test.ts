import { describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/i18n/config', () => ({
  i18n: {
    locales: ['en', 'pt']
  }
}))

vi.mock('content-collections', () => ({
  allPosts: [
    {
      locale: 'en',
      slug: 'hello',
      title: 'Hello World',
      summary: 'Intro post',
      content: 'Hello content'
    },
    {
      locale: 'en',
      slug: 'art-of-starting-over',
      title: 'The Art of Starting Over',
      summary: 'A post about starting over',
      content: 'Content about starting over'
    }
  ],
  allProjects: [
    {
      locale: 'en',
      slug: 'proj',
      name: 'Proj',
      description: 'Proj desc',
      content: 'Proj content'
    }
  ],
  allPages: [
    {
      locale: 'en',
      slug: 'about',
      content: 'About page content',
      _meta: { path: 'en/about' }
    }
  ]
}))

vi.mock('@/utils/get-localized-path', () => ({
  getLocalizedPath: ({ slug, locale }: { slug: string; locale: string }) => `/${locale}${slug}`
}))

describe('site-index', () => {
  it('build_site_index filters by locale and builds localized hrefs', async () => {
    const { build_site_index } = await import('@/lib/ai/site-index')

    const entries = build_site_index('en')
    expect(entries.find((e) => e.type === 'post')?.href).toBe('/en/blog/hello')
    expect(entries.find((e) => e.type === 'project')?.href).toBe('/en/projects/proj')
    expect(entries.find((e) => e.type === 'page')?.href).toBe('/en/about')
  })

  it('get_page_context resolves blog post context using page_path', async () => {
    const { get_page_context } = await import('@/lib/ai/site-index')

    const ctx = get_page_context('/pt/blog/hello', 'en')
    expect(ctx).toBeTruthy()
    expect(ctx?.type).toBe('post')
    expect(ctx?.href).toBe('/en/blog/hello')
  })

  it('find_citations includes current page context first when available', async () => {
    const { find_citations } = await import('@/lib/ai/site-index')

    const citations = find_citations({
      message: 'hello',
      locale: 'en',
      page_path: '/en/blog/hello',
      limit: 5
    })
    expect(citations[0]?.id).toBe('page')
    expect(citations.some((c) => c.id === 'post:hello')).toBe(true)
  })

  it('build_navigation_answer returns a deterministic list of links', async () => {
    const { build_navigation_answer } = await import('@/lib/ai/site-index')

    const result = build_navigation_answer({ query: 'hello', locale: 'en' })
    expect(result.message).toContain('Here are some pages')
    expect(result.citations.length).toBeGreaterThan(0)
  })

  it('build_post_recommendation_answer avoids recommending the quoted post title', async () => {
    const { build_post_recommendation_answer } = await import('@/lib/ai/site-index')

    const result = build_post_recommendation_answer({
      query: 'Recommend more Post like "The Art of Starting Over". Please include links.',
      locale: 'en',
      limit: 3
    })

    expect(result.citations.some((c) => c.id === 'post:art-of-starting-over')).toBe(false)
    expect(result.citations.some((c) => c.id === 'post:hello')).toBe(true)
  })

  it('build_post_recommendation_answer respects excludeIds', async () => {
    const { build_post_recommendation_answer } = await import('@/lib/ai/site-index')

    const result = build_post_recommendation_answer({
      query: 'recommend a post',
      locale: 'en',
      limit: 3,
      excludeIds: ['post:hello']
    })

    expect(result.citations.some((c) => c.id === 'post:hello')).toBe(false)
    expect(result.citations.some((c) => c.id === 'post:art-of-starting-over')).toBe(true)
  })
})
