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
    findContactByEmail: vi.fn(),
    updateContact: vi.fn()
  }
}))

describe('/api/newsletter/unsubscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 429 when rate limited', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

    const { POST } = await import('@/app/api/newsletter/unsubscribe/route')

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

    const { POST } = await import('@/app/api/newsletter/unsubscribe/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ email: 'not-an-email' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe('Invalid email address')
  })
})
