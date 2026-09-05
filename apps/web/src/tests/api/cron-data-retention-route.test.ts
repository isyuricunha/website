import { beforeEach, describe, expect, it, vi } from 'vitest'

type Table = Record<string | symbol, unknown>

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}))

const createRedisMock = () => {
  let lockValue: string | null = null

  return {
    set: vi.fn(async (_key: string, value: string, opts?: { nx?: boolean; ex?: number }) => {
      if (opts?.nx && lockValue) return null
      lockValue = value
      return 'OK'
    }),
    get: vi.fn(async () => lockValue),
    del: vi.fn(async () => {
      lockValue = null
      return 1
    })
  }
}

type DeleteCall = { table: string; rowCount: number }

const createDbMock = (rowCountsByTable: Record<string, number> = {}) => {
  const deleteCalls: DeleteCall[] = []

  const analytics_events_table: Table = { [Symbol.for('drizzle:Name')]: 'analytics_events' }
  const performance_metrics_table: Table = { [Symbol.for('drizzle:Name')]: 'performance_metrics' }
  const login_attempts_table: Table = { [Symbol.for('drizzle:Name')]: 'login_attempts' }
  const ai_chat_feedback_table: Table = { [Symbol.for('drizzle:Name')]: 'ai_chat_feedback' }
  const security_events_table: Table = { [Symbol.for('drizzle:Name')]: 'security_events' }
  const error_logs_table: Table = { [Symbol.for('drizzle:Name')]: 'error_logs' }

  const del = vi.fn((table: Table) => {
    const name = table?.[Symbol.for('drizzle:Name')] as string
    return {
      where: vi.fn(async () => {
        const rowCount = rowCountsByTable[name] ?? 0
        deleteCalls.push({ table: name, rowCount })
        return { rowCount }
      })
    }
  })

  return {
    delete: del,
    __deleteCalls: deleteCalls,
    __tables: {
      analytics_events_table,
      performance_metrics_table,
      login_attempts_table,
      ai_chat_feedback_table,
      security_events_table,
      error_logs_table
    }
  }
}

type DbMock = ReturnType<typeof createDbMock>

const createDbModuleMock = (db: DbMock) => {
  return {
    db: { delete: db.delete },
    analyticsEvents: { ...db.__tables.analytics_events_table, createdAt: 'analytics_events.createdAt' },
    performanceMetrics: {
      ...db.__tables.performance_metrics_table,
      createdAt: 'performance_metrics.createdAt'
    },
    loginAttempts: { ...db.__tables.login_attempts_table, createdAt: 'login_attempts.createdAt' },
    aiChatFeedback: { ...db.__tables.ai_chat_feedback_table, createdAt: 'ai_chat_feedback.createdAt' },
    securityEvents: {
      ...db.__tables.security_events_table,
      resolved: 'security_events.resolved',
      createdAt: 'security_events.createdAt'
    },
    errorLogs: {
      ...db.__tables.error_logs_table,
      resolved: 'error_logs.resolved',
      createdAt: 'error_logs.createdAt'
    },
    and: (...args: unknown[]) => args,
    eq: (...args: unknown[]) => args,
    lt: (...args: unknown[]) => args
  }
}

describe('/api/cron/data-retention', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useRealTimers()
    delete process.env.CRON_SECRET
  })

  it('returns 401 when CRON_SECRET is missing', async () => {
    const db = createDbMock()
    const redis = createRedisMock()

    vi.doMock('@isyuricunha/db', () => createDbModuleMock(db))
    vi.doMock('@isyuricunha/kv', () => ({ redis }))

    const { GET } = await import('@/app/api/cron/data-retention/route')

    const res = await GET({ headers: new Headers() } as unknown as Parameters<typeof GET>[0])

    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization header is invalid', async () => {
    process.env.CRON_SECRET = '0123456789abcdef'

    const db = createDbMock()
    const redis = createRedisMock()

    vi.doMock('@isyuricunha/db', () => createDbModuleMock(db))
    vi.doMock('@isyuricunha/kv', () => ({ redis }))

    const { GET } = await import('@/app/api/cron/data-retention/route')

    const res = await GET({
      headers: new Headers([['authorization', 'Bearer wrong']])
    } as unknown as Parameters<typeof GET>[0])

    expect(res.status).toBe(401)
  })

  it('skips execution when lock is already held', async () => {
    process.env.CRON_SECRET = '0123456789abcdef'

    const db = createDbMock()

    const redis = createRedisMock()
    vi.mocked(redis.set).mockResolvedValueOnce('OK' as never)
    vi.mocked(redis.set).mockResolvedValueOnce(null as never)

    vi.doMock('@isyuricunha/db', () => createDbModuleMock(db))
    vi.doMock('@isyuricunha/kv', () => ({ redis }))

    const { GET } = await import('@/app/api/cron/data-retention/route')

    const headers = new Headers([['authorization', 'Bearer 0123456789abcdef']])

    const res1 = await GET({ headers } as unknown as Parameters<typeof GET>[0])
    expect(res1.status).toBe(200)

    const res2 = await GET({ headers } as unknown as Parameters<typeof GET>[0])
    const json2 = (await res2.json()) as { skipped?: boolean; reason?: string }

    expect(json2.skipped).toBe(true)
    expect(json2.reason).toBe('locked')
  })

  it('deletes old rows from every retention-managed table and reports counts', async () => {
    process.env.CRON_SECRET = '0123456789abcdef'

    const db = createDbMock({
      analytics_events: 12,
      performance_metrics: 3,
      login_attempts: 5,
      ai_chat_feedback: 1,
      security_events: 2,
      error_logs: 4
    })
    const redis = createRedisMock()

    vi.doMock('@isyuricunha/db', () => createDbModuleMock(db))
    vi.doMock('@isyuricunha/kv', () => ({ redis }))

    const { GET } = await import('@/app/api/cron/data-retention/route')

    const res = await GET({
      headers: new Headers([['authorization', 'Bearer 0123456789abcdef']])
    } as unknown as Parameters<typeof GET>[0])

    expect(res.status).toBe(200)

    const json = (await res.json()) as { success: boolean; deleted: Record<string, number> }

    expect(json.success).toBe(true)
    expect(json.deleted).toEqual({
      analyticsEvents: 12,
      performanceMetrics: 3,
      loginAttempts: 5,
      aiChatFeedback: 1,
      securityEvents: 2,
      errorLogs: 4
    })

    // All six tables must have been targeted, in this order.
    expect(db.__deleteCalls.map((c) => c.table)).toEqual([
      'analytics_events',
      'performance_metrics',
      'login_attempts',
      'ai_chat_feedback',
      'security_events',
      'error_logs'
    ])
  })

  it('returns zero counts when nothing is old enough to delete', async () => {
    process.env.CRON_SECRET = '0123456789abcdef'

    const db = createDbMock()
    const redis = createRedisMock()

    vi.doMock('@isyuricunha/db', () => createDbModuleMock(db))
    vi.doMock('@isyuricunha/kv', () => ({ redis }))

    const { GET } = await import('@/app/api/cron/data-retention/route')

    const res = await GET({
      headers: new Headers([['authorization', 'Bearer 0123456789abcdef']])
    } as unknown as Parameters<typeof GET>[0])

    const json = (await res.json()) as { deleted: Record<string, number> }

    expect(Object.values(json.deleted).every((n) => n === 0)).toBe(true)
  })
})
