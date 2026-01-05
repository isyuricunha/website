import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { aiService } from '@/lib/ai/ai-service'
import { estimate_tokens, record_ai_chat_observability } from '@/lib/ai/ai-observability'
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
  provider: z.enum(['hf', 'hf_local', 'gemini', 'ollama']).optional(),
  model: z.string().max(100).optional(),
  stream: z.boolean().optional(),
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
    return (
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    )
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

const infer_mode = (message: string): 'chat' | 'navigate' => {
  const m = message.toLowerCase()
  if (
    m.includes('onde encontro') ||
    m.includes('where can i find') ||
    m.includes('help me navigate')
  ) {
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
  const endpoint = '/api/ai/chat'
  const method = 'POST'
  const user_agent = req.headers.get('user-agent') ?? undefined

  const response_headers = {
    'x-request-id': request_id
  }

  const byte_length = (value: string): number => {
    return Buffer.byteLength(value, 'utf8')
  }

  try {
    const ip = getClientIp(req.headers)
    const { success } = await ratelimit.limit(rate_limit_keys.ai_chat(ip))

    if (!success) {
      const payload = {
        error: 'Rate limit exceeded. Please try again later.',
        requestId: request_id
      }
      await record_ai_chat_observability({
        requestId: request_id,
        endpoint,
        method,
        statusCode: 429,
        responseTimeMs: Date.now() - started_at,
        provider: 'n/a',
        mode: 'n/a',
        ipAddress: ip,
        userAgent: user_agent,
        responseSizeBytes: byte_length(JSON.stringify(payload)),
        errorMessage: 'rate_limited'
      })
      return NextResponse.json(payload, { status: 429, headers: response_headers })
    }

    const body = await req.json()
    const parsed = requestSchema.parse(body)
    const request_size = byte_length(JSON.stringify(body))

    const available_providers = aiService.getAvailableProviders()
    if (available_providers.length === 0) {
      const payload = { error: 'No AI providers are currently available.', requestId: request_id }
      await record_ai_chat_observability({
        requestId: request_id,
        endpoint,
        method,
        statusCode: 503,
        responseTimeMs: Date.now() - started_at,
        provider: 'n/a',
        mode: 'n/a',
        model: parsed.model,
        ipAddress: ip,
        userAgent: user_agent,
        requestSizeBytes: request_size,
        responseSizeBytes: byte_length(JSON.stringify(payload)),
        errorMessage: 'no_providers'
      })
      return NextResponse.json(payload, { status: 503, headers: response_headers })
    }

    const default_provider = available_providers[0]
    if (!default_provider) {
      const payload = { error: 'No AI providers are currently available.', requestId: request_id }
      await record_ai_chat_observability({
        requestId: request_id,
        endpoint,
        method,
        statusCode: 503,
        responseTimeMs: Date.now() - started_at,
        provider: 'n/a',
        mode: 'n/a',
        model: parsed.model,
        ipAddress: ip,
        userAgent: user_agent,
        requestSizeBytes: request_size,
        responseSizeBytes: byte_length(JSON.stringify(payload)),
        errorMessage: 'no_default_provider'
      })
      return NextResponse.json(payload, { status: 503, headers: response_headers })
    }

    const requested_provider = parsed.provider
    const primary_provider =
      requested_provider && available_providers.includes(requested_provider)
        ? requested_provider
        : default_provider

    const provider_candidates = (() => {
      if (!primary_provider) return [] as typeof available_providers

      if (requested_provider && requested_provider !== primary_provider) {
        return [primary_provider, ...available_providers.filter((p) => p !== primary_provider)]
      }

      if (requested_provider) {
        return [requested_provider, ...available_providers.filter((p) => p !== requested_provider)]
      }

      return available_providers
    })()

    const message = parsed.message.trim()
    const current_page = parsed.context?.currentPage ?? 'unknown'
    const page_path = parsed.context?.pagePath
    const locale = parsed.locale ?? parsed.context?.pageContext?.locale?.toString?.() ?? 'en'

    const mode = parsed.mode ?? infer_mode(message)

    if (mode === 'navigate') {
      const navigation = build_navigation_answer({ query: message, locale })

      const payload = {
        requestId: request_id,
        message: navigation.message,
        citations: navigation.citations,
        timestamp: new Date().toISOString(),
        provider: 'navigation',
        latencyMs: Date.now() - started_at
      }

      await record_ai_chat_observability({
        requestId: request_id,
        endpoint,
        method,
        statusCode: 200,
        responseTimeMs: Date.now() - started_at,
        provider: 'navigation',
        mode,
        ipAddress: ip,
        userAgent: user_agent,
        requestSizeBytes: request_size,
        responseSizeBytes: byte_length(JSON.stringify(payload)),
        tokensEstimated: estimate_tokens(message) + estimate_tokens(navigation.message)
      })

      return NextResponse.json(payload, { status: 200, headers: response_headers })
    }

    const citations = find_citations({ message, locale, page_path: page_path, limit: 5 })
    const page_context = page_path ? get_page_context(page_path, locale) : null

    const stream_requested = parsed.stream === true

    const selected_provider_for_stream = provider_candidates[0]

    if (stream_requested && selected_provider_for_stream === 'ollama') {
      const stream = await aiService.generateOllamaStream(
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
          provider: 'ollama',
          model: parsed.model
        }
      )

      const response_headers_stream = {
        ...response_headers,
        'content-type': 'text/plain; charset=utf-8',
        'x-provider': 'ollama'
      }

      await record_ai_chat_observability({
        requestId: request_id,
        endpoint,
        method,
        statusCode: 200,
        responseTimeMs: Date.now() - started_at,
        provider: 'ollama',
        mode,
        model: parsed.model,
        ipAddress: ip,
        userAgent: user_agent,
        requestSizeBytes: request_size
      })

      return new Response(stream, { status: 200, headers: response_headers_stream })
    }

    const response_text = await (async () => {
      let last_error: unknown = null

      for (const candidate of provider_candidates) {
        try {
          const text = await aiService.generateResponse(
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
              provider: candidate,
              model: parsed.model
            }
          )
          return { text, provider: candidate }
        } catch (error) {
          last_error = error
        }
      }

      throw last_error instanceof Error ? last_error : new Error('AI provider failed')
    })()

    const payload = {
      requestId: request_id,
      message: response_text.text,
      citations,
      timestamp: new Date().toISOString(),
      provider: response_text.provider,
      latencyMs: Date.now() - started_at
    }

    await record_ai_chat_observability({
      requestId: request_id,
      endpoint,
      method,
      statusCode: 200,
      responseTimeMs: Date.now() - started_at,
      provider: response_text.provider,
      mode,
      model: parsed.model,
      ipAddress: ip,
      userAgent: user_agent,
      requestSizeBytes: request_size,
      responseSizeBytes: byte_length(JSON.stringify(payload)),
      tokensEstimated: estimate_tokens(message) + estimate_tokens(response_text.text)
    })

    return NextResponse.json(payload, { status: 200, headers: response_headers })
  } catch (error) {
    logger.error('AI chat error', error, { requestId: request_id })

    if (error instanceof z.ZodError) {
      const payload = {
        error: 'Invalid request format',
        details: error.issues,
        requestId: request_id
      }
      await record_ai_chat_observability({
        requestId: request_id,
        endpoint,
        method,
        statusCode: 400,
        responseTimeMs: Date.now() - started_at,
        provider: 'n/a',
        mode: 'n/a',
        userAgent: user_agent,
        responseSizeBytes: byte_length(JSON.stringify(payload)),
        errorMessage: 'zod_error'
      })
      return NextResponse.json(payload, { status: 400, headers: response_headers })
    }

    const payload = {
      requestId: request_id,
      message:
        'Oops! Something went wrong on my end. Let me know if you need help with anything else!',
      isError: true,
      latencyMs: Date.now() - started_at
    }

    await record_ai_chat_observability({
      requestId: request_id,
      endpoint,
      method,
      statusCode: 500,
      responseTimeMs: Date.now() - started_at,
      provider: 'n/a',
      mode: 'n/a',
      userAgent: user_agent,
      responseSizeBytes: byte_length(JSON.stringify(payload)),
      errorMessage: error instanceof Error ? error.message : 'unknown_error'
    })

    return NextResponse.json(payload, { status: 500, headers: response_headers })
  }
}
