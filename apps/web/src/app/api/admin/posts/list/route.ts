import { NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog/blog-service'

export async function GET() {
  try {
    const postsBySlug = await BlogService.getPostsBySlug()
    const allPosts = await BlogService.getAllPosts()
    
    return NextResponse.json({
      success: true,
      postsBySlug,
      totalPosts: allPosts.length,
      totalSlugs: Object.keys(postsBySlug).length
    })
  } catch (error) {
    console.error('Error fetching posts list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
