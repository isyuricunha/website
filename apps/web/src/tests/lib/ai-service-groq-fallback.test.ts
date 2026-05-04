import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/env', () => {
  return {
    env: {
      MISTRAL_API_KEY: 'test-key',
      MISTRAL_BASE_URL: undefined,
      MISTRAL_AGENT_ID: undefined,
      GROQ_API_KEY: undefined,
      GROQ_API_KEY_FALLBACK: undefined,
      GEMINI_API_KEY: undefined,
      GEMINI_MODEL: undefined,
      YUE_LLM_REQUEST_TIMEOUT_MS: undefined,
      OLLAMA_BASE_URL: undefined,
      OLLAMA_MODEL: undefined
    },
    flags: {
      gemini: false,
      groq: false,
      hf: false,
      hfLocal: false,
      ollama: false,
      mistral: true,
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

class MockMistral {
  chat = {
    complete: vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'hello from mistral' } }]
    })
  }
}

vi.mock('@mistralai/mistralai', () => {
  return {
    Mistral: MockMistral
  }
})

describe('ai-service mistral response', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns response from mistral provider', async () => {
    const { aiService } = await import('@/lib/ai/ai-service')

    const response = await aiService.generateResponse('hi', {
      currentPage: '/test',
      locale: 'en'
    })

    expect(response).toBe('hello from mistral')
  })
})
