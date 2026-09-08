import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendBroadcast = vi.fn()

vi.mock('resend', () => ({
  Resend: class {
    broadcasts = { send: sendBroadcast }
  }
}))

vi.mock('@isyuricunha/env', () => ({
  env: { RESEND_API_KEY: 'test-key' }
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn()
  }
}))

describe('ResendService broadcasts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns false when Resend returns an error for an immediate broadcast', async () => {
    const { ResendService } = await import('@/lib/resend-service')
    const { logger } = await import('@/lib/logger')
    sendBroadcast.mockResolvedValue({
      data: null,
      error: { message: 'The sending domain is not verified' }
    })

    await expect(new ResendService().sendBroadcast('broadcast-1')).resolves.toBe(false)
    expect(logger.error).toHaveBeenCalledWith('Error sending Resend broadcast', expect.any(Error))
  })

  it('returns false when Resend returns an error for a scheduled broadcast', async () => {
    const { ResendService } = await import('@/lib/resend-service')
    const { logger } = await import('@/lib/logger')
    sendBroadcast.mockResolvedValue({
      data: null,
      error: { message: 'The sending domain is not verified' }
    })

    await expect(
      new ResendService().scheduleBroadcast('broadcast-1', '2026-09-10T10:00:00.000Z')
    ).resolves.toBe(false)
    expect(logger.error).toHaveBeenCalledWith(
      'Error scheduling Resend broadcast',
      expect.any(Error)
    )
  })
})
