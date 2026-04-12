import { NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog/blog-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'

  try {
    const posts = await BlogService.getPostsByLocale(locale)
    if (posts.length === 0) {
      return NextResponse.json({ post: null })
    }

    const latest = posts[0]
    if (!latest) {
      return NextResponse.json({ post: null })
    }

    return NextResponse.json({
      post: {
        slug: latest.slug,
        title: latest.title,
        date: latest.date
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch latest post' }, { status: 500 })
  }
}
