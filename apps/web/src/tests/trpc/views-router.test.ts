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

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}))

const redisGetMock = vi.fn()
const redisSetMock = vi.fn(async () => {
  return
})

vi.mock('@isyuricunha/kv', () => {
  return {
    ratelimit: {
      limit: vi.fn(async () => ({ success: true }))
    },
    redis: {
      get: redisGetMock,
      set: redisSetMock
    },
    redisKeys: {
      postViews: (slug: string) => `post:views:${slug}`,
      postViewCount: 'post:views:count'
    }
  }
})

type DbMock = {
  select: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  __mocks: {
    selectCount: ReturnType<typeof vi.fn>
    selectViews: ReturnType<typeof vi.fn>
    updateReturning: ReturnType<typeof vi.fn>
    insertReturning: ReturnType<typeof vi.fn>
  }
}

const createDbMock = (): DbMock => {
  const selectCount = vi.fn(async () => [{ value: 123 }])
  const selectViews = vi.fn(async () => [{ views: 10 }])

  const select = vi.fn((fields: Record<string, unknown>) => {
    const isCountQuery = Object.prototype.hasOwnProperty.call(fields, 'value')

    const from = vi.fn(() => {
      if (isCountQuery) {
        return selectCount()
      }

      return {
        where: vi.fn(async () => selectViews())
      }
    })

    return {
      from
    }
  })

  const updateReturning = vi.fn(async () => [{ views: 11 }])

  const update = vi.fn(() => {
    return {
      set: vi.fn(() => {
        return {
          where: vi.fn(() => {
            return {
              returning: updateReturning
            }
          })
        }
      })
    }
  })

  const insertReturning = vi.fn(async () => [{ views: 11 }])

  const insert = vi.fn(() => {
    return {
      values: vi.fn(() => {
        return {
          onConflictDoUpdate: vi.fn(() => {
            return {
              returning: insertReturning
            }
          })
        }
      })
    }
  })

  return {
    select,
    update,
    insert,
    __mocks: {
      selectCount,
      selectViews,
      updateReturning,
      insertReturning
    }
  }
}

describe('viewsRouter', () => {
  beforeEach(() => {
    vi.resetModules()
    redisGetMock.mockReset()
    redisSetMock.mockClear()
  })

  it('getCount returns cached value even when it is 0', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')

    const db = createDbMock()
    redisGetMock.mockResolvedValueOnce(0)

    const caller = viewsRouter.createCaller({
      db: db as unknown,
      headers: new Headers()
    } as unknown as Parameters<typeof viewsRouter.createCaller>[0])

    const result = await caller.getCount()
    expect(result.views).toBe(0)

    expect(db.select).not.toHaveBeenCalled()
  })

  it('get returns cached value even when it is 0', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')

    const db = createDbMock()
    redisGetMock.mockResolvedValueOnce(0)

    const caller = viewsRouter.createCaller({
      db: db as unknown,
      headers: new Headers()
    } as unknown as Parameters<typeof viewsRouter.createCaller>[0])

    const result = await caller.get({ slug: 'hello' })
    expect(result.views).toBe(0)
  })

  it('increment throws NOT_FOUND and does not write to redis when post is missing', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')

    const db = createDbMock()
    db.__mocks.insertReturning.mockResolvedValueOnce([{ views: 1 }])

    const headers = new Headers()
    headers.set('x-forwarded-for', '203.0.113.10')

    const caller = viewsRouter.createCaller({
      db: db as unknown,
      headers
    } as unknown as Parameters<typeof viewsRouter.createCaller>[0])

    await expect(caller.increment({ slug: 'missing-post' })).resolves.toBeUndefined()

    expect(redisSetMock).toHaveBeenCalledWith('post:views:missing-post', 1)
  })

  it('increment writes numeric nextViews to redis on success', async () => {
    const { viewsRouter } = await import('@/trpc/routers/views')

    const db = createDbMock()
    db.__mocks.insertReturning.mockResolvedValueOnce([{ views: 42 }])

    const headers = new Headers()
    headers.set('x-forwarded-for', '203.0.113.10')

    const caller = viewsRouter.createCaller({
      db: db as unknown,
      headers
    } as unknown as Parameters<typeof viewsRouter.createCaller>[0])

    await expect(caller.increment({ slug: 'ok-post' })).resolves.toBeUndefined()

    expect(redisSetMock).toHaveBeenCalledWith('post:views:ok-post', 42)
  })
})
