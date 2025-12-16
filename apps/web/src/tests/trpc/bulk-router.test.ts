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
      GOOGLE_CLIENT_ID: 'token',
      GOOGLE_CLIENT_SECRET: 'token',
      GITHUB_CLIENT_ID: 'token',
      GITHUB_CLIENT_SECRET: 'token',
      BETTER_AUTH_SECRET: 'token',
      BETTER_AUTH_URL: 'https://example.com'
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

const logBulkOperationMock = vi.fn().mockImplementation(async () => {
  return
})

vi.mock('@/lib/audit-logger', () => {
  return {
    AuditLogger: class {
      logBulkOperation = logBulkOperationMock
      logUserAction = vi.fn().mockImplementation(async () => {
        return
      })
    },
    getIpFromHeaders: () => '203.0.113.10',
    getUserAgentFromHeaders: () => {
      return
    }
  }
})

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()

  return {
    ...actual,
    randomBytes: () => ({
      toString: () => 'operation-id'
    })
  }
})

type BulkOperationRow = {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  parameters: string | null
  results: string | null
  errorMessage: string | null
  startedAt: Date | null
  completedAt: Date | null
  createdBy: string
  createdAt: Date
  createdByUser?: {
    id: string
    name: string
    email: string
  }
}

type PostRow = {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  publishedAt: Date | null
  updatedAt: Date
}

const createDbMock = () => {
  const operations: BulkOperationRow[] = []
  const posts: PostRow[] = []

  const insert = vi.fn(() => ({
    values: vi.fn(async (value: Omit<BulkOperationRow, 'createdByUser'>) => {
      operations.push({
        ...value,
        createdByUser: {
          id: value.createdBy,
          name: 'Admin',
          email: 'admin@example.com'
        }
      })
      return
    })
  }))

  const update = vi.fn(() => ({
    set: vi.fn((setValue: Partial<BulkOperationRow> | Partial<PostRow>) => ({
      where: vi.fn(async () => {
        const isPostUpdate = 'updatedAt' in setValue || 'publishedAt' in setValue

        if (isPostUpdate) {
          for (const p of posts) {
            Object.assign(p, setValue)
          }
          return
        }

        const op = operations[0]
        if (op) {
          Object.assign(op, setValue)
        }
      })
    }))
  }))

  const del = vi.fn(() => ({
    where: vi.fn(async () => {
      posts.splice(0, posts.length)
      return
    })
  }))

  const query = {
    bulkOperations: {
      findFirst: vi.fn(async () => operations[0] ?? null),
      findMany: vi.fn(async (opts?: { limit?: number; offset?: number }) => {
        const limit = opts?.limit ?? operations.length
        const offset = opts?.offset ?? 0
        return operations.slice(offset, offset + limit)
      })
    },
    posts: {
      findMany: vi.fn(async () => posts.map((p) => ({ ...p })))
    }
  }

  return {
    insert,
    update,
    delete: del,
    query,
    __state: { operations, posts }
  }
}

describe('bulkRouter queue', () => {
  beforeEach(() => {
    logBulkOperationMock.mockClear()
    vi.resetModules()
  })

  it('lists bulk operations with parsed params/results and progress', async () => {
    const { bulkRouter } = await import('@/trpc/routers/bulk')

    const db = createDbMock()
    db.__state.operations.push({
      id: 'op-1',
      type: 'post_publish',
      status: 'running',
      totalItems: 10,
      processedItems: 3,
      successfulItems: 2,
      failedItems: 1,
      parameters: JSON.stringify({ action: 'publish' }),
      results: JSON.stringify([{ postId: 'a', success: true }]),
      errorMessage: null,
      startedAt: new Date(),
      completedAt: null,
      createdBy: 'admin-1',
      createdAt: new Date(),
      createdByUser: { id: 'admin-1', name: 'Admin', email: 'admin@example.com' }
    })

    const caller = bulkRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof bulkRouter.createCaller>[0])

    const result = await caller.listBulkOperations({ limit: 20, offset: 0 })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('op-1')
    expect(result[0]?.progress).toBe(30)
    expect(result[0]?.parameters).toEqual({ action: 'publish' })
    expect(result[0]?.results).toEqual([{ postId: 'a', success: true }])
  }, 15_000)

  it('bulkPostAction publishes posts and completes an operation', async () => {
    const { bulkRouter } = await import('@/trpc/routers/bulk')

    const db = createDbMock()
    db.__state.posts.push(
      { id: 'a', title: 'A', status: 'draft', publishedAt: null, updatedAt: new Date() },
      { id: 'b', title: 'B', status: 'draft', publishedAt: null, updatedAt: new Date() }
    )

    const caller = bulkRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof bulkRouter.createCaller>[0])

    const result = await caller.bulkPostAction({ postIds: ['a', 'b'], action: 'publish' })

    expect(result.success).toBe(true)
    expect(result.operationId).toEqual(expect.any(String))
    expect(result.summary.processed).toBe(2)

    expect(result.operationId).toBe(db.__state.operations[0]?.id)

    expect(db.__state.operations[0]?.status).toBe('completed')
    expect(logBulkOperationMock).toHaveBeenCalledTimes(1)
  })
})
