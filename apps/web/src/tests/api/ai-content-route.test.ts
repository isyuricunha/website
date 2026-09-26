import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
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

vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: vi.fn()
}))

vi.mock('@/lib/ai/ai-service', () => ({
  aiService: {
    getAvailableProviders: vi.fn(),
    generateTags: vi.fn(),
    generateSummary: vi.fn(),
    generateMetaDescription: vi.fn(),
    translateContent: vi.fn(),
    isHfAvailable: vi.fn(),
    isHfLocalAvailable: vi.fn(),
    isGeminiAvailable: vi.fn(),
    isGroqAvailable: vi.fn(),
    isOllamaAvailable: vi.fn()
  }
}))

describe('/api/ai/content', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when the caller is not an authenticated admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { POST } = await import('@/app/api/ai/content/route')

    vi.mocked(requireAdmin).mockResolvedValue(
      Response.json({ error: 'Unauthorized' }, { status: 401 }) as never
    )

    const req = {
      headers: new Headers(),
      json: async () => ({ action: 'tags', content: 'hello world' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 401 on GET when the caller is not an authenticated admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { aiService } = await import('@/lib/ai/ai-service')
    const { GET } = await import('@/app/api/ai/content/route')

    vi.mocked(requireAdmin).mockResolvedValue(
      Response.json({ error: 'Unauthorized' }, { status: 401 }) as never
    )

    const res = await GET()

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
    // The gate must run before any provider inspection: a compute-then-gate
    // reordering would fail this assertion even if the response stayed 401.
    expect(aiService.getAvailableProviders).not.toHaveBeenCalled()
  })

  it('returns 200 on GET with provider info when the caller is an admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(requireAdmin).mockResolvedValue(null)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['runtime'])

    const { GET } = await import('@/app/api/ai/content/route')

    const res = await GET()

    expect(res.status).toBe(200)
    const json = (await res.json()) as { availableProviders?: string[] }
    expect(json.availableProviders).toEqual(['runtime'])
  })

  it('returns 429 when rate limited', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(requireAdmin).mockResolvedValue(null)
    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

    const { POST } = await import('@/app/api/ai/content/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ action: 'summary', content: 'hello world' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({
      error: 'Rate limit exceeded. Please try again later.'
    })
  })

  it('returns 400 on invalid payload (zod)', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { aiService } = await import('@/lib/ai/ai-service')

    vi.mocked(requireAdmin).mockResolvedValue(null)
    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['ollama'])

    const { POST } = await import('@/app/api/ai/content/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ action: 'meta', content: '' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe('Invalid request format')
  })
})
