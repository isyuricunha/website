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

const auditLogMock = vi.fn().mockImplementation(async () => {
  return
})

vi.mock('@/lib/audit-logger', () => {
  return {
    AuditLogger: class {
      log = auditLogMock
    },
    getIpFromHeaders: () => '203.0.113.10',
    getUserAgentFromHeaders: () => 'vitest'
  }
})

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()
  let counter = 0

  return {
    default: actual,
    ...actual,
    randomBytes: () => {
      counter += 1
      return {
        toString: () => `id-${counter}`
      }
    }
  }
})

type SystemHealthLogRow = {
  id: string
  checkType: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  responseTime: number | null
  message: string | null
  details: string | null
  createdAt: Date
}

type ErrorLogRow = {
  id: string
  level: 'error' | 'warning' | 'info'
  message: string
  resolved: boolean
  resolvedBy: string | null
  resolvedAt: Date | null
  createdAt: Date
}

type SiteConfigRow = {
  id: string
  key: string
  value: string | null
  type: string
  description: string | null
  isPublic: boolean
  updatedBy: string
  createdAt: Date
  updatedAt: Date
}

const createDbMock = () => {
  const health_logs: SystemHealthLogRow[] = []
  const error_logs: ErrorLogRow[] = [
    {
      id: 'error-1',
      level: 'error',
      message: 'boom',
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      createdAt: new Date()
    }
  ]

  const site_config: SiteConfigRow[] = [
    {
      id: 'cfg-1',
      key: 'site.title',
      value: JSON.stringify('Website'),
      type: 'general',
      description: 'site title',
      isPublic: true,
      updatedBy: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const insert = vi.fn((table: unknown) => {
    return {
      values: vi.fn(async (value: any) => {
        const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null

        if (value?.checkType && value?.status) {
          health_logs.push(value)
        }

        if (tableName === 'site_config') {
          site_config.push(value)
        }
      })
    }
  })

  const updateSiteConfigWhere = vi.fn(async () => {
    const cfg = site_config[0]
    if (cfg) {
      cfg.value = JSON.stringify('Updated')
      cfg.updatedAt = new Date()
      cfg.updatedBy = 'admin-1'
    }
    return
  })

  const updateErrorWhere = vi.fn(async () => {
    const error = error_logs[0]
    if (error) {
      error.resolved = true
      error.resolvedBy = 'admin-1'
      error.resolvedAt = new Date()
    }
    return
  })

  const updateErrorSet = vi.fn(() => ({ where: updateErrorWhere }))
  const updateSiteConfigSet = vi.fn(() => ({ where: updateSiteConfigWhere }))

  const update = vi.fn((table: unknown) => {
    const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null
    const set = tableName === 'site_config' ? updateSiteConfigSet : updateErrorSet
    return { set }
  })

  const query = {
    users: {
      findFirst: vi.fn(async () => ({ id: 'admin-1' }))
    },
    systemHealthLogs: {
      findMany: vi.fn(async () => health_logs)
    },
    errorLogs: {
      findMany: vi.fn(async () => error_logs)
    },
    siteConfig: {
      findMany: vi.fn(async () => site_config),
      findFirst: vi.fn(async () => site_config[0] ?? null)
    }
  }

  return {
    insert,
    update,
    query,
    __state: {
      health_logs,
      error_logs,
      site_config
    },
    __mocks: {
      updateErrorWhere,
      updateSiteConfigWhere,
      updateErrorSet,
      updateSiteConfigSet
    }
  }
}

describe('systemRouter', () => {
  beforeEach(() => {
    auditLogMock.mockClear()
    vi.resetModules()
  })

  it('getSystemHealth records health logs and returns history', async () => {
    const { systemRouter } = await import('@/trpc/routers/system')

    const db = createDbMock()

    const caller = systemRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof systemRouter.createCaller>[0])

    const result = await caller.getSystemHealth()

    expect(result.overallStatus).toEqual(expect.any(String))
    expect(result.checks).toHaveLength(4)
    expect(Array.isArray(result.history)).toBe(true)
  }, 15_000)

  it('resolveError marks error resolved', async () => {
    const { systemRouter } = await import('@/trpc/routers/system')

    const db = createDbMock()

    const caller = systemRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof systemRouter.createCaller>[0])

    const result = await caller.resolveError({ errorId: 'error-1' })

    expect(result.success).toBe(true)
    expect(db.__state.error_logs[0]?.resolved).toBe(true)
    expect(db.__state.error_logs[0]?.resolvedBy).toBe('admin-1')
    expect(db.__mocks.updateErrorWhere).toHaveBeenCalledTimes(1)
    expect(auditLogMock).toHaveBeenCalledTimes(1)
  })

  it('getSiteConfig returns grouped config with parsed values', async () => {
    const { systemRouter } = await import('@/trpc/routers/system')

    const db = createDbMock()

    const caller = systemRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof systemRouter.createCaller>[0])

    const result = await caller.getSiteConfig()

    const general = result.config.general
    expect(general).toBeDefined()
    if (!general) {
      throw new Error('Expected general config group to be defined')
    }
    expect(general).toHaveLength(1)
    expect(general[0]?.key).toBe('site.title')
    expect(general[0]?.value).toBe('Website')
  })

  it('updateSiteConfig updates existing config when key exists', async () => {
    const { systemRouter } = await import('@/trpc/routers/system')

    const db = createDbMock()

    const caller = systemRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof systemRouter.createCaller>[0])

    const result = await caller.updateSiteConfig({
      key: 'site.title',
      value: JSON.stringify('Updated'),
      type: 'general',
      description: 'site title',
      isPublic: true
    })

    expect(result.success).toBe(true)
    expect(db.__mocks.updateSiteConfigWhere).toHaveBeenCalledTimes(1)
    expect(auditLogMock).toHaveBeenCalled()
  })
})
