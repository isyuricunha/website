import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}))

vi.mock('@/lib/ratelimit', () => ({
  ratelimit: {
    limit: vi.fn()
  }
}))

vi.mock('@/lib/spam-detection', () => ({
  getClientIp: vi.fn()
}))

vi.mock('@/lib/ai/site-index', () => ({
  find_citations: vi.fn(() => [
    { id: 'post:hello', title: 'Hello', href: '/en/blog/hello', type: 'post', excerpt: 'hi' }
  ]),
  get_page_context: vi.fn(() => null),
  build_navigation_answer: vi.fn(() => ({
    message: 'nav',
    citations: [{ id: 'page:about', title: 'About', href: '/en/about', type: 'page' }]
  })),
  build_post_recommendation_answer: vi.fn(() => ({
    message: 'rec',
    citations: [{ id: 'post:hello', title: 'Hello', href: '/en/blog/hello', type: 'post' }]
  })),
  build_snippet_recommendation_answer: vi.fn(() => ({
    message: 'rec-snippet',
    citations: [
      { id: 'snippet:hello', title: 'Hello Snippet', href: '/en/snippet/hello', type: 'snippet' }
    ]
  }))
}))

vi.mock('@/lib/ai/ai-observability', () => ({
  estimate_tokens: vi.fn(() => 1),
  record_ai_chat_observability: vi.fn(async () => {
    return
  })
}))

vi.mock('@/lib/ai/ai-service', () => ({
  aiService: {
    getAvailableProviders: vi.fn(),
    generateResponse: vi.fn()
  }
}))

describe('/api/ai/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns recommendations when mode is inferred as recommend', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['gemini'])

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        message: 'me recomenda uma postagem bacana',
        locale: 'pt',
        context: { currentPage: '/test' }
      })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    const json = (await res.json()) as { message?: string; provider?: string; citations?: unknown }

    expect(res.status).toBe(200)
    expect(json.message).toBe('rec')
    expect(json.provider).toBe('recommendations')
    expect(json.citations).toBeTruthy()

    expect(aiService.generateResponse).not.toHaveBeenCalled()
  })

  it('returns snippet recommendations when user asks for snippet/snipper', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')
    const { build_snippet_recommendation_answer } = await import('@/lib/ai/site-index')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['gemini'])

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        message: 'me recomenda um snipper de docker',
        locale: 'pt',
        context: { currentPage: '/test' }
      })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    const json = (await res.json()) as { message?: string; provider?: string; citations?: unknown }

    expect(res.status).toBe(200)
    expect(json.message).toBe('rec-snippet')
    expect(json.provider).toBe('recommendations')
    expect(json.citations).toBeTruthy()

    expect(vi.mocked(build_snippet_recommendation_answer)).toHaveBeenCalled()
  })

  it('uses previous user intent for short follow-up navigation like "direciona então"', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

    const { build_navigation_answer } = await import('@/lib/ai/site-index')
    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        message: 'direciona então',
        locale: 'pt',
        context: {
          currentPage: '/test',
          conversation: [
            {
              role: 'user',
              content: 'fala uma postagem bacana de infra',
              timestamp: new Date().toISOString()
            }
          ]
        }
      })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(vi.mocked(build_navigation_answer)).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'fala uma postagem bacana de infra', locale: 'pt' })
    )
  })

  it('returns 429 when rate limited', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ message: 'hello' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(429)
    const json = (await res.json()) as { error?: string; requestId?: string }
    expect(json.error).toBe('Rate limit exceeded. Please try again later.')
    expect(typeof json.requestId).toBe('string')
    expect(ratelimit.limit).toHaveBeenCalledWith('ai:chat:1.2.3.4')
  })

  it('returns 400 on invalid payload (zod)', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ message: '' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    const json = (await res.json()) as { error?: string; details?: unknown }

    expect(res.status).toBe(400)
    expect(json.error).toBe('Invalid request format')
    expect(json.details).toBeTruthy()
  })

  it('returns Yue AI as the public provider label', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['mistral'])
    vi.mocked(aiService.generateResponse).mockResolvedValue('ok')

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        message: 'hello',
        locale: 'pt',
        context: { currentPage: '/test' }
      })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    const json = (await res.json()) as {
      message: string
      provider: string
      latencyMs: number
      requestId?: string
      citations?: unknown
    }

    expect(res.status).toBe(200)
    expect(json.message).toBe('ok')
    expect(json.provider).toBe('Yue AI')
    expect(typeof json.latencyMs).toBe('number')
    expect(typeof json.requestId).toBe('string')
    expect(json.citations).toBeTruthy()
  })

  it('returns 503 when no providers are available', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue([])

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        message: 'hello',
        locale: 'en',
        context: { currentPage: '/test' }
      })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    const json = (await res.json()) as {
      error: string
      requestId?: string
    }

    expect(res.status).toBe(503)
    expect(json.error).toBe('No AI providers are currently available.')
    expect(typeof json.requestId).toBe('string')
  })

  it('handles provider errors correctly', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['mistral'])
    vi.mocked(aiService.generateResponse).mockRejectedValue(new Error('Provider error'))

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        message: 'hello',
        locale: 'en',
        context: { currentPage: '/test' }
      })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(500)
    const json = (await res.json()) as { message: string; isError?: boolean }
    expect(json.message).toContain('Something went wrong')
    expect(json.isError).toBe(true)
  })
})
