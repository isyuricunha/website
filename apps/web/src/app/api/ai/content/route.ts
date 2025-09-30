import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { aiService, type AIProvider } from '@/lib/ai/ai-service'
import { flags } from '@tszhong0411/env'

// Increase timeout for AI content generation
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

const ContentGenerationSchema = z.object({
  action: z.enum(['tags', 'summary', 'meta', 'translate']),
  content: z.string().min(1),
  title: z.string().optional(),
  existingTags: z.array(z.string()).optional().default([]),
  provider: z.enum(['gemini', 'ollama']).optional().default('gemini'),
  fromLang: z.string().optional().default('en'),
  toLang: z.string().optional().default('pt'),
  maxLength: z.number().min(50).max(500).optional().default(200)
})

export async function POST(request: NextRequest) {
  try {
    // Check if any AI provider is available
    const availableProviders = aiService.getAvailableProviders()
    if (availableProviders.length === 0) {
      return NextResponse.json(
        { error: 'No AI providers are currently available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const {
      action,
      content,
      title,
      existingTags,
      provider,
      fromLang,
      toLang,
      maxLength
    } = ContentGenerationSchema.parse(body)

    // Check if requested provider is available
    if (!availableProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Provider ${provider} is not available. Available: ${availableProviders.join(', ')}` },
        { status: 400 }
      )
    }

    let result: any

    switch (action) {
      case 'tags':
        result = await aiService.generateTags(content, existingTags, provider)
        break

      case 'summary':
        result = await aiService.generateSummary(content, maxLength, provider)
        break

      case 'meta':
        if (!title) {
          return NextResponse.json(
            { error: 'Title is required for meta description generation' },
            { status: 400 }
          )
        }
        result = await aiService.generateMetaDescription(title, content, provider)
        break

      case 'translate':
        result = await aiService.translateContent(content, fromLang, toLang, provider)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      action,
      result,
      provider,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Content generation API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    // Handle specific AI provider errors
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service is temporarily unavailable. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('not available')) {
        return NextResponse.json(
          { error: error.message },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const availableProviders = aiService.getAvailableProviders()
  
  return NextResponse.json({
    message: 'AI Content Generation API',
    actions: ['tags', 'summary', 'meta', 'translate'],
    availableProviders,
    supportedLanguages: ['en', 'pt', 'fr', 'de', 'zh'],
    status: {
      gemini: aiService.isGeminiAvailable(),
      ollama: aiService.isOllamaAvailable()
    }
  })
}
