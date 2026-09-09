import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock('@isyuricunha/kv', () => ({
  redis: {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn()
  },
  redisKeys: {
    newsletterConfirm: (token: string) => `newsletter:confirm:${token}`
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

vi.mock('@/lib/resend-service', () => ({
  resendService: {
    getMainAudienceId: vi.fn(),
    findContactByEmail: vi.fn(),
    addContact: vi.fn(),
    updateContact: vi.fn()
  }
}))

describe('/api/newsletter/confirm (double opt-in)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const makeRequest = (token?: string) =>
    new Request(
      `https://yuricunha.com/api/newsletter/confirm${token ? `?token=${token}` : ''}`
    ) as unknown as Parameters<typeof import('@/app/api/newsletter/confirm/route').GET>[0]

  const setup = async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { resendService } = await import('@/lib/resend-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(resendService.getMainAudienceId).mockResolvedValue('aud-1')
    vi.mocked(resendService.findContactByEmail).mockResolvedValue(null)
    vi.mocked(resendService.addContact).mockResolvedValue({ id: 'c-1' })
    vi.mocked(resendService.updateContact).mockResolvedValue({ id: 'c-1' })

    return { resendService }
  }

  it('returns 400 when the token is missing', async () => {
    await setup()
    const { GET } = await import('@/app/api/newsletter/confirm/route')

    const res = await GET(makeRequest())
    expect(res.status).toBe(400)
  })

  it('returns 400 when the token is unknown or expired', async () => {
    const { redis } = await import('@isyuricunha/kv')
    vi.mocked(redis.get).mockResolvedValue(null)

    await setup()
    const { GET } = await import('@/app/api/newsletter/confirm/route')

    const res = await GET(makeRequest('bad-token'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid or expired confirmation token' })
  })

  it('adds the contact and burns the token on success', async () => {
    const { redis, redisKeys } = await import('@isyuricunha/kv')
    const { resendService } = await setup()

    vi.mocked(redis.get).mockResolvedValue('a@b.com')

    const { GET } = await import('@/app/api/newsletter/confirm/route')

    const res = await GET(makeRequest('good-token'))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      message: 'Successfully subscribed to newsletter'
    })
    expect(resendService.addContact).toHaveBeenCalledWith('aud-1', {
      email: 'a@b.com',
      unsubscribed: false
    })
    // Single-use token.
    expect(redis.del).toHaveBeenCalledWith(redisKeys.newsletterConfirm('good-token'))
  })

  it('re-enables a previously unsubscribed contact', async () => {
    const { redis } = await import('@isyuricunha/kv')
    const { resendService } = await setup()

    vi.mocked(redis.get).mockResolvedValue('a@b.com')
    vi.mocked(resendService.findContactByEmail).mockResolvedValue({
      id: 'c-existing',
      email: 'a@b.com',
      unsubscribed: true
    })

    const { GET } = await import('@/app/api/newsletter/confirm/route')

    const res = await GET(makeRequest('good-token'))
    expect(res.status).toBe(200)
    expect(resendService.updateContact).toHaveBeenCalledWith('aud-1', 'c-existing', {
      unsubscribed: false
    })
    expect(resendService.addContact).not.toHaveBeenCalled()
  })

  it('burns the token and reports success for an already-subscribed email', async () => {
    const { redis } = await import('@isyuricunha/kv')
    const { resendService } = await setup()

    vi.mocked(redis.get).mockResolvedValue('a@b.com')
    vi.mocked(resendService.findContactByEmail).mockResolvedValue({
      id: 'c-existing',
      email: 'a@b.com',
      unsubscribed: false
    })

    const { GET } = await import('@/app/api/newsletter/confirm/route')

    const res = await GET(makeRequest('good-token'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, message: 'Email is already subscribed' })
    expect(redis.del).toHaveBeenCalled()
    expect(resendService.addContact).not.toHaveBeenCalled()
  })
})
