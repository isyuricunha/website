import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/blog/blog-service', () => ({
  BlogService: {
    getPostsByLocale: vi.fn()
  }
}))

const fakePost = {
  slug: 'hello-world',
  title: 'Hello World',
  date: '2026-09-09',
  summary: 'A hello world post',
  locale: 'en',
  filePath: 'content/posts/en/hello-world.mdx'
}

describe('/api/mascot/latest-post locale handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('falls back to the default locale when the requested locale is unknown', async () => {
    const { BlogService } = await import('@/lib/blog/blog-service')
    vi.mocked(BlogService.getPostsByLocale).mockResolvedValue([fakePost])

    const { GET } = await import('@/app/api/mascot/latest-post/route')

    const request = new Request('https://yuricunha.com/api/mascot/latest-post?locale=xx')
    const res = await GET(request)

    expect(res.status).toBe(200)
    const json = (await res.json()) as { post: { slug: string } }
    expect(json.post?.slug).toBe(fakePost.slug)
    expect(BlogService.getPostsByLocale).toHaveBeenCalledWith('en')
  })

  it('accepts every supported locale without rewriting it', async () => {
    const { BlogService } = await import('@/lib/blog/blog-service')
    vi.mocked(BlogService.getPostsByLocale).mockResolvedValue([fakePost])

    const { GET } = await import('@/app/api/mascot/latest-post/route')
    const { i18n } = await import('@isyuricunha/i18n/config')

    for (const locale of i18n.locales) {
      vi.mocked(BlogService.getPostsByLocale).mockClear()
      const request = new Request(`https://yuricunha.com/api/mascot/latest-post?locale=${locale}`)
      const res = await GET(request)
      expect(res.status).toBe(200)
      expect(BlogService.getPostsByLocale).toHaveBeenCalledWith(locale)
    }
  })

  it('still returns post null when the locale has no posts', async () => {
    const { BlogService } = await import('@/lib/blog/blog-service')
    vi.mocked(BlogService.getPostsByLocale).mockResolvedValue([])

    const { GET } = await import('@/app/api/mascot/latest-post/route')

    const request = new Request('https://yuricunha.com/api/mascot/latest-post?locale=pt')
    const res = await GET(request)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ post: null })
  })
})
