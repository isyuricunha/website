import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()

vi.stubGlobal('fetch', fetchMock)

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

vi.mock('node:fs/promises', () => {
  return {
    default: {
      writeFile: vi.fn(async () => {}),
      readFile: vi.fn(async () => 'health-check:123'),
      unlink: vi.fn(async () => {})
    }
  }
})

vi.mock('node:os', () => {
  return {
    default: {
      tmpdir: () => '/tmp'
    }
  }
})

vi.mock('node:path', () => {
  return {
    default: {
      join: (...parts: string[]) => parts.join('/')
    }
  }
})

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
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
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

  it('getSystemHealth uses VERCEL_URL as API health base URL when available', async () => {
    vi.doMock('@isyuricunha/env', () => {
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
          VERCEL_URL: 'example.vercel.app'
        }
      }
    })

    const { systemRouter } = await import('@/trpc/routers/system')
    const db = createDbMock()

    const caller = systemRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ host: 'yuricunha.com' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof systemRouter.createCaller>[0])

    await caller.getSystemHealth()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('http://yuricunha.com/api/health')
    expect(options?.headers?.accept).toBe('application/json')
  })

  it('getSystemHealth falls back to NEXT_PUBLIC_WEBSITE_URL when VERCEL_URL is missing', async () => {
    vi.doMock('@isyuricunha/env', () => {
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
          NEXT_PUBLIC_WEBSITE_URL: 'https://yuricunha.com'
        }
      }
    })

    const { systemRouter } = await import('@/trpc/routers/system')
    const db = createDbMock()

    const caller = systemRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ host: 'ignored.example' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof systemRouter.createCaller>[0])

    await caller.getSystemHealth()

    expect(fetchMock).toHaveBeenCalled()
    const [url] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('https://yuricunha.com/api/health')
  })

  it('getSystemHealth falls back to VERCEL_URL when public URL is forbidden', async () => {
    vi.doMock('@isyuricunha/env', () => {
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
          NEXT_PUBLIC_WEBSITE_URL: 'https://yuricunha.com',
          VERCEL_URL: 'example.vercel.app'
        }
      }
    })

    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 403 })
      .mockResolvedValueOnce({ ok: true, status: 200 })

    const { systemRouter } = await import('@/trpc/routers/system')
    const db = createDbMock()

    const caller = systemRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ host: 'irrelevant.example' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof systemRouter.createCaller>[0])

    const result = await caller.getSystemHealth()

    const api_check = result.checks.find((c) => c.type === 'api')
    expect(api_check?.details?.ok).toBe(true)
    expect(api_check?.details?.attempts).toHaveLength(2)
    expect(api_check?.details?.attempts?.[0]?.url).toBe('https://yuricunha.com/api/health')
    expect(api_check?.details?.attempts?.[0]?.status).toBe(403)
    expect(api_check?.details?.attempts?.[1]?.url).toBe('https://example.vercel.app/api/health')
    expect(api_check?.details?.attempts?.[1]?.status).toBe(200)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://yuricunha.com/api/health')
    expect(fetchMock.mock.calls[1]?.[0]).toBe('https://example.vercel.app/api/health')
  })

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
