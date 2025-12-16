import { describe, expect, it, vi } from 'vitest'

vi.mock('content-collections', () => ({
  allPosts: [
    {
      locale: 'en',
      slug: 'a',
      title: 'A',
      summary: 'A summary',
      tags: ['x'],
      category: 'cat'
    },
    {
      locale: 'en',
      slug: 'b',
      title: 'B',
      summary: 'B summary',
      tags: ['x'],
      category: 'cat'
    },
    {
      locale: 'en',
      slug: 'c',
      title: 'C',
      summary: 'C summary'
    },
    {
      locale: 'en',
      slug: 'd',
      title: 'D',
      summary: 'D summary'
    },
    {
      locale: 'pt',
      slug: 'a',
      title: 'A PT',
      summary: 'A summary PT'
    },
    {
      locale: 'pt',
      slug: 'd',
      title: 'D PT',
      summary: 'D summary PT'
    }
  ],
  allSnippets: [
    {
      locale: 'en',
      slug: 's1',
      title: 'S1',
      description: 'S1 desc',
      tags: ['t1', 't2']
    },
    {
      locale: 'en',
      slug: 's2',
      title: 'S2',
      description: 'S2 desc',
      tags: ['t2']
    },
    {
      locale: 'en',
      slug: 's3',
      title: 'S3',
      description: 'S3 desc'
    },
    {
      locale: 'pt',
      slug: 's1',
      title: 'S1 PT',
      description: 'S1 desc PT'
    }
  ]
}))

describe('recommendations', () => {
  it('returns related posts when there is similarity, and fills the rest with fallback', async () => {
    const { getRecommendedPosts } = await import('@/lib/recommendations')

    const recs = getRecommendedPosts({ slug: 'a', locale: 'en', limit: 3 })

    expect(recs).toHaveLength(3)

    // should recommend a related post (b shares category + tags)
    expect(recs.some((r) => r.id === 'b')).toBe(true)

    // should not recommend current post
    expect(recs.some((r) => r.id === 'a')).toBe(false)

    // should stay in locale
    expect(recs.every((r) => r.href.startsWith('/blog/'))).toBe(true)

    // should include at least one fallback item when limit is greater than related results
    expect(recs.some((r) => r.isFallback)).toBe(true)
  })

  it('returns deterministic fallback posts when no similarity exists', async () => {
    const { getRecommendedPosts } = await import('@/lib/recommendations')

    const r1 = getRecommendedPosts({ slug: 'c', locale: 'en', limit: 2 }).map((r) => r.id)
    const r2 = getRecommendedPosts({ slug: 'c', locale: 'en', limit: 2 }).map((r) => r.id)

    expect(r1).toEqual(r2)
    expect(r1).toHaveLength(2)
  })

  it('returns related snippets by tags and fills with fallback, without crossing locales', async () => {
    const { getRecommendedSnippets } = await import('@/lib/recommendations')

    const recs = getRecommendedSnippets({ slug: 's1', locale: 'en', limit: 2 })

    expect(recs).toHaveLength(2)
    expect(recs.some((r) => r.id === 's2')).toBe(true)
    expect(recs.every((r) => r.type === 'snippet')).toBe(true)
    expect(recs.every((r) => r.href.startsWith('/snippet/'))).toBe(true)
  })
})
