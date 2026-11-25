import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn() } }))

vi.mock('@/lib/ai/ai-service', () => ({
  aiService: {
    getAvailableProviders: vi.fn()
  }
}))

describe('/api/ai/chat/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns public Nery AI status when chat is available', async () => {
    const { aiService } = await import('@/lib/ai/ai-service')
    vi.mocked(aiService.getAvailableProviders).mockResolvedValue(['internal'])

    const { GET } = await import('@/app/api/ai/chat/status/route')
    const res = await GET()
    const json = (await res.json()) as Record<string, unknown>

    expect(json.available).toBe(true)
    expect(json.status).toBe('ready')
    expect(json.assistant).toBe('Nery AI')
    expect(json.displayName).toBe('Nery Mizuki')
    expect(JSON.stringify(json).toLowerCase()).not.toContain('mistral')
  })

  it('reports unavailable when the configuration store fails', async () => {
    const { aiService } = await import('@/lib/ai/ai-service')
    vi.mocked(aiService.getAvailableProviders).mockRejectedValue(
      new Error('private configuration failure')
    )
    const { GET } = await import('@/app/api/ai/chat/status/route')
    const res = await GET()
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(await res.json()).toMatchObject({ available: false, status: 'unavailable' })
  })

  it('returns unavailable status without exposing the internal provider', async () => {
    const { aiService } = await import('@/lib/ai/ai-service')
    vi.mocked(aiService.getAvailableProviders).mockResolvedValue([])

    const { GET } = await import('@/app/api/ai/chat/status/route')
    const res = await GET()
    const json = (await res.json()) as Record<string, unknown>

    expect(json.available).toBe(false)
    expect(json.status).toBe('unavailable')
    expect(JSON.stringify(json).toLowerCase()).not.toContain('mistral')
  })
})
