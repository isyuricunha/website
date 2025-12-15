import { allPosts } from 'content-collections'

export interface Recommendation {
  id: string
  title: string
  description: string
  href: string
  type: 'post' | 'project'
  score: number
  reason:
  | { kind: 'similar-content' }
  | { kind: 'same-category'; category: string }
  | { kind: 'similar-tags'; tags: string[] }
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
export function getRecommendedPosts(currentPostSlug: string, limit = 3): Recommendation[] {
  const currentPost = allPosts.find((post) => post.slug === currentPostSlug)
  if (!currentPost) return []
  const currentLocale = currentPost.locale

  const recommendations = allPosts
    .filter((post) => post.slug !== currentPostSlug && post.locale === currentLocale)
    .map((post) => {
      const score = calculateSimilarity(currentPost, post)
      let reason: Recommendation['reason'] = { kind: 'similar-content' }

      if (currentPost.category === post.category) {
        reason = { kind: 'same-category', category: post.category ?? '' }
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

  return recommendations
}
