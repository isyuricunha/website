import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/ai/ai-service', () => ({
  aiService: {
    getAvailableProviders: vi.fn()
  }
}))

describe('/api/ai/chat/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns public Yue AI status when chat is available', async () => {
    const { aiService } = await import('@/lib/ai/ai-service')
    vi.mocked(aiService.getAvailableProviders).mockReturnValue(['internal'])

    const { GET } = await import('@/app/api/ai/chat/status/route')
    const res = GET()
    const json = (await res.json()) as Record<string, unknown>

    expect(json.available).toBe(true)
    expect(json.status).toBe('ready')
    expect(json.assistant).toBe('Yue AI')
    expect(json.displayName).toBe('Yue Mizuki')
    expect(JSON.stringify(json).toLowerCase()).not.toContain('mistral')
  })

  it('returns unavailable status without exposing the internal provider', async () => {
    const { aiService } = await import('@/lib/ai/ai-service')
    vi.mocked(aiService.getAvailableProviders).mockReturnValue([])

    const { GET } = await import('@/app/api/ai/chat/status/route')
    const res = GET()
    const json = (await res.json()) as Record<string, unknown>

    expect(json.available).toBe(false)
    expect(json.status).toBe('unavailable')
    expect(JSON.stringify(json).toLowerCase()).not.toContain('mistral')
  })
})
