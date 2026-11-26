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
      date: '2023-01-01',
      modifiedTime: '2026-10-01',
      content: 'Hello content'
    },
    {
      locale: 'en',
      slug: 'art-of-starting-over',
      title: 'The Art of Starting Over',
      summary: 'A post about starting over',
      date: '2025-08-21',
      modifiedTime: '2025-08-22',
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
  allSnippets: [
    {
      locale: 'en',
      slug: 'snippet-hello',
      title: 'Hello Snippet',
      description: 'Snippet desc',
      content: 'Snippet content',
      date: '2023-01-01T00:00:00.000Z'
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
    expect(entries.find((e) => e.type === 'page' && e.href === '/en/about')?.href).toBe('/en/about')
    expect(entries.find((e) => e.type === 'snippet')?.href).toBe('/en/snippet/snippet-hello')
  })

  it('resolves canonical homepage and public document aliases but never private paths', async () => {
    const { read_site_content, get_site_overview } = await import('@/lib/ai/site-index')
    // The test's localized-path mock prefixes even the default locale.
    expect(read_site_content('/en', 'en')?.citation.href).toBe('/en/')
    expect(read_site_content('/en/blog/hello', 'en')?.citation.href).toBe('/en/blog/hello')
    expect(read_site_content('/pt/admin/users', 'pt')).toBeNull()
    expect(get_site_overview('ja').some((item) => item.title === 'プロジェクト')).toBe(true)
    expect(get_site_overview('zh-CN').some((item) => item.title === '项目')).toBe(true)
  })

  it('get_page_context resolves blog post context using page_path', async () => {
    const { get_page_context } = await import('@/lib/ai/site-index')

    const ctx = get_page_context('/pt/blog/hello', 'en')
    expect(ctx).toBeTruthy()
    expect(ctx?.type).toBe('post')
    expect(ctx?.href).toBe('/en/blog/hello')
  })

  it('get_page_context resolves snippet context using page_path', async () => {
    const { get_page_context } = await import('@/lib/ai/site-index')

    const ctx = get_page_context('/pt/snippet/snippet-hello', 'en')
    expect(ctx).toBeTruthy()
    expect(ctx?.type).toBe('snippet')
    expect(ctx?.href).toBe('/en/snippet/snippet-hello')
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
    expect(citations.filter((c) => c.href === '/en/blog/hello')).toHaveLength(1)
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
    expect(result.citations).toHaveLength(0)
  })

  it('formats titles as links for posts, snippets and navigation instead of printing raw slugs', async () => {
    const {
      build_post_recommendation_answer,
      build_snippet_recommendation_answer,
      build_navigation_answer
    } = await import('@/lib/ai/site-index')

    for (const build of [
      build_post_recommendation_answer,
      build_snippet_recommendation_answer,
      build_navigation_answer
    ]) {
      const answer = build({ query: 'hello', locale: 'en' })
      expect(answer.citations.length).toBeGreaterThan(0)
      for (const citation of answer.citations) {
        expect(answer.message).toContain(`- [${citation.title}](<${citation.href}>)`)
        expect(answer.message).not.toContain(`${citation.title}: ${citation.href}`)
      }
    }
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

describe('public knowledge metadata', () => {
  it('orders actual dates instead of relevance, and distinguishes publication from update', async () => {
    const { list_site_content, read_site_content } = await import('@/lib/ai/site-index')
    const input = { locale: 'en', type: 'post' as const }
    expect(list_site_content({ ...input, order: 'newest' }).map((c) => c.publishedAt)).toEqual([
      '2025-08-21',
      '2023-01-01'
    ])
    expect(list_site_content({ ...input, order: 'oldest' })[0]?.href).toBe('/en/blog/hello')
    expect(list_site_content({ ...input, order: 'updated' })[0]?.href).toBe('/en/blog/hello')
    expect(read_site_content('/en/blog/hello', 'en')?.citation).toMatchObject({
      publishedAt: '2023-01-01',
      updatedAt: '2026-10-01'
    })
    expect(list_site_content({ ...input, order: 'newest', query: 'starting over' })[0]?.href).toBe(
      '/en/blog/art-of-starting-over'
    )
  })

  it('provides only the public contact channels from the contact page', async () => {
    const { find_citations, read_site_content } = await import('@/lib/ai/site-index')
    const { publicContact } = await import('@/lib/public-contact')
    expect(find_citations({ message: 'What is the email?', locale: 'en' })[0]?.excerpt).toContain(
      publicContact.email
    )
    expect(read_site_content('/en/contact', 'en')?.content).toContain(publicContact.linkedin)
    expect(read_site_content('/en/admin', 'en')).toBeNull()
  })
})
