import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog/blog-service'
import { ratelimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { getClientIp } from '@/lib/spam-detection'
import { z } from 'zod'

const postBodySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional().default(''),
  content: z.string().min(1),
  locale: z.string().min(1),
  date: z.string().optional(),
  modifiedTime: z.string().optional()
})

const deleteQuerySchema = z.object({
  slug: z.string().min(1),
  locale: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.admin_posts_create(ip))

    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = postBodySchema.parse(body)
    const { slug, title, summary, content, locale, date, modifiedTime } = parsed

    // Check if post already exists
    const exists = await BlogService.postExists(slug, locale)
    if (exists) {
      return NextResponse.json({ error: 'Post already exists in this locale' }, { status: 409 })
    }

    // Save the post
    const saveSuccess = await BlogService.savePost({
      slug,
      title,
      summary,
      content,
      locale,
      date: date || new Date().toISOString(),
      modifiedTime: modifiedTime || new Date().toISOString()
    })

    if (!saveSuccess) {
      return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      slug,
      locale
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      )
    }

    logger.error('Error creating post', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.admin_posts_update(ip))

    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = postBodySchema.parse(body)
    const { slug, title, summary, content, locale, modifiedTime } = parsed

    // Check if post exists
    const existingPost = await BlogService.getPost(slug, locale)
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Update the post
    const updateSuccess = await BlogService.savePost({
      slug,
      title,
      summary,
      content,
      locale,
      date: existingPost.date, // Keep original date
      modifiedTime: modifiedTime || new Date().toISOString()
    })

    if (!updateSuccess) {
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      slug,
      locale
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      )
    }

    logger.error('Error updating post', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.admin_posts_delete(ip))

    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const locale = searchParams.get('locale')

    const parsed = deleteQuerySchema.parse({ slug, locale })

    // Check if post exists
    const exists = await BlogService.postExists(parsed.slug, parsed.locale)
    if (!exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Delete the post
    const deleteSuccess = await BlogService.deletePost(parsed.slug, parsed.locale)

    if (!deleteSuccess) {
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      slug: parsed.slug,
      locale: parsed.locale
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      )
    }

    logger.error('Error deleting post', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
