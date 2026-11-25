import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/ai/runtime-config', () => ({ get_ai_runtime_config: vi.fn() }))

vi.mock('@/lib/ai/runtime-provider', () => ({
  runtimeProvider: {
    generateResponse: vi.fn(),
    generateStream: vi.fn()
  }
}))

describe('ai-service runtime response', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires a configured runtime before reporting a provider', async () => {
    const { get_ai_runtime_config } = await import('@/lib/ai/runtime-config')
    const { aiService } = await import('@/lib/ai/ai-service')
    vi.mocked(get_ai_runtime_config).mockResolvedValue(null)
    expect(await aiService.getAvailableProviders()).toEqual([])
    vi.mocked(get_ai_runtime_config).mockResolvedValue({
      apiKey: 'test',
      endpoint: 'https://example.com/v1',
      model: 'test',
      source: 'database'
    })
    expect(await aiService.getAvailableProviders()).toEqual(['runtime'])
  })

  it('returns the response from the configured runtime provider', async () => {
    const { runtimeProvider } = await import('@/lib/ai/runtime-provider')
    vi.mocked(runtimeProvider.generateResponse).mockResolvedValue('hello from runtime')

    const { aiService } = await import('@/lib/ai/ai-service')
    const response = await aiService.generateResponse('hi', {
      currentPage: '/test',
      locale: 'en'
    })

    expect(response).toBe('hello from runtime')
    expect(runtimeProvider.generateResponse).toHaveBeenCalledWith('hi', {
      currentPage: '/test',
      locale: 'en'
    })
  })
})
