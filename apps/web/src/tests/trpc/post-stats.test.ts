import { beforeEach, describe, expect, it, vi } from 'vitest'
import { postStatsRouter } from '@/trpc/routers/post-stats'

const mocks = vi.hoisted(() => ({
  limit: vi.fn(async () => ({ success: true })),
  select: vi.fn(),
  where: vi.fn()
}))

vi.mock('@isyuricunha/env', () => ({ env: { NODE_ENV: 'test' } }))
vi.mock('@isyuricunha/db', () => ({
  inArray: (_field: unknown, slugs: string[]) => slugs,
  posts: { slug: 'slug', views: 'views', likes: 'likes' },
  db: {},
  apiUsage: {},
  errorLogs: {},
  errorTracking: {}
}))
vi.mock('@isyuricunha/kv', () => ({
  ratelimit: { limit: mocks.limit },
  telemetryRatelimit: { limit: vi.fn(async () => ({ success: true })) }
}))
vi.mock('content-collections', () => ({
  allPosts: [{ slug: 'hello' }, { slug: 'other' }]
}))
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() }
}))
vi.mock('@/lib/auth', () => ({ getSession: vi.fn(async () => null) }))

const caller = () =>
  postStatsRouter.createCaller({
    headers: new Headers({ 'x-vercel-forwarded-for': '203.0.113.5' }),
    db: {
      select: mocks.select.mockImplementation(() => ({
        from: () => ({ where: mocks.where })
      }))
    },
    session: null
  } as unknown as Parameters<typeof postStatsRouter.createCaller>[0])

describe('postStats.getBatch', () => {
  beforeEach(() => {
    mocks.limit.mockClear()
    mocks.select.mockClear()
    mocks.where.mockReset()
    mocks.where.mockResolvedValue([{ slug: 'hello', views: 12, likes: 3 }])
  })

  it('reads visible slugs in one query and provides zeros for missing rows', async () => {
    const result = await caller().getBatch({ slugs: ['hello', 'hello', 'other', 'unknown'] })
    expect(result).toEqual({
      hello: { views: 12, likes: 3 },
      other: { views: 0, likes: 0 }
    })
    expect(mocks.where).toHaveBeenCalledWith(['hello', 'other'])
    expect(mocks.select).toHaveBeenCalledTimes(1)
  })

  it('does not query the database when no known slugs were requested', async () => {
    const result = await caller().getBatch({ slugs: ['unknown'] })
    expect(result).toEqual({})
    expect(mocks.select).not.toHaveBeenCalled()
  })

  it('rejects oversized batches to prevent unbounded queries', async () => {
    await expect(
      caller().getBatch({ slugs: Array.from({ length: 33 }, () => 'hello') })
    ).rejects.toThrow()
    expect(mocks.select).not.toHaveBeenCalled()
  })
})
