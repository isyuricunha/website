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

  it('falls back to first available provider when requested provider is unavailable', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['ollama'])
    vi.mocked(aiService.generateResponse).mockResolvedValue('ok')

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        message: 'hello',
        provider: 'gemini',
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
    expect(json.provider).toBe('ollama')
    expect(typeof json.latencyMs).toBe('number')
    expect(typeof json.requestId).toBe('string')
    expect(json.citations).toBeTruthy()

    expect(aiService.generateResponse).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({
        currentPage: '/test',
        locale: 'pt'
      }),
      { provider: 'ollama', model: undefined }
    )
  })

  it('uses requested provider when available', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['gemini', 'ollama'])
    vi.mocked(aiService.generateResponse).mockResolvedValue('ok')

    const { POST } = await import('@/app/api/ai/chat/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        message: 'hello',
        provider: 'ollama',
        locale: 'en',
        context: { currentPage: '/test' }
      })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    const json = (await res.json()) as {
      provider: string
      requestId?: string
    }

    expect(res.status).toBe(200)
    expect(json.provider).toBe('ollama')
    expect(typeof json.requestId).toBe('string')

    expect(aiService.generateResponse).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({
        currentPage: '/test',
        locale: 'en'
      }),
      { provider: 'ollama', model: undefined }
    )
  })

  it('tries providers in order until one succeeds', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['hf', 'hf_local', 'gemini'])
    vi.mocked(aiService.generateResponse)
      .mockRejectedValueOnce(new Error('hf failed'))
      .mockResolvedValueOnce('ok-local')

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
    const json = (await res.json()) as { message: string; provider: string }

    expect(res.status).toBe(200)
    expect(json.message).toBe('ok-local')
    expect(json.provider).toBe('hf_local')

    expect(aiService.generateResponse).toHaveBeenCalledTimes(2)
    expect(aiService.generateResponse).toHaveBeenNthCalledWith(
      1,
      'hello',
      expect.anything(),
      expect.objectContaining({ provider: 'hf' })
    )
    expect(aiService.generateResponse).toHaveBeenNthCalledWith(
      2,
      'hello',
      expect.anything(),
      expect.objectContaining({ provider: 'hf_local' })
    )
  })
})
