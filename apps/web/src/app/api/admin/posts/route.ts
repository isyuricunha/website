import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog/blog-service'
import { ratelimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { slug, title, summary, content, locale, date, modifiedTime, tags } = body

    // Validation
    if (!slug || !title || !content || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, content, locale' },
        { status: 400 }
      )
    }

    // Check if post already exists
    const exists = await BlogService.postExists(slug, locale)
    if (exists) {
      return NextResponse.json(
        { error: 'Post already exists in this locale' },
        { status: 409 }
      )
    }

    // Save the post
    const success = await BlogService.savePost({
      slug,
      title,
      summary: summary || '',
      content,
      locale,
      date: date || new Date().toISOString(),
      modifiedTime: modifiedTime || new Date().toISOString()
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      slug,
      locale
    })

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { slug, title, summary, content, locale, modifiedTime } = body

    // Validation
    if (!slug || !title || !content || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, content, locale' },
        { status: 400 }
      )
    }

    // Check if post exists
    const existingPost = await BlogService.getPost(slug, locale)
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Update the post
    const updateSuccess = await BlogService.savePost({
      slug,
      title,
      summary: summary || '',
      content,
      locale,
      date: existingPost.date, // Keep original date
      modifiedTime: modifiedTime || new Date().toISOString()
    })

    if (!updateSuccess) {
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      slug,
      locale
    })

  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const locale = searchParams.get('locale')

    if (!slug || !locale) {
      return NextResponse.json(
        { error: 'Missing required parameters: slug, locale' },
        { status: 400 }
      )
    }

    // Check if post exists
    const exists = await BlogService.postExists(slug, locale)
    if (!exists) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Delete the post
    const deleteSuccess = await BlogService.deletePost(slug, locale)

    if (!deleteSuccess) {
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      slug,
      locale
    })

  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
