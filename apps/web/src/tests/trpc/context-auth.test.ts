import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTRPCContext } from '@/trpc/trpc'

const getSessionMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({
  getSession: getSessionMock
}))
vi.mock('@isyuricunha/env', () => ({ env: { NODE_ENV: 'test' } }))
vi.mock('@isyuricunha/db', () => ({
  db: {},
  apiUsage: {},
  errorLogs: {},
  errorTracking: {}
}))
vi.mock('@isyuricunha/kv', () => ({
  telemetryRatelimit: { limit: vi.fn(async () => ({ success: true })) }
}))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() }
}))

describe('tRPC context session policy', () => {
  beforeEach(() => {
    getSessionMock.mockReset()
    getSessionMock.mockResolvedValue({ user: { id: 'admin' } })
  })

  it('does not perform session lookup for anonymous traffic with locale cookies', async () => {
    const headers = new Headers({ cookie: 'NEXT_LOCALE=pt; theme=dark' })
    const ctx = await createTRPCContext({ headers })
    expect(ctx.session).toBeNull()
    expect(getSessionMock).not.toHaveBeenCalled()
  })

  it.each(['better-auth.session_token=opaque', '__Secure-better-auth.session_token=opaque'])(
    'validates a Better Auth cookie: %s',
    async (cookie) => {
      const headers = new Headers({ cookie })
      const ctx = await createTRPCContext({ headers })
      expect(getSessionMock).toHaveBeenCalledWith(headers)
      expect(ctx.session?.user.id).toBe('admin')
    }
  )

  it('does not confuse similarly named cookies with an authenticated session', async () => {
    const headers = new Headers({ cookie: 'not-better-auth.session_token=x' })
    const ctx = await createTRPCContext({ headers })
    expect(ctx.session).toBeNull()
    expect(getSessionMock).not.toHaveBeenCalled()
  })
})
