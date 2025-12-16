import { allPosts, allSnippets } from 'content-collections'

export interface Recommendation {
  id: string
  title: string
  description: string
  href: string
  type: 'post' | 'project' | 'snippet'
  score: number
  isFallback?: boolean
  reason:
    | { kind: 'similar-content' }
    | { kind: 'same-category'; category: string }
    | { kind: 'similar-tags'; tags: string[] }
}

const hash_string_to_uint32 = (value: string) => {
  // FNV-1a 32-bit
  let hash = 2_166_136_261
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    hash ^= code
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

const stable_pick_by_seed = <T extends { id: string }>(
  items: T[],
  seed: string,
  limit: number
): T[] => {
  return items
    .map((item) => ({ item, key: hash_string_to_uint32(`${seed}:${item.id}`) }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item)
    .slice(0, limit)
}

/**
 * Calculate similarity score between two items based on tags and categories
 */
function calculateSimilarity(
  item1: { tags?: string[]; category?: string },
  item2: { tags?: string[]; category?: string }
): number {
  let score = 0

  // Category match (higher weight)
  if (item1.category && item2.category && item1.category === item2.category) {
    score += 3
  }

  // Tag matches
  if (item1.tags && item2.tags) {
    const commonTags = item1.tags.filter((tag) => item2.tags!.includes(tag))
    score += commonTags.length * 2
  }

  return score
}

/**
 * Get recommended posts based on current post
 */
export function getRecommendedPosts(params: {
  slug: string
  locale: string
  limit?: number
}): Recommendation[] {
  const limit = params.limit ?? 3
  const currentPostSlug = params.slug
  const currentLocale = params.locale

  const currentPost = allPosts.find(
    (post) => post.slug === currentPostSlug && post.locale === currentLocale
  )
  if (!currentPost) return []

  const candidates = allPosts.filter(
    (post) => post.slug !== currentPostSlug && post.locale === currentLocale
  )

  const related = candidates
    .map((post) => {
      const score = calculateSimilarity(currentPost, post)
      let reason: Recommendation['reason'] = { kind: 'similar-content' }

      if (currentPost.category && post.category && currentPost.category === post.category) {
        reason = { kind: 'same-category', category: post.category }
      } else if (currentPost.tags && post.tags) {
        const commonTags = currentPost.tags.filter((tag) => post.tags.includes(tag))
        if (commonTags.length > 0) {
          reason = { kind: 'similar-tags', tags: commonTags.slice(0, 2) }
        }
      }

      return {
        id: post.slug,
        title: post.title,
        description: post.summary,
        href: `/blog/${post.slug}`,
        type: 'post' as const,
        score,
        reason
      }
    })
    .filter((rec) => rec.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (related.length >= limit) return related

  const used = new Set(related.map((r) => r.id))
  const remaining = candidates
    .filter((post) => !used.has(post.slug))
    .map((post) => ({
      id: post.slug,
      title: post.title,
      description: post.summary,
      href: `/blog/${post.slug}`,
      type: 'post' as const,
      score: 0,
      isFallback: true,
      reason: { kind: 'similar-content' } as const
    }))

  const fallback = stable_pick_by_seed(
    remaining,
    `post:${currentPostSlug}:${currentLocale}`,
    limit - related.length
  )

  return [...related, ...fallback]
}

export function getRecommendedSnippets(params: {
  slug: string
  locale: string
  limit?: number
}): Recommendation[] {
  const limit = params.limit ?? 3
  const currentSnippetSlug = params.slug
  const currentLocale = params.locale

  const currentSnippet = allSnippets.find(
    (snippet) => snippet.slug === currentSnippetSlug && snippet.locale === currentLocale
  )
  if (!currentSnippet) return []

  const candidates = allSnippets.filter(
    (snippet) => snippet.slug !== currentSnippetSlug && snippet.locale === currentLocale
  )

  const related = candidates
    .map((snippet) => {
      const score = calculateSimilarity(
        { tags: currentSnippet.tags },
        {
          tags: snippet.tags
        }
      )

      let reason: Recommendation['reason'] = { kind: 'similar-content' }
      if (currentSnippet.tags && snippet.tags) {
        const commonTags = currentSnippet.tags.filter((tag) => snippet.tags.includes(tag))
        if (commonTags.length > 0) {
          reason = { kind: 'similar-tags', tags: commonTags.slice(0, 2) }
        }
      }

      return {
        id: snippet.slug,
        title: snippet.title,
        description: snippet.description,
        href: `/snippet/${snippet.slug}`,
        type: 'snippet' as const,
        score,
        reason
      }
    })
    .filter((rec) => rec.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (related.length >= limit) return related

  const used = new Set(related.map((r) => r.id))
  const remaining = candidates
    .filter((snippet) => !used.has(snippet.slug))
    .map((snippet) => ({
      id: snippet.slug,
      title: snippet.title,
      description: snippet.description,
      href: `/snippet/${snippet.slug}`,
      type: 'snippet' as const,
      score: 0,
      isFallback: true,
      reason: { kind: 'similar-content' } as const
    }))

  const fallback = stable_pick_by_seed(
    remaining,
    `snippet:${currentSnippetSlug}:${currentLocale}`,
    limit - related.length
  )

  return [...related, ...fallback]
}
