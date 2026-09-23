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
      RESEND_API_KEY: 'token',
      BETTER_AUTH_SECRET: 'test-two-factor-secret'
    }
  }
})

const passwordVerifyMock = vi.fn()

vi.mock('@/lib/auth', () => {
  return {
    auth: {
      $context: Promise.resolve({
        password: {
          verify: passwordVerifyMock
        }
      })
    },
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

  // Pass everything through: the fake randomBytes (a bare object with a
  // toString) broke speakeasy.generateSecret internally, which needs a real
  // Buffer. No test asserts deterministic ids, so the real bytes are fine.
  return {
    default: actual,
    ...actual
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
  const two_factor_tokens: Array<{
    id: string
    userId: string
    secret: string
    backupCodes: string | null
    isEnabled: boolean
  }> = []
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

  const deleteWhere = vi.fn(async () => {
    // Simulate the deletion the caller requested (mock removes matching rows).
    two_factor_tokens.length = 0
    return
  })

  const deleteMock = vi.fn(() => ({ where: deleteWhere }))

  const insert = vi.fn((table: unknown) => {
    return {
      values: vi.fn(async (value: any) => {
        const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null

        if (
          tableName === 'security_events' ||
          (value?.eventType && value.severity && value.createdAt)
        ) {
          security_events.push(value)
        }

        switch (tableName) {
          case 'ip_access_control': {
            ip_rules.push(value)
            break
          }
          case 'account_lockouts': {
            lockouts.push(value)
            break
          }
          case 'security_settings': {
            security_settings.push(value)
            break
          }
          case 'two_factor_tokens': {
            two_factor_tokens.push(value)
            break
          }
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
    },
    accounts: {
      findFirst: vi.fn(async () => ({
        id: 'account-1',
        userId: 'user-1',
        providerId: 'credential',
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords -- mocked scrypt hash, not a real credential
        password: 'scrypt-hash'
      }))
    },
    twoFactorTokens: {
      findFirst: vi.fn(async () => two_factor_tokens[0] ?? null)
    }
  }

  return {
    insert,
    update,
    delete: deleteMock,
    query,
    __state: {
      security_events,
      ip_rules,
      lockouts,
      security_settings,
      two_factor_tokens
    },
    __mocks: {
      updateWhere,
      updateSet,
      insertValues,
      deleteMock,
      deleteWhere
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
  })

  describe('2FA lifecycle', () => {
    const makeCaller = async (db: ReturnType<typeof createDbMock>) => {
      const { securityRouter } = await import('@/trpc/routers/security')

      return securityRouter.createCaller({
        db: db as unknown,
        headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
        session: {
          user: { id: 'user-1', role: 'user' }
        }
      } as unknown as Parameters<typeof securityRouter.createCaller>[0])
    }

    beforeEach(() => {
      passwordVerifyMock.mockReset()
    })

    it('enable2FA stores the TOTP secret and backup codes encrypted at rest', async () => {
      const db = createDbMock()
      const caller = await makeCaller(db)

      const result = await caller.enable2FA()

      expect(result.secret).toBeTruthy()
      expect(result.backupCodes).toBeTruthy()
      expect(db.__state.two_factor_tokens).toHaveLength(1)

      const stored = db.__state.two_factor_tokens[0] ?? null
      expect(stored).not.toBeNull()
      expect(stored?.secret.startsWith('enc1:')).toBe(true)
      expect(stored?.secret).not.toBe(result.secret)

      const { decrypt_2fa_value } = await import('@/lib/two-factor-crypto')
      expect(decrypt_2fa_value(stored?.secret ?? '')).toBe(result.secret)
      expect(decrypt_2fa_value(stored?.backupCodes ?? '')).toBe(JSON.stringify(result.backupCodes))
    })

    it('disable2FA rejects a wrong password and keeps the record', async () => {
      const db = createDbMock()
      const caller = await makeCaller(db)

      await caller.enable2FA()
      await process_frame()
      passwordVerifyMock.mockResolvedValue(false)

      const stored = db.__state.two_factor_tokens[0] ?? null
      expect(stored).not.toBeNull()

      let rejected = false
      try {
        await caller.disable2FA({ password: 'wrong' })
      } catch {
        // Expected: an invalid password must never reach the deletion step.
        rejected = true
      }

      expect(rejected).toBe(true)
      expect(db.__mocks.deleteWhere).not.toHaveBeenCalled()
      expect(db.__state.two_factor_tokens).toHaveLength(1)
    })

    it('disable2FA deletes the record with the correct password and logs the event', async () => {
      const db = createDbMock()
      const caller = await makeCaller(db)

      await caller.enable2FA()
      await process_frame()
      passwordVerifyMock.mockResolvedValue(true)

      const result = await caller.disable2FA({ password: 'correct' })

      expect(result.success).toBe(true)
      expect(db.__mocks.deleteWhere).toHaveBeenCalled()
      expect(db.__state.two_factor_tokens).toHaveLength(0)

      const event = db.__state.security_events.find(e => e.eventType === 'two_factor_disabled')
      expect(event).toBeTruthy()
    })
  })
})

async function process_frame() {
  await new Promise(resolve => setTimeout(resolve, 0))
}
