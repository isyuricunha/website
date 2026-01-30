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

type InsertedRows = {
  analytics_events: any[]
  resource_usage: any[]
}

const createDbMock = () => {
  const state: InsertedRows = {
    analytics_events: [],
    resource_usage: []
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

  return {
    insert,
    __state: state
  }
}

describe('monitoringRouter', () => {
  beforeEach(() => {
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
})
