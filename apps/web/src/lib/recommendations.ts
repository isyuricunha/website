import { allPosts } from 'content-collections'
import { allProjects } from 'content-collections'

export type RecommendationType = 'post' | 'project'

export interface Recommendation {
  id: string
  title: string
  description: string
  href: string
  type: RecommendationType
  score: number
  reason: string
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
    const commonTags = item1.tags.filter(tag => item2.tags!.includes(tag))
    score += commonTags.length * 2
  }
  
  return score
}

/**
 * Get recommended posts based on current post
 */
export function getRecommendedPosts(
  currentPostSlug: string,
  limit: number = 3
): Recommendation[] {
  const currentPost = allPosts.find(post => post.slug === currentPostSlug)
  if (!currentPost) return []
  
  const recommendations = allPosts
    .filter(post => post.slug !== currentPostSlug)
    .map(post => {
      const score = calculateSimilarity(currentPost, post)
      let reason = 'Similar content'
      
      if (currentPost.category === post.category) {
        reason = `Same category: ${post.category}`
      } else if (currentPost.tags && post.tags) {
        const commonTags = currentPost.tags.filter(tag => post.tags!.includes(tag))
        if (commonTags.length > 0) {
          reason = `Similar tags: ${commonTags.slice(0, 2).join(', ')}`
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
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  
  return recommendations
}

/**
 * Get recommended projects based on current project
 */
export function getRecommendedProjects(
  currentProjectSlug: string,
  limit: number = 3
): Recommendation[] {
  const currentProject = allProjects.find(project => project.slug === currentProjectSlug)
  if (!currentProject) return []
  
  const recommendations = allProjects
    .filter(project => project.slug !== currentProjectSlug)
    .map(project => {
      const score = calculateSimilarity(
        { tags: currentProject.techstack, category: currentProject.category },
        { tags: project.techstack, category: project.category }
      )
      
      let reason = 'Similar project'
      
      if (currentProject.category === project.category) {
        reason = `Same category: ${project.category}`
      } else {
        const commonTech = currentProject.techstack.filter(tech => 
          project.techstack.includes(tech)
        )
        if (commonTech.length > 0) {
          reason = `Similar tech: ${commonTech.slice(0, 2).join(', ')}`
        }
      }
      
      return {
        id: project.slug,
        title: project.name,
        description: project.description,
        href: `/projects/${project.slug}`,
        type: 'project' as const,
        score,
        reason
      }
    })
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  
  return recommendations
}

/**
 * Get mixed recommendations (posts + projects) based on search query
 */
export function getSearchRecommendations(
  searchQuery: string,
  limit: number = 4
): Recommendation[] {
  if (!searchQuery.trim()) return []
  
  const query = searchQuery.toLowerCase()
  const recommendations: Recommendation[] = []
  
  // Search in posts
  allPosts.forEach(post => {
    let score = 0
    let reason = 'Related content'
    
    // Title match (highest priority)
    if (post.title.toLowerCase().includes(query)) {
      score += 5
      reason = 'Title match'
    }
    
    // Summary match
    if (post.summary.toLowerCase().includes(query)) {
      score += 3
      reason = 'Content match'
    }
    
    // Category match
    if (post.category?.toLowerCase().includes(query)) {
      score += 4
      reason = `Category: ${post.category}`
    }
    
    // Tag match
    if (post.tags?.some(tag => tag.toLowerCase().includes(query))) {
      score += 2
      const matchingTags = post.tags.filter(tag => 
        tag.toLowerCase().includes(query)
      )
      reason = `Tags: ${matchingTags.slice(0, 2).join(', ')}`
    }
    
    if (score > 0) {
      recommendations.push({
        id: post.slug,
        title: post.title,
        description: post.summary,
        href: `/blog/${post.slug}`,
        type: 'post',
        score,
        reason
      })
    }
  })
  
  // Search in projects
  allProjects.forEach(project => {
    let score = 0
    let reason = 'Related project'
    
    // Name match
    if (project.name.toLowerCase().includes(query)) {
      score += 5
      reason = 'Name match'
    }
    
    // Description match
    if (project.description.toLowerCase().includes(query)) {
      score += 3
      reason = 'Description match'
    }
    
    // Category match
    if (project.category?.toLowerCase().includes(query)) {
      score += 4
      reason = `Category: ${project.category}`
    }
    
    // Tech stack match
    if (project.techstack.some(tech => tech.toLowerCase().includes(query))) {
      score += 2
      const matchingTech = project.techstack.filter(tech => 
        tech.toLowerCase().includes(query)
      )
      reason = `Tech: ${matchingTech.slice(0, 2).join(', ')}`
    }
    
    if (score > 0) {
      recommendations.push({
        id: project.slug,
        title: project.name,
        description: project.description,
        href: `/projects/${project.slug}`,
        type: 'project',
        score,
        reason
      })
    }
  })
  
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Get trending/popular content (based on featured flag and recent dates)
 */
export function getTrendingRecommendations(limit: number = 4): Recommendation[] {
  const recommendations: Recommendation[] = []
  
  // Featured posts get priority
  const featuredPosts = allPosts
    .filter(post => post.featured)
    .slice(0, 2)
    .map(post => ({
      id: post.slug,
      title: post.title,
      description: post.summary,
      href: `/blog/${post.slug}`,
      type: 'post' as const,
      score: 10,
      reason: 'Featured post'
    }))
  
  // Featured projects
  const featuredProjects = allProjects
    .filter(project => project.featured)
    .slice(0, 2)
    .map(project => ({
      id: project.slug,
      title: project.name,
      description: project.description,
      href: `/projects/${project.slug}`,
      type: 'project' as const,
      score: 10,
      reason: 'Featured project'
    }))
  
  recommendations.push(...featuredPosts, ...featuredProjects)
  
  // Fill remaining with recent posts if needed
  if (recommendations.length < limit) {
    const recentPosts = allPosts
      .filter(post => !post.featured)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit - recommendations.length)
      .map(post => ({
        id: post.slug,
        title: post.title,
        description: post.summary,
        href: `/blog/${post.slug}`,
        type: 'post' as const,
        score: 5,
        reason: 'Recent post'
      }))
    
    recommendations.push(...recentPosts)
  }
  
  return recommendations.slice(0, limit)
}
