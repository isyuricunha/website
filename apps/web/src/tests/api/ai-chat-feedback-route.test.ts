import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/env', () => ({
  flags: {
    comment: false,
    auth: false,
    stats: false,
    lastfm: false,
    lastfmImport: false,
    analytics: false,
    guestbookNotification: false,
    likeButton: false,
    turnstile: false
  },
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://user:pass@localhost:5432/test',
    UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'test-token',
    RESEND_API_KEY: 're_test_key'
  }
}))

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

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn()
}))

const feedbackDb = {
  insert: vi.fn(() => ({
    values: vi.fn(async () => {
      return
    })
  }))
}

describe('/api/ai/chat/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 429 when rate limited', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

    const { aiFeedbackPost } = await import('@isyuricunha/trpc-server/server/ai/feedback')

    const req = new Request('http://test/api/ai/chat/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requestId: 'r1', messageId: 'm1', rating: 'like' })
    })

    const res = await aiFeedbackPost(req, { db: feedbackDb })
    expect(res.status).toBe(429)

    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe('Rate limit exceeded. Please try again later.')
    expect(ratelimit.limit).toHaveBeenCalledWith('ai:chat:feedback:1.2.3.4')
  })

  it('returns 400 on invalid payload (zod)', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

    const { aiFeedbackPost } = await import('@isyuricunha/trpc-server/server/ai/feedback')

    const req = new Request('http://test/api/ai/chat/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requestId: '', messageId: '', rating: 'like' })
    })

    const res = await aiFeedbackPost(req, { db: feedbackDb })
    expect(res.status).toBe(400)

    const json = (await res.json()) as { error?: string; details?: unknown }
    expect(json.error).toBe('Invalid request format')
    expect(json.details).toBeTruthy()
  })

  it('persists feedback and returns 200', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { getSession } = await import('@/lib/auth')
    const db = feedbackDb as never

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u1' } } as never)

    const { aiFeedbackPost } = await import('@isyuricunha/trpc-server/server/ai/feedback')

    const req = new Request('http://test/api/ai/chat/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        requestId: 'r1',
        messageId: 'm1',
        rating: 'dislike',
        comment: 'bad',
        pagePath: '/en',
        provider: 'gemini',
        model: 'g',
        locale: 'en'
      })
    })

    const res = await aiFeedbackPost(req, { db: feedbackDb })
    expect(res.status).toBe(200)

    const json = (await res.json()) as { success?: boolean }
    expect(json.success).toBe(true)

    expect(vi.mocked(db.insert)).toHaveBeenCalled()
  })
})
