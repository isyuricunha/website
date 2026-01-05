import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { aiService } from '@/lib/ai/ai-service'
import { logger } from '@/lib/logger'
import { ratelimit } from '@/lib/ratelimit'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { getClientIp } from '@/lib/spam-detection'

const ContentGenerationSchema = z.object({
  action: z.enum(['tags', 'summary', 'meta', 'translate']),
  content: z.string().min(1),
  title: z.string().optional(),
  existingTags: z.array(z.string()).optional().default([]),
  provider: z.enum(['hf', 'hf_local', 'gemini', 'groq', 'ollama']).optional().default('gemini'),
  fromLang: z.string().optional().default('en'),
  toLang: z.string().optional().default('pt'),
  maxLength: z.number().min(50).max(500).optional().default(200)
})
type ContentResult = string | string[]

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.ai_content(ip))

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if any AI provider is available
    const availableProviders = aiService.getAvailableProviders()
    if (availableProviders.length === 0) {
      return NextResponse.json(
        { error: 'No AI providers are currently available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { action, content, title, existingTags, provider, fromLang, toLang, maxLength } =
      ContentGenerationSchema.parse(body)

    // Check if requested provider is available
    if (!availableProviders.includes(provider)) {
      return NextResponse.json(
        {
          error: `Provider ${provider} is not available. Available: ${availableProviders.join(', ')}`
        },
        { status: 400 }
      )
    }

    switch (action) {
      case 'tags': {
        const result: ContentResult = await aiService.generateTags(content, existingTags, provider)
        return NextResponse.json({
          action,
          result,
          provider,
          timestamp: new Date().toISOString()
        })
      }

      case 'summary': {
        const result: ContentResult = await aiService.generateSummary(content, maxLength, provider)
        return NextResponse.json({
          action,
          result,
          provider,
          timestamp: new Date().toISOString()
        })
      }

      case 'meta': {
        if (!title) {
          return NextResponse.json(
            { error: 'Title is required for meta description generation' },
            { status: 400 }
          )
        }
        const result: ContentResult = await aiService.generateMetaDescription(
          title,
          content,
          provider
        )
        return NextResponse.json({
          action,
          result,
          provider,
          timestamp: new Date().toISOString()
        })
      }

      case 'translate': {
        const result: ContentResult = await aiService.translateContent(
          content,
          fromLang,
          toLang,
          provider
        )
        return NextResponse.json({
          action,
          result,
          provider,
          timestamp: new Date().toISOString()
        })
      }
    }
  } catch (error) {
    logger.error('Content generation API error', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
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
        return NextResponse.json({ error: error.message }, { status: 503 })
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export function GET() {
  const availableProviders = aiService.getAvailableProviders()

  return NextResponse.json({
    message: 'AI Content Generation API',
    actions: ['tags', 'summary', 'meta', 'translate'],
    availableProviders,
    supportedLanguages: ['en', 'pt', 'fr', 'de', 'zh'],
    status: {
      hf: aiService.isHfAvailable(),
      hfLocal: aiService.isHfLocalAvailable(),
      gemini: aiService.isGeminiAvailable(),
      groq: aiService.isGroqAvailable(),
      ollama: aiService.isOllamaAvailable()
    }
  })
}
