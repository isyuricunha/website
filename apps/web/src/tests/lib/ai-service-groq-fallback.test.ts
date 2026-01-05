import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/env', () => {
  return {
    env: {
      GROQ_API_KEY: 'key_primary',
      GROQ_API_KEY_FALLBACK: 'key_fallback',
      GROQ_MODEL: undefined,
      GEMINI_API_KEY: undefined,
      GEMINI_MODEL: undefined,
      YUE_LLM_REQUEST_TIMEOUT_MS: undefined,
      OLLAMA_BASE_URL: undefined,
      OLLAMA_MODEL: undefined
    },
    flags: {
      gemini: false,
      groq: true,
      hf: false,
      hfLocal: false,
      ollama: false,
      comment: false,
      auth: false,
      stats: false,
      spotify: false,
      spotifyImport: false,
      analytics: false,
      guestbookNotification: false,
      likeButton: false,
      turnstile: false
    }
  }
})

describe('ai-service groq key fallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('tries GROQ_API_KEY_FALLBACK when primary key hits rate limit', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ choices: [{ message: { content: 'hello' } }] })
      })

    vi.stubGlobal('fetch', fetchMock)

    const { aiService } = await import('@/lib/ai/ai-service')

    const response = await aiService.generateResponse(
      'hi',
      {
        currentPage: '/test',
        locale: 'en'
      },
      { provider: 'groq' }
    )

    expect(response).toBe('hello')
    expect(fetchMock).toHaveBeenCalledTimes(2)

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer key_primary' })
      })
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer key_fallback' })
      })
    )
  })
})
