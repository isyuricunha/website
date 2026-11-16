import { beforeEach, describe, expect, it, vi } from 'vitest'

const send = vi.fn()

vi.mock('@/lib/transactional-email', () => ({
  sendBestEffortEmail: vi.fn(
    async (
      resendLike: { emails: { send: typeof send } },
      payload: unknown,
      onError?: (error: Error) => void
    ) => {
      const result = (await resendLike.emails.send(payload)) as { error?: unknown }
      if (result?.error) {
        onError?.(new Error('Confirmation email failed'))
        return { ok: false }
      }
      return { ok: true }
    }
  )
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

    const { contactPost } = await import('@isyuricunha/trpc-server/server/contact')
    const request = new Request('http://test/api/contact', {
      method: 'POST',
      headers: { 'accept-language': 'en', 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Marina',
        email: 'marina@example.com',
        subject: 'Project inquiry',
        message: 'I would like to discuss a project.'
      })
    })

    const response = await contactPost(request, {
      resend: { emails: { send } }
    })

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

    const { contactPost } = await import('@isyuricunha/trpc-server/server/contact')
    const request = new Request('http://test/api/contact', {
      method: 'POST',
      headers: { 'accept-language': 'en', 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Marina',
        email: 'marina@example.com',
        subject: 'Project inquiry',
        message: 'I would like to discuss a project.'
      })
    })

    const response = await contactPost(request, {
      resend: { emails: { send } }
    })

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

    const { contactPost } = await import('@isyuricunha/trpc-server/server/contact')
    const request = new Request('http://test/api/contact', {
      method: 'POST',
      headers: { 'accept-language': 'pt-BR,pt;q=0.9', 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Marina',
        email: 'marina@example.com',
        subject: 'Projeto',
        message: 'Gostaria de conversar sobre um projeto.'
      })
    })

    await contactPost(request, {
      resend: { emails: { send } }
    })

    expect(send.mock.calls[1]?.[0]).toMatchObject({
      text: expect.stringContaining('Olá Marina,')
    })
  })
})
