import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog/blog-service'
import { aiService } from '@/lib/ai/ai-service'
import { ratelimit } from '@/lib/ratelimit'
import { translationQueue } from '@/lib/translation-queue'

const SUPPORTED_LOCALES = ['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'hi', 'bn', 'ru', 'ur']

// Disable timeout for translation endpoint
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

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
    const { slug, sourceLocale, targetLocales, provider = 'ollama' } = body

    // Validation
    if (!slug || !sourceLocale) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, sourceLocale' },
        { status: 400 }
      )
    }

    // Get source post
    const sourcePost = await BlogService.getPost(slug, sourceLocale)
    if (!sourcePost) {
      return NextResponse.json(
        { error: 'Source post not found' },
        { status: 404 }
      )
    }

    // Determine target languages
    const targets = targetLocales || SUPPORTED_LOCALES.filter(locale => locale !== sourceLocale)
    
    // Create job for tracking
    const jobId = await translationQueue.createJob(slug, sourceLocale, targets)
    
    console.log('Created translation job:', jobId)
    
    // Start translation in background
    processTranslation(jobId, sourcePost, targets, provider).catch(console.error)
    
    // Return job ID immediately
    return NextResponse.json({
      success: true,
      jobId: jobId,
      message: 'Translation started in background',
      targetCount: targets.length
    })

  } catch (error) {
    console.error('Error in translation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Process translation in background
async function processTranslation(
  jobId: string,
  sourcePost: any,
  targets: string[],
  provider: string
) {
  const sourceLocale = sourcePost.locale
  translationQueue.updateJob(jobId, { status: 'processing' })
  
  for (const targetLocale of targets) {
      try {
        // Check if translation already exists
        const existingPost = await BlogService.postExists(sourcePost.slug, targetLocale)
        if (existingPost) {
          translationQueue.addResult(jobId, {
            locale: targetLocale,
            success: false,
            error: 'Translation already exists'
          })
          continue
        }

        // Create placeholder file first
        await BlogService.savePost({
          slug: sourcePost.slug,
          title: `[Translating...] ${sourcePost.title}`,
          summary: 'Translation in progress...',
          content: 'Translation in progress. Please wait...',
          locale: targetLocale,
          date: sourcePost.date,
          modifiedTime: new Date().toISOString(),
          tags: sourcePost.tags
        })

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

        // Update with translated content
        const saveSuccess = await BlogService.savePost({
          slug: sourcePost.slug,
          title: translatedTitle,
          summary: translatedSummary,
          content: translatedContent,
          locale: targetLocale,
          date: sourcePost.date,
          modifiedTime: new Date().toISOString(),
          tags: sourcePost.tags
        })

        translationQueue.addResult(jobId, {
          locale: targetLocale,
          success: saveSuccess,
          error: saveSuccess ? undefined : 'Failed to save translation'
        })

      } catch (error) {
        console.error(`Translation error for ${targetLocale}:`, error)
        translationQueue.addResult(jobId, {
          locale: targetLocale,
          success: false,
          error: error instanceof Error ? error.message : 'Translation failed'
        })
      }
    }
  
  translationQueue.completeJob(jobId)
}

// Get translation job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  
  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing jobId parameter' },
      { status: 400 }
    )
  }
  
  const job = translationQueue.getJob(jobId)
  
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(job)
}

function getLanguageName(locale: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'pt': 'Portuguese',
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese',
    'zh': 'Chinese'
  }
  return languageNames[locale] || locale
}
