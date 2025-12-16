import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/env', () => {
  return {
    flags: {
      comment: false,
      auth: false,
      stats: false,
      spotify: false,
      spotifyImport: false,
      gemini: false,
      analytics: false,
      guestbookNotification: false,
      likeButton: false,
      turnstile: false
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/test',
      UPSTASH_REDIS_REST_URL: 'https://example.com',
      UPSTASH_REDIS_REST_TOKEN: 'token',
      RESEND_API_KEY: 'token'
    }
  }
})

vi.mock('@/lib/auth', () => {
  return {
    getSession: vi.fn(async () => null)
  }
})

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}))

const logSystemActionMock = vi.fn().mockImplementation(async () => {
  return
})

vi.mock('@/lib/audit-logger', () => {
  return {
    AuditLogger: class {
      logSystemAction = logSystemActionMock
    },
    getIpFromHeaders: () => '203.0.113.10',
    getUserAgentFromHeaders: () => 'vitest'
  }
})

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()
  let counter = 0

  return {
    ...actual,
    randomBytes: () => {
      counter += 1
      return {
        toString: () => `id-${counter}`
      }
    }
  }
})

type SecurityEventRow = {
  id: string
  eventType: string
  severity: string
  userId: string | null
  ipAddress: string | null
  userAgent: string | null
  location: string | null
  details: string | null
  resolved: boolean
  resolvedBy: string | null
  resolvedAt: Date | null
  createdAt: Date
}

type IpAccessControlRow = {
  id: string
  ipAddress: string
  ipRange?: string
  type: 'whitelist' | 'blacklist'
  description?: string
  createdBy: string
}

type AccountLockoutRow = {
  id: string
  userId: string
  reason: string
  lockedBy: string
  lockedUntil: Date | null
}

type SecuritySettingRow = {
  id: string
  key: string
  value: string
  description: string | null
  category: string
  updatedBy: string
  updatedAt: Date
}

const createDbMock = () => {
  const security_events: SecurityEventRow[] = []
  const ip_rules: IpAccessControlRow[] = []
  const lockouts: AccountLockoutRow[] = []
  const security_settings: SecuritySettingRow[] = [
    {
      id: 'setting-1',
      key: 'security.max_failed_logins',
      value: '5',
      description: 'max failed login attempts',
      category: 'auth',
      updatedBy: 'admin-1',
      updatedAt: new Date()
    }
  ]

  const insertValues = vi.fn(async (value: unknown) => {
    return value
  })

  const insert = vi.fn((table: unknown) => {
    return {
      values: vi.fn(async (value: any) => {
        const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null

        if (tableName === 'security_events') {
          security_events.push(value)
        }

        if (tableName === 'ip_access_control') {
          ip_rules.push(value)
        }

        if (tableName === 'account_lockouts') {
          lockouts.push(value)
        }

        if (tableName === 'security_settings') {
          security_settings.push(value)
        }

        await insertValues(value)
        return
      })
    }
  })

  const updateWhere = vi.fn(async () => {
    return
  })

  const updateSet = vi.fn(() => ({ where: updateWhere }))

  const update = vi.fn(() => ({ set: updateSet }))

  const query = {
    securitySettings: {
      findFirst: vi.fn(async () => security_settings[0] ?? null)
    }
  }

  return {
    insert,
    update,
    query,
    __state: {
      security_events,
      ip_rules,
      lockouts,
      security_settings
    },
    __mocks: {
      updateWhere,
      updateSet
    }
  }
}

describe('securityRouter admin events', () => {
  beforeEach(() => {
    logSystemActionMock.mockClear()
    vi.resetModules()
  })

  it('addIpAccessRule creates a security event', async () => {
    const { securityRouter } = await import('@/trpc/routers/security')

    const db = createDbMock()

    const caller = securityRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof securityRouter.createCaller>[0])

    const result = await caller.addIpAccessRule({
      ipAddress: '198.51.100.10',
      type: 'blacklist',
      description: 'test'
    })

    expect(result.success).toBe(true)
    expect(db.__state.ip_rules).toHaveLength(1)
    expect(db.__state.security_events).toHaveLength(1)

    const event = db.__state.security_events[0]
    expect(event?.eventType).toBe('admin_action')
    expect(event?.severity).toBe('medium')
    expect(event?.userId).toBe('admin-1')
    expect(event?.ipAddress).toBe('203.0.113.10')
    expect(event?.userAgent).toBe('vitest')

    const details = event?.details ? JSON.parse(event.details) : null
    expect(details).toEqual(
      expect.objectContaining({
        action: 'ip_rule_added',
        type: 'blacklist',
        ipAddress: '198.51.100.10'
      })
    )
  }, 15_000)

  it('lockAccount creates a security event', async () => {
    const { securityRouter } = await import('@/trpc/routers/security')

    const db = createDbMock()

    const caller = securityRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof securityRouter.createCaller>[0])

    const result = await caller.lockAccount({
      userId: 'user-2',
      reason: 'test',
      duration: 15
    })

    expect(result.success).toBe(true)
    expect(db.__state.lockouts).toHaveLength(1)
    expect(db.__state.security_events).toHaveLength(1)

    const event = db.__state.security_events[0]
    expect(event?.eventType).toBe('account_locked')
    expect(event?.severity).toBe('high')
    expect(event?.userId).toBe('user-2')

    const details = event?.details ? JSON.parse(event.details) : null
    expect(details).toEqual(
      expect.objectContaining({
        lockedBy: 'admin-1',
        reason: 'test'
      })
    )
  })

  it('updateSecuritySetting creates a security event', async () => {
    const { securityRouter } = await import('@/trpc/routers/security')

    const db = createDbMock()

    const caller = securityRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof securityRouter.createCaller>[0])

    const result = await caller.updateSecuritySetting({
      key: 'security.max_failed_logins',
      value: '7',
      description: 'updated',
      category: 'auth'
    })

    expect(result.success).toBe(true)
    expect(db.__mocks.updateSet).toHaveBeenCalledTimes(1)
    expect(db.__mocks.updateWhere).toHaveBeenCalledTimes(1)
    expect(db.__state.security_events).toHaveLength(1)

    const event = db.__state.security_events[0]
    expect(event?.eventType).toBe('admin_action')
    expect(event?.severity).toBe('low')
    expect(event?.userId).toBe('admin-1')

    const details = event?.details ? JSON.parse(event.details) : null
    expect(details).toEqual(
      expect.objectContaining({
        action: 'security_setting_updated',
        key: 'security.max_failed_logins'
      })
    )
  })
})
