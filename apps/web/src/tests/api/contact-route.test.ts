import { beforeEach, describe, expect, it, vi } from 'vitest'

const send = vi.fn()

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  }
}))

vi.mock('@isyuricunha/env', () => ({
  env: {
    RESEND_API_KEY: 'test-key',
    TURNSTILE_SECRET_KEY: 'test-secret'
  },
  flags: {
    turnstile: false
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
  contactRatelimit: {
    limit: vi.fn()
  }
}))

vi.mock('@/lib/spam-detection', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  verifyTurnstileToken: vi.fn()
}))

describe('/api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets the sender as reply-to on the contact notification', async () => {
    const { contactRatelimit } = await import('@/lib/ratelimit')
    const { checkRateLimit, getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true })
    vi.mocked(contactRatelimit.limit).mockResolvedValue({ success: true } as never)
    send.mockResolvedValue({ data: { id: 'email-1' }, error: null })

    const { POST } = await import('@/app/api/contact/route')
    const request = {
      headers: new Headers({ 'accept-language': 'en' }),
      json: async () => ({
        name: 'Marina',
        email: 'marina@example.com',
        subject: 'Project inquiry',
        message: 'I would like to discuss a project.'
      })
    } as unknown as Parameters<typeof POST>[0]

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(send).toHaveBeenCalledTimes(2)
    expect(send.mock.calls[0]?.[0]).toMatchObject({
      to: ['me@yuricunha.com'],
      replyTo: 'marina@example.com'
    })
  })

  it('keeps the submitted contact successful and logs a failed confirmation email', async () => {
    const { contactRatelimit } = await import('@/lib/ratelimit')
    const { logger } = await import('@/lib/logger')
    const { checkRateLimit, getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true })
    vi.mocked(contactRatelimit.limit).mockResolvedValue({ success: true } as never)
    send.mockResolvedValueOnce({ data: { id: 'email-1' }, error: null })
    send.mockResolvedValueOnce({
      data: null,
      error: { message: 'Recipient is unavailable' }
    })

    const { POST } = await import('@/app/api/contact/route')
    const request = {
      headers: new Headers({ 'accept-language': 'en' }),
      json: async () => ({
        name: 'Marina',
        email: 'marina@example.com',
        subject: 'Project inquiry',
        message: 'I would like to discuss a project.'
      })
    } as unknown as Parameters<typeof POST>[0]

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.error).toHaveBeenCalledWith(
      'Contact confirmation email failed',
      expect.any(Error)
    )
  })

  it('uses Portuguese text fallback for Portuguese contact confirmations', async () => {
    const { contactRatelimit } = await import('@/lib/ratelimit')
    const { checkRateLimit, getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true })
    vi.mocked(contactRatelimit.limit).mockResolvedValue({ success: true } as never)
    send.mockResolvedValue({ data: { id: 'email-1' }, error: null })

    const { POST } = await import('@/app/api/contact/route')
    const request = {
      headers: new Headers({ 'accept-language': 'pt-BR,pt;q=0.9' }),
      json: async () => ({
        name: 'Marina',
        email: 'marina@example.com',
        subject: 'Projeto',
        message: 'Gostaria de conversar sobre um projeto.'
      })
    } as unknown as Parameters<typeof POST>[0]

    await POST(request)

    expect(send.mock.calls[1]?.[0]).toMatchObject({
      text: expect.stringContaining('Olá Marina,')
    })
  })
})
