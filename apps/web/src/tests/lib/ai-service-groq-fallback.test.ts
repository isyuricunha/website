import { beforeEach, describe, expect, it, vi } from 'vitest'

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
