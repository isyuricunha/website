import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockPost = {
  slug: string
  title: string
  date: string
  locale: string
}

const mockedPosts = vi.hoisted(() => [] as MockPost[])

vi.mock('content-collections', () => ({ allPosts: mockedPosts }))

const fakePost = {
  slug: 'hello-world',
  title: 'Hello World',
  date: '2026-09-09',
  locale: 'en'
}

describe('/api/mascot/latest-post locale handling', () => {
  beforeEach(() => mockedPosts.splice(0))

  it('falls back to the default locale when the requested locale is unknown', async () => {
    mockedPosts.push(fakePost, { ...fakePost, slug: 'pt-post', locale: 'pt' })
    const { GET } = await import('@/app/api/mascot/latest-post/route')
    const res = await GET(new Request('https://yuricunha.com/api/mascot/latest-post?locale=xx'))
    expect(res.status).toBe(200)
    expect((await res.json()).post.slug).toBe(fakePost.slug)
    expect(res.headers.get('cache-control')).toContain('s-maxage=600')
  })

  it('accepts every supported locale without rewriting it', async () => {
    const { GET } = await import('@/app/api/mascot/latest-post/route')
    const { i18n } = await import('@isyuricunha/i18n/config')

    for (const locale of i18n.locales) {
      mockedPosts.splice(0, mockedPosts.length, { ...fakePost, locale })
      const res = await GET(
        new Request('https://yuricunha.com/api/mascot/latest-post?locale=' + locale)
      )
      expect(res.status).toBe(200)
      expect((await res.json()).post.slug).toBe(fakePost.slug)
    }
  })

  it('returns post null when the requested locale has no posts', async () => {
    mockedPosts.push(fakePost)
    const { GET } = await import('@/app/api/mascot/latest-post/route')
    const res = await GET(new Request('https://yuricunha.com/api/mascot/latest-post?locale=pt'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ post: null })
  })

  it('returns the latest post from compiled content, not filesystem order', async () => {
    mockedPosts.push(
      { ...fakePost, slug: 'older', date: '2025-03-01' },
      { ...fakePost, slug: 'newest', date: '2026-10-31' }
    )
    const { GET } = await import('@/app/api/mascot/latest-post/route')
    const res = await GET(new Request('https://yuricunha.com/api/mascot/latest-post?locale=en'))
    expect((await res.json()).post.slug).toBe('newest')
  })
})
