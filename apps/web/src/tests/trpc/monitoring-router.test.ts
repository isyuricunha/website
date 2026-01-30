import { beforeEach, describe, expect, it, vi } from 'vitest'

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
      logSystemAction = auditLogMock
    },
    getIpFromHeaders: () => '203.0.113.10',
    getUserAgentFromHeaders: () => 'vitest'
  }
})

type InsertedRows = {
  analytics_events: any[]
  resource_usage: any[]
  error_tracking: any[]
}

const createDbMock = () => {
  const state: InsertedRows = {
    analytics_events: [],
    resource_usage: [],
    error_tracking: [
      {
        id: 'err-1',
        resolved: false,
        resolvedAt: null
      }
    ]
  }

  const insert = vi.fn((table: any) => {
    return {
      values: vi.fn(async (value: any) => {
        const tableName = table?.[Symbol.for('drizzle:Name')] ?? null

        if (tableName === 'analytics_events') {
          state.analytics_events.push(value)
        }

        if (tableName === 'resource_usage') {
          state.resource_usage.push(...(Array.isArray(value) ? value : [value]))
        }

        return
      })
    }
  })

  const updateErrorWhere = vi.fn(async () => {
    for (const row of state.error_tracking) {
      row.resolved = true
      row.resolvedAt = new Date()
    }
    return
  })

  const updateErrorSet = vi.fn(() => ({ where: updateErrorWhere }))

  const update = vi.fn((table: unknown) => {
    const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null
    const set = tableName === 'error_tracking' ? updateErrorSet : vi.fn(() => ({ where: vi.fn() }))
    return { set }
  })

  return {
    insert,
    update,
    __state: state
  }
}

describe('monitoringRouter', () => {
  beforeEach(() => {
    auditLogMock.mockClear()
    vi.resetModules()
  })

  it('recordAnalyticsEvent inserts analytics event row', async () => {
    const { monitoringRouter } = await import('@/trpc/routers/monitoring')
    const db = createDbMock()

    const caller = monitoringRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'user-agent': 'vitest', 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof monitoringRouter.createCaller>[0])

    const result = await caller.recordAnalyticsEvent({
      eventType: 'page_view',
      page: '/admin/monitoring',
      properties: { tab: 'overview' }
    })

    expect(result.success).toBe(true)
    expect(db.__state.analytics_events).toHaveLength(1)
    expect(db.__state.analytics_events[0]?.eventType).toBe('page_view')
    expect(db.__state.analytics_events[0]?.page).toBe('/admin/monitoring')
  })

  it('recordResourceSnapshot inserts cpu and memory rows', async () => {
    const { monitoringRouter } = await import('@/trpc/routers/monitoring')
    const db = createDbMock()

    const caller = monitoringRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'user-agent': 'vitest', 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof monitoringRouter.createCaller>[0])

    const result = await caller.recordResourceSnapshot()

    expect(result.success).toBe(true)
    expect(db.__state.resource_usage.length).toBeGreaterThanOrEqual(2)

    const types = new Set(db.__state.resource_usage.map((r) => r.type))
    expect(types.has('cpu')).toBe(true)
    expect(types.has('memory')).toBe(true)
  })

  it('resolveAllErrors marks error tracking rows as resolved', async () => {
    const { monitoringRouter } = await import('@/trpc/routers/monitoring')
    const db = createDbMock()

    const caller = monitoringRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'user-agent': 'vitest', 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof monitoringRouter.createCaller>[0])

    const result = await caller.resolveAllErrors()

    expect(result.success).toBe(true)
    expect(db.__state.error_tracking[0]?.resolved).toBe(true)
    expect(auditLogMock).toHaveBeenCalledTimes(1)
  })
})
