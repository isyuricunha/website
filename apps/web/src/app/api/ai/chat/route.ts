import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { aiService } from '@/lib/ai/ai-service'
import { build_navigation_answer, find_citations, get_page_context } from '@/lib/ai/site-index'
import { logger } from '@/lib/logger'
import { ratelimit } from '@/lib/ratelimit'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { getClientIp } from '@/lib/spam-detection'

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
  timestamp: z.string().optional()
})

const requestSchema = z.object({
  message: z.string().min(1).max(2000),
  mode: z.enum(['chat', 'navigate']).optional(),
  provider: z.enum(['gemini', 'ollama']).optional(),
  model: z.string().max(100).optional(),
  locale: z.string().min(2).max(10).optional(),
  context: z
    .object({
      currentPage: z.string().max(500).optional(),
      pagePath: z.string().max(500).optional(),
      previousMessages: z.array(z.string().max(4000)).max(20).optional(),
      conversation: z.array(conversationMessageSchema).max(30).optional(),
      conversationLength: z.number().int().min(0).max(5000).optional(),
      userPreferences: z.record(z.string(), z.unknown()).optional(),
      pageContext: z.record(z.string(), z.unknown()).optional()
    })
    .optional()
})

const create_request_id = (): string => {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

const infer_mode = (message: string): 'chat' | 'navigate' => {
  const m = message.toLowerCase()
  if (m.includes('onde encontro') || m.includes('where can i find') || m.includes('help me navigate')) {
    return 'navigate'
  }
  if (m.startsWith('onde ') || m.startsWith('where ')) {
    return 'navigate'
  }
  return 'chat'
}

export async function POST(req: NextRequest) {
  const started_at = Date.now()
  const request_id = create_request_id()

  try {
    const ip = getClientIp(req.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.ai_chat(ip))

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.', requestId: request_id },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = requestSchema.parse(body)

    const available_providers = aiService.getAvailableProviders()
    if (available_providers.length === 0) {
      return NextResponse.json(
        { error: 'No AI providers are currently available.' },
        { status: 503 }
      )
    }

    const default_provider = available_providers[0]
    if (!default_provider) {
      return NextResponse.json(
        { error: 'No AI providers are currently available.' },
        { status: 503 }
      )
    }

    const requested_provider = parsed.provider
    const provider =
      requested_provider && available_providers.includes(requested_provider)
        ? requested_provider
        : default_provider

    const message = parsed.message.trim()
    const current_page = parsed.context?.currentPage ?? 'unknown'
    const page_path = parsed.context?.pagePath
    const locale = parsed.locale ?? parsed.context?.pageContext?.locale?.toString?.() ?? 'en'

    const mode = parsed.mode ?? infer_mode(message)

    if (mode === 'navigate') {
      const navigation = build_navigation_answer({ query: message, locale })

      return NextResponse.json({
        requestId: request_id,
        message: navigation.message,
        citations: navigation.citations,
        timestamp: new Date().toISOString(),
        provider: 'navigation',
        latencyMs: Date.now() - started_at
      })
    }

    const citations = find_citations({ message, locale, page_path: page_path, limit: 5 })
    const page_context = page_path ? get_page_context(page_path, locale) : null

    const response_text = await aiService.generateResponse(
      message,
      {
        currentPage: current_page,
        pagePath: page_path,
        pageContext: page_context,
        citations,
        conversation: parsed.context?.conversation,
        locale
      },
      {
        provider,
        model: parsed.model
      }
    )

    return NextResponse.json({
      requestId: request_id,
      message: response_text,
      citations,
      timestamp: new Date().toISOString(),
      provider,
      latencyMs: Date.now() - started_at
    })
  } catch (error) {
    logger.error('AI chat error', error, { requestId: request_id })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues, requestId: request_id },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        requestId: request_id,
        message:
          'Oops! Something went wrong on my end. Let me know if you need help with anything else!',
        isError: true,
        latencyMs: Date.now() - started_at
      },
      { status: 500 }
    )
  }
}
