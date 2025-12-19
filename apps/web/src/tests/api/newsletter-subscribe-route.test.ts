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

vi.mock('@/lib/resend-service', () => ({
  resendService: {
    listAudiences: vi.fn(),
    getMainAudienceId: vi.fn(),
    findContactByEmail: vi.fn(),
    addContact: vi.fn()
  }
}))

describe('/api/newsletter/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 429 when rate limited', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

    const { POST } = await import('@/app/api/newsletter/subscribe/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ email: 'a@b.com' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({
      error: 'Rate limit exceeded. Please try again later.'
    })
  })

  it('returns 400 on invalid email', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

    const { POST } = await import('@/app/api/newsletter/subscribe/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ email: 'not-an-email' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe('Invalid email address')
  })

  it('returns 500 when no newsletter audience is available', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { resendService } = await import('@/lib/resend-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(resendService.getMainAudienceId).mockResolvedValue(null as never)

    const { POST } = await import('@/app/api/newsletter/subscribe/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ email: 'a@b.com' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'No newsletter audience available' })
  })

  it('returns 200 on successful subscription', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { resendService } = await import('@/lib/resend-service')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(resendService.getMainAudienceId).mockResolvedValue('aud-1' as never)
    vi.mocked(resendService.findContactByEmail).mockResolvedValue(null as never)
    vi.mocked(resendService.addContact).mockResolvedValue({ id: 'c-1' } as never)

    const { POST } = await import('@/app/api/newsletter/subscribe/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ email: 'a@b.com' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      message: 'Successfully subscribed to newsletter'
    })
  })
})
