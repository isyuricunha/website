import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog/blog-service'
import { AIService } from '@/lib/ai/ai-service'
import { ratelimit } from '@/lib/ratelimit'

const SUPPORTED_LOCALES = ['en', 'pt', 'fr', 'de', 'ja', 'zh']

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
        const translatedTitle = await AIService.generateContent(
          `Translate this title to ${getLanguageName(targetLocale)}: "${sourcePost.title}"`,
          { 
            provider, 
            model: provider === 'ollama' ? 'yue-f' : undefined 
          },
          {
            currentPage: 'admin',
            userAgent: 'Admin Translation System',
            language: targetLocale
          }
        )

        // Translate summary
        const translatedSummary = await AIService.generateContent(
          `Translate this summary to ${getLanguageName(targetLocale)}: "${sourcePost.summary}"`,
          { 
            provider, 
            model: provider === 'ollama' ? 'yue-f' : undefined 
          },
          {
            currentPage: 'admin',
            userAgent: 'Admin Translation System',
            language: targetLocale
          }
        )

        // Translate content
        const translatedContent = await AIService.generateContent(
          `Translate this blog post content to ${getLanguageName(targetLocale)}. Maintain all markdown formatting, links, and structure:\n\n${sourcePost.content}`,
          { 
            provider, 
            model: provider === 'ollama' ? 'yue-f' : undefined 
          },
          {
            currentPage: 'admin',
            userAgent: 'Admin Translation System',
            language: targetLocale
          }
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
        console.error(`Translation error for ${targetLocale}:`, error)
        results.push({ 
          locale: targetLocale, 
          success: false, 
          error: 'Translation failed' 
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount > 0,
      message: `Translated ${successCount}/${totalCount} languages successfully`,
      results,
      slug,
      sourceLocale
    })

  } catch (error) {
    console.error('Error in translation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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
