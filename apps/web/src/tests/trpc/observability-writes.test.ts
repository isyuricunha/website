import { beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * Observability middleware contract: telemetry must never become a
 * write-amplification channel, and must never cost us the data needed to
 * debug an incident. One api_usage row per real request, nothing for bots,
 * nothing for rate-limit floods, error tables only for unexpected failures,
 * and telemetry KEPT when the limiter itself degrades (fail open).
 */
vi.stubEnv('NODE_ENV', 'production')

vi.mock('@isyuricunha/env', () => ({
  flags: { turnstile: false },
  env: { NODE_ENV: 'production' }
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }
}))

vi.mock('@/lib/auth', () => ({ getSession: vi.fn(async () => null) }))

const limits = vi.hoisted(() => ({
  telemetry_mode: 'allow',
  procedure_success: true,
  telemetry_keys: [] as string[]
}))

vi.mock('content-collections', () => ({ allPosts: [{ slug: 'ok-post' }] }))

// The telemetry limiter is exported from @isyuricunha/kv and is deliberately
// NOT wrapped in withFailClosed. Raw @upstash/ratelimit resolves
// { success: true, reason: 'timeout' } on timeout, so this mock reproduces
// that exact shape: the degradation path must be covered, not only throws.
vi.mock('@isyuricunha/kv', () => ({
  telemetryRatelimit: {
    limit: vi.fn(async (key: string) => {
      limits.telemetry_keys.push(key)
      if (limits.telemetry_mode === 'throw') throw new Error('redis unreachable')
      if (limits.telemetry_mode === 'timeout') return { success: true, reason: 'timeout' }
      return { success: limits.telemetry_mode === 'allow' }
    })
  },
  ratelimit: {
    limit: vi.fn(async () => ({ success: limits.procedure_success }))
  },
  redis: {
    get: vi.fn(async () => null),
    set: vi.fn(async () => 'OK'),
    del: vi.fn(async () => 1)
  },
  redisKeys: {
    postViews: (slug: string) => `post:views:${slug}`,
    postViewCount: 'post:views:count'
  }
}))

const tables = vi.hoisted(() => ({
  apiUsage: { name: 'apiUsage' },
  errorLogs: { name: 'errorLogs' },
  errorTracking: { name: 'errorTracking' },
  posts: { name: 'posts' }
}))

vi.mock('@isyuricunha/db', () => ({
  ...tables,
  eq: (left: unknown) => left,
  sql: (value: unknown) => value,
  sum: (value: unknown) => value
}))

type InsertedRow = { table: string; values: Record<string, unknown> }

const makeCtx = (user_agent?: string, ip = '203.0.113.7') => {
  const headers = new Headers()
  if (ip) headers.set('x-vercel-forwarded-for', ip)
  if (user_agent) headers.set('user-agent', user_agent)

  const inserted: InsertedRow[] = []
  const db = {
    select: vi.fn(() => ({ from: vi.fn(async () => [{ value: 5, views: 10 }]) })),
    insert: vi.fn((table: { name: string }) => ({
      values: vi.fn(async (values: Record<string, unknown>) => {
        inserted.push({ table: table.name, values })
        return { rowCount: 1 }
      })
    }))
  }

  return {
    ctx: { db, session: null, method: 'POST', url: '/api/trpc', headers },
    inserted
  }
}

const BROWSER_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36'
const CRAWLER_UA = 'Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.html#crawler)'

describe('trpc observability middleware', () => {
  beforeEach(() => {
    limits.telemetry_mode = 'allow'
    limits.procedure_success = true
    limits.telemetry_keys.length = 0
  })

  it('writes exactly one api_usage row per successful public call', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    const { ctx, inserted } = makeCtx(BROWSER_UA)

    await viewsRouter.createCaller(ctx as never).getCount()

    expect(inserted.map((r) => r.table)).toEqual(['apiUsage'])
  })

  it('records the platform-trusted ip, not a client-supplied header', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    const { ctx, inserted } = makeCtx(BROWSER_UA)
    ctx.headers.set('x-forwarded-for', '10.1.2.3')

    await viewsRouter.createCaller(ctx as never).getCount()

    expect(inserted[0]?.values.ipAddress).toBe('203.0.113.7')
    expect(limits.telemetry_keys).toEqual(['trpc:telemetry:203.0.113.7'])
  })

  it('writes zero rows when the request is rejected by rate limit', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    limits.procedure_success = false
    const { ctx, inserted } = makeCtx(BROWSER_UA)

    await expect(viewsRouter.createCaller(ctx as never).getCount()).rejects.toMatchObject({
      code: 'TOO_MANY_REQUESTS'
    })

    expect(inserted).toHaveLength(0)
  })

  it('writes zero rows for crawler user agents and never consults the limiter', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    const { ctx, inserted } = makeCtx(CRAWLER_UA)

    await viewsRouter.createCaller(ctx as never).getCount()

    expect(inserted).toHaveLength(0)
    expect(limits.telemetry_keys).toHaveLength(0)
  })

  it('writes zero rows when the user agent is missing', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    const { ctx, inserted } = makeCtx()

    await viewsRouter.createCaller(ctx as never).getCount()

    expect(inserted).toHaveLength(0)
  })

  it('does not record expected NOT_FOUND responses in the error tables', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    const { ctx, inserted } = makeCtx(BROWSER_UA)

    await expect(
      viewsRouter.createCaller(ctx as never).increment({ slug: 'missing-post' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })

    expect(inserted.map((r) => r.table)).toEqual(['apiUsage'])
  })

  it('stops writing when the telemetry limiter is exhausted', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    limits.telemetry_mode = 'deny'
    const { ctx, inserted } = makeCtx(BROWSER_UA)

    await viewsRouter.createCaller(ctx as never).getCount()

    expect(inserted).toHaveLength(0)
  })

  it('KEEPS telemetry when the limiter times out (fail open, not fail closed)', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    limits.telemetry_mode = 'timeout'
    const { ctx, inserted } = makeCtx(BROWSER_UA)

    await viewsRouter.createCaller(ctx as never).getCount()

    expect(inserted.map((r) => r.table)).toEqual(['apiUsage'])
  })

  it('KEEPS telemetry when the limiter throws (redis unreachable)', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    limits.telemetry_mode = 'throw'
    const { ctx, inserted } = makeCtx(BROWSER_UA)

    await viewsRouter.createCaller(ctx as never).getCount()

    expect(inserted.map((r) => r.table)).toEqual(['apiUsage'])
  })

  it('skips the per-ip cap when no platform header is present (dev fallback)', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')
    limits.telemetry_mode = 'deny'
    const { ctx, inserted } = makeCtx(BROWSER_UA, '')

    await viewsRouter.createCaller(ctx as never).getCount()

    // The whole site would otherwise share a single 0.0.0.0 bucket.
    expect(limits.telemetry_keys).toHaveLength(0)
    expect(inserted.map((r) => r.table)).toEqual(['apiUsage'])
  })
})
