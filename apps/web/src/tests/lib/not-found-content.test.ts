import { describe, expect, it, vi } from 'vitest'
import { getRecentNotFoundContent } from '@/lib/not-found-content'

const fixtures = vi.hoisted(() => ({
  allPosts: [
    { locale: 'en', slug: 'older', date: '2024-03-01' },
    { locale: 'en', slug: 'newest', date: '2026-11-01' },
    { locale: 'en', slug: 'middle', date: '2025-01-01' },
    { locale: 'en', slug: 'oldest', date: '2023-01-01' },
    { locale: 'pt', slug: 'portuguese', date: '2026-10-01' }
  ],
  allSnippets: [{ locale: 'pt', slug: 'pt-snippet', date: '2026-08-01' }],
  allProjects: [{ locale: 'en', slug: 'repo', date: '2026-02-01' }]
}))

vi.mock('content-collections', () => fixtures)

describe('localized 404 recommendations', () => {
  it('preserves the three newest posts for the requested locale', () => {
    expect(getRecentNotFoundContent('en').posts.map((post) => post.slug)).toEqual([
      'newest',
      'middle',
      'older'
    ])
  })

  it('never mixes languages', () => {
    const content = getRecentNotFoundContent('pt')
    expect(content.posts.map((post) => post.slug)).toEqual(['portuguese'])
    expect(content.snippets.map((snippet) => snippet.slug)).toEqual(['pt-snippet'])
    expect(content.projects).toHaveLength(0)
  })

  it('reuses the same precomputed result across requests', () => {
    expect(getRecentNotFoundContent('en')).toBe(getRecentNotFoundContent('en'))
  })

  it('falls back to the default language for unexpected locale values', () => {
    expect(getRecentNotFoundContent('invalid-locale')).toBe(getRecentNotFoundContent('en'))
  })
})
