import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { aiService } from '@/lib/ai/ai-service'
import { BlogService } from '@/lib/blog/blog-service'
import { logger } from '@/lib/logger'
import { ratelimit } from '@/lib/ratelimit'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { requireAdmin } from '@/lib/admin-auth'
import { getClientIp } from '@/lib/spam-detection'

const SUPPORTED_LOCALES = ['en', 'pt', 'fr', 'de', 'ja', 'zh']

const requestSchema = z.object({
  slug: z.string().min(1),
  sourceLocale: z.string().min(1),
  targetLocales: z.array(z.string().min(1)).optional(),
  provider: z.enum(['gemini', 'ollama']).optional().default('ollama')
})

export async function POST(request: NextRequest) {
  try {
    const authResponse = await requireAdmin()
    if (authResponse) return authResponse

    // Rate limiting
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.admin_translate(ip))

    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = requestSchema.parse(body)
    const { slug, sourceLocale, targetLocales, provider } = parsed

    // Get source post
    const sourcePost = await BlogService.getPost(slug, sourceLocale)
    if (!sourcePost) {
      return NextResponse.json({ error: 'Source post not found' }, { status: 404 })
    }

    // Determine target languages
    const targets = targetLocales || SUPPORTED_LOCALES.filter((locale) => locale !== sourceLocale)
    const results: Array<{ locale: string; success: boolean; error?: string }> = []

    // Translate to each target language
    for (const targetLocale of targets) {
      try {
        // Check if translation already exists
        const existingPost = await BlogService.getPost(slug, targetLocale)
        if (existingPost) {
          results.push({
            locale: targetLocale,
            success: false,
            error: 'Translation already exists'
          })
          continue
        }

        // Translate title
        const translatedTitle = await aiService.translateContent(
          sourcePost.title,
          sourceLocale,
          targetLocale,
          provider
        )

        // Translate summary
        const translatedSummary = await aiService.translateContent(
          sourcePost.summary,
          sourceLocale,
          targetLocale,
          provider
        )

        // Translate content
        const translatedContent = await aiService.translateContent(
          sourcePost.content,
          sourceLocale,
          targetLocale,
          provider
        )

        // Save translated post
        const saveSuccess = await BlogService.savePost({
          slug: sourcePost.slug,
          title: translatedTitle,
          summary: translatedSummary,
          content: translatedContent,
          locale: targetLocale,
          date: sourcePost.date,
          modifiedTime: new Date().toISOString()
        })

        results.push({
          locale: targetLocale,
          success: saveSuccess,
          error: saveSuccess ? undefined : 'Failed to save translation'
        })
      } catch (error) {
        logger.error('Translation error', error, { locale: targetLocale })
        results.push({
          locale: targetLocale,
          success: false,
          error: 'Translation failed'
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount > 0,
      message: `Translated ${successCount}/${totalCount} languages successfully`,
      results,
      slug,
      sourceLocale
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      )
    }

    logger.error('Error in translation', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
