import { beforeEach, describe, expect, it, vi } from 'vitest'

type Table = Record<string | symbol, unknown>

type Inserted = {
  alert_instances: any[]
  notifications: any[]
}

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

type DbMock = ReturnType<typeof createDbMock>

const createDbMock = () => {
  const inserted: Inserted = {
    alert_instances: [],
    notifications: []
  }

  const alerts_table: Table = { [Symbol.for('drizzle:Name')]: 'alerts' }
  const alert_instances_table: Table = { [Symbol.for('drizzle:Name')]: 'alert_instances' }
  const notifications_table: Table = { [Symbol.for('drizzle:Name')]: 'notifications' }

  const insert = vi.fn((table: Table) => {
    return {
      values: vi.fn(async (value: any) => {
        const name = table?.[Symbol.for('drizzle:Name')]

        if (name === 'alert_instances') {
          inserted.alert_instances.push(value)
        }

        if (name === 'notifications') {
          inserted.notifications.push(...(Array.isArray(value) ? value : [value]))
        }

        return
      })
    }
  })

  const transaction = vi.fn(async (cb: (tx: { insert: typeof insert }) => Promise<void>) => {
    await cb({ insert })
  })

  const query = {
    alerts: {
      findMany: vi.fn(async () => [] as any[])
    },
    apiUsage: {
      findMany: vi.fn(async () => [] as any[])
    },
    performanceMetrics: {
      findMany: vi.fn(async () => [] as any[])
    },
    errorTracking: {
      findMany: vi.fn(async () => [] as any[])
    },
    securityEvents: {
      findMany: vi.fn(async () => [] as any[])
    },
    users: {
      findMany: vi.fn(async () => [] as any[])
    },
    alertInstances: {
      findFirst: vi.fn(async () => null as any)
    }
  }

  return {
    query,
    insert,
    transaction,
    __inserted: inserted,
    __tables: {
      alerts_table,
      alert_instances_table,
      notifications_table
    }
  }
}

const createDbModuleMock = (db: DbMock) => {
  return {
    db: {
      query: db.query,
      transaction: db.transaction
    },
    alerts: db.__tables.alerts_table,
    alertInstances: db.__tables.alert_instances_table,
    notifications: db.__tables.notifications_table,
    apiUsage: { createdAt: 'api_usage.createdAt' },
    performanceMetrics: { metricName: 'performance_metrics.metricName' },
    errorTracking: { resolved: 'error_tracking.resolved' },
    securityEvents: { resolved: 'security_events.resolved' },
    users: { role: 'users.role' },
    desc: (value: unknown) => value,
    eq: (...args: unknown[]) => args,
    gte: (...args: unknown[]) => args
  }
}

describe('/api/cron/alerts', () => {
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

    const { GET } = await import('@/app/api/cron/alerts/route')

    const res = await GET({ headers: new Headers() } as unknown as Parameters<typeof GET>[0])

    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization header is invalid', async () => {
    process.env.CRON_SECRET = '0123456789abcdef'

    const db = createDbMock()
    const redis = createRedisMock()

    vi.doMock('@isyuricunha/db', () => createDbModuleMock(db))
    vi.doMock('@isyuricunha/kv', () => ({ redis }))

    const { GET } = await import('@/app/api/cron/alerts/route')

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

    const { GET } = await import('@/app/api/cron/alerts/route')

    const headers = new Headers([['authorization', 'Bearer 0123456789abcdef']])

    const res1 = await GET({ headers } as unknown as Parameters<typeof GET>[0])
    expect(res1.status).toBe(200)

    const res2 = await GET({ headers } as unknown as Parameters<typeof GET>[0])
    const json2 = (await res2.json()) as { skipped?: boolean; reason?: string }

    expect(json2.skipped).toBe(true)
    expect(json2.reason).toBe('locked')
  })

  it('creates alert instance and notifications for admins when alert triggers', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    process.env.CRON_SECRET = '0123456789abcdef'

    const db = createDbMock()
    const redis = createRedisMock()

    db.query.alerts.findMany.mockResolvedValue([
      {
        id: 'alert-1',
        name: 'API error rate',
        description: 'API error rate is too high',
        type: 'performance',
        severity: 'critical',
        conditions: JSON.stringify({
          metric: 'api_error_rate',
          operator: 'gt',
          threshold: 1,
          timeRangeMinutes: 10,
          cooldownMinutes: 60
        }),
        isActive: true,
        createdBy: 'admin-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      }
    ])

    db.query.apiUsage.findMany.mockResolvedValue([{ statusCode: 200 }, { statusCode: 500 }])

    db.query.users.findMany.mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }])

    vi.doMock('@isyuricunha/db', () => createDbModuleMock(db))
    vi.doMock('@isyuricunha/kv', () => ({ redis }))

    const { GET } = await import('@/app/api/cron/alerts/route')

    const res = await GET({
      headers: new Headers([['authorization', 'Bearer 0123456789abcdef']])
    } as unknown as Parameters<typeof GET>[0])

    expect(res.status).toBe(200)

    const json = (await res.json()) as {
      instancesCreated?: number
      notificationsCreated?: number
      evaluated?: number
      triggered?: number
    }

    expect(json.evaluated).toBe(1)
    expect(json.triggered).toBe(1)
    expect(json.instancesCreated).toBe(1)
    expect(json.notificationsCreated).toBe(2)

    expect(db.__inserted.alert_instances).toHaveLength(1)
    expect(db.__inserted.notifications).toHaveLength(2)
  })

  it('does not create a new instance when within cooldown', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    process.env.CRON_SECRET = '0123456789abcdef'

    const db = createDbMock()
    const redis = createRedisMock()

    db.query.alerts.findMany.mockResolvedValue([
      {
        id: 'alert-1',
        name: 'API error rate',
        description: 'API error rate is too high',
        type: 'performance',
        severity: 'critical',
        conditions: JSON.stringify({
          metric: 'api_error_rate',
          operator: 'gt',
          threshold: 1,
          timeRangeMinutes: 10,
          cooldownMinutes: 60
        }),
        isActive: true,
        createdBy: 'admin-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      }
    ])

    db.query.apiUsage.findMany.mockResolvedValue([{ statusCode: 200 }, { statusCode: 500 }])

    db.query.users.findMany.mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }])

    let instanceCall = 0
    db.query.alertInstances.findFirst.mockImplementation(async () => {
      instanceCall += 1
      if (instanceCall === 1) return null
      return { triggeredAt: new Date('2026-01-01T00:00:00.000Z') }
    })

    vi.doMock('@isyuricunha/db', () => createDbModuleMock(db))
    vi.doMock('@isyuricunha/kv', () => ({ redis }))

    const { GET } = await import('@/app/api/cron/alerts/route')

    const headers = new Headers([['authorization', 'Bearer 0123456789abcdef']])

    const res1 = await GET({ headers } as unknown as Parameters<typeof GET>[0])
    expect(res1.status).toBe(200)

    const res2 = await GET({ headers } as unknown as Parameters<typeof GET>[0])
    expect(res2.status).toBe(200)

    expect(db.__inserted.alert_instances).toHaveLength(1)
    expect(db.__inserted.notifications).toHaveLength(2)
  })
})
