import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}))

const redisSet = vi.fn()
const redisGet = vi.fn()
const redisDel = vi.fn()

vi.mock('@isyuricunha/kv', () => ({
  redis: {
    set: (...args: unknown[]) => redisSet(...args),
    get: (...args: unknown[]) => redisGet(...args),
    del: (...args: unknown[]) => redisDel(...args)
  },
  redisKeys: {
    newsletterConfirm: (token: string) => `newsletter:confirm:${token}`
  }
}))

vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return {
      emails: {
        send: vi.fn(async () => ({ data: { id: 'msg-1' }, error: null }))
      }
    }
  })
}))

vi.mock('@isyuricunha/env', () => ({
  env: {
    RESEND_API_KEY: 'test-key',
    NEXT_PUBLIC_WEBSITE_URL: 'https://yuricunha.com'
  },
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
  }
}))

vi.mock('@react-email/render', () => ({
  render: vi.fn(async () => '<html>confirmation</html>')
}))

vi.mock('@/lib/ratelimit', () => ({
  ratelimit: {
    limit: vi.fn()
  },
  newsletterRatelimit: {
    limit: vi.fn()
  }
}))

vi.mock('@/lib/spam-detection', () => ({
  getClientIp: vi.fn()
}))

describe('/api/newsletter/subscribe (double opt-in)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const makeRequest = (body: Record<string, unknown>) =>
    ({
      headers: new Headers(),
      json: async () => body
    }) as unknown as Parameters<typeof import('@/app/api/newsletter/subscribe/route').POST>[0]

  it('returns 429 when rate limited', async () => {
    const { newsletterRatelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(newsletterRatelimit.limit).mockResolvedValue({ success: false } as never)

    const { POST } = await import('@/app/api/newsletter/subscribe/route')

    const res = await POST(makeRequest({ email: 'a@b.com' }))

    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({
      error: 'Rate limit exceeded. Please try again later.'
    })
  })

  it('returns 400 on invalid email', async () => {
    const { newsletterRatelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(newsletterRatelimit.limit).mockResolvedValue({ success: true } as never)

    const { POST } = await import('@/app/api/newsletter/subscribe/route')

    const res = await POST(makeRequest({ email: 'not-an-email' }))

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe('Invalid email address')
  })

  it('stores a confirmation token and tells the user to check their inbox', async () => {
    const { newsletterRatelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { redisKeys } = await import('@isyuricunha/kv')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(newsletterRatelimit.limit).mockResolvedValue({ success: true } as never)
    redisSet.mockResolvedValue('OK')

    const { POST } = await import('@/app/api/newsletter/subscribe/route')

    const res = await POST(makeRequest({ email: 'a@b.com' }))

    expect(res.status).toBe(200)
    const json = (await res.json()) as { success: boolean }
    expect(json.success).toBe(true)

    // Token stored for single-use confirmation with TTL.
    expect(redisSet).toHaveBeenCalledTimes(1)
    const [key, value, options] = redisSet.mock.calls[0] as [string, string, { ex: number }]
    expect(key).toMatch(/^newsletter:confirm:/)
    expect(typeof value).toBe('string')
    expect(options?.ex).toBe(60 * 60 * 24)
    expect(redisKeys.newsletterConfirm('x')).toBeTruthy()
  })

  it('does NOT add the contact to the audience on subscribe', async () => {
    const { newsletterRatelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(newsletterRatelimit.limit).mockResolvedValue({ success: true } as never)

    const { POST } = await import('@/app/api/newsletter/subscribe/route')
    await POST(makeRequest({ email: 'a@b.com' }))

    redisSet.mockResolvedValue('OK')

    const res = await POST(makeRequest({ email: 'a@b.com' }))

    // Double opt-in contract: the response directs the user to their inbox and
    // a confirmation token is stored instead of writing to the audience.
    const json = (await res.json()) as { message: string }
    expect(json.message).toMatch(/confirm/i)
    expect(redisSet).toHaveBeenCalledWith(
      expect.stringMatching(/^newsletter:confirm:/),
      'a@b.com',
      expect.objectContaining({ ex: 60 * 60 * 24 })
    )
  })
})
