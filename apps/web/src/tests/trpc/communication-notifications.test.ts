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

const logUserActionMock = vi.fn().mockImplementation(async () => {
  return
})

vi.mock('@/lib/audit-logger', () => {
  return {
    AuditLogger: class {
      logUserAction = logUserActionMock
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

type NotificationRow = {
  id: string
  userId: string
  title: string
  message: string
  type: 'system' | 'user_action' | 'content' | 'security' | 'marketing' | 'reminder'
  data: string | null
  read: boolean
  readAt: Date | null
  actionUrl: string | null
  expiresAt: Date | null
  createdAt: Date
}

const createDbMock = () => {
  const now = new Date()

  const notification_rows: NotificationRow[] = [
    {
      id: 'n-1',
      userId: 'user-1',
      title: 'Security alert',
      message: 'Something happened',
      type: 'security',
      data: null,
      read: false,
      readAt: null,
      actionUrl: null,
      expiresAt: null,
      createdAt: now
    },
    {
      id: 'n-2',
      userId: 'user-2',
      title: 'Welcome',
      message: 'Hi',
      type: 'user_action',
      data: '{"foo":"bar"}',
      read: false,
      readAt: null,
      actionUrl: null,
      expiresAt: null,
      createdAt: now
    }
  ]

  const updateWhere = vi.fn(async () => {
    const pendingId = (updateWhere as any).__pendingId as string | undefined
    const target = pendingId
      ? notification_rows.find((n) => n.id === pendingId)
      : notification_rows[0]
    if (!target) return

    if (
      typeof (updateWhere as any).__pendingSet === 'object' &&
      (updateWhere as any).__pendingSet
    ) {
      const setData = (updateWhere as any).__pendingSet as Record<string, unknown>
      if (typeof setData.read === 'boolean') target.read = setData.read
      if (setData.readAt instanceof Date) target.readAt = setData.readAt
    }

    return
  })

  const updateSet = vi.fn((data: any) => {
    ;(updateWhere as any).__pendingSet = data
    return {
      where: vi.fn(async () => {
        return updateWhere()
      })
    }
  })

  const update = vi.fn(() => ({
    set: updateSet
  }))

  const insert = vi.fn(() => ({
    values: vi.fn(async (value: any) => {
      if (Array.isArray(value)) {
        value.forEach((v) => notification_rows.push(v))
      } else {
        notification_rows.push(value)
      }
      return
    })
  }))

  const query = {
    notifications: {
      findMany: vi.fn(async (opts?: any) => {
        const whereStr = opts?.where ? String(opts.where) : ''
        if (whereStr.includes('user-1')) {
          return notification_rows.filter((n) => n.userId === 'user-1')
        }
        if (whereStr.includes('user-2')) {
          return notification_rows.filter((n) => n.userId === 'user-2')
        }
        return notification_rows
      })
    },
    users: {
      findMany: vi.fn(async () => [{ id: 'user-1' }, { id: 'user-2' }])
    }
  }

  return {
    insert,
    update,
    query,
    __state: {
      notifications: notification_rows
    },
    __mocks: {
      updateWhere
    }
  }
}

describe('communicationRouter notifications', () => {
  beforeEach(() => {
    logUserActionMock.mockClear()
    vi.resetModules()
  })

  it('user getNotifications filters by userId and expiresAt, and computes total/hasMore on filtered set', async () => {
    const { communicationRouter } = await import('@/trpc/routers/communication')

    const db = createDbMock()

    const now = new Date()
    db.__state.notifications.push({
      id: 'n-expired',
      userId: 'user-1',
      title: 'Old',
      message: 'Expired message',
      type: 'system',
      data: null,
      read: false,
      readAt: null,
      actionUrl: null,
      expiresAt: new Date(now.getTime() - 60_000),
      createdAt: now
    })

    db.__state.notifications.push({
      id: 'n-read',
      userId: 'user-1',
      title: 'Read',
      message: 'Already read',
      type: 'system',
      data: null,
      read: true,
      readAt: now,
      actionUrl: null,
      expiresAt: null,
      createdAt: now
    })

    const caller = communicationRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: { user: { id: 'user-1', role: 'user' } }
    } as any)

    const result = await caller.getNotifications({ unreadOnly: false, limit: 1, offset: 0 })

    expect(result.notifications.every((n) => n.userId === 'user-1')).toBe(true)
    expect(result.notifications.some((n) => n.id === 'n-expired')).toBe(false)
    expect(result.total).toBe(2)
    expect(result.hasMore).toBe(true)
  })

  it('user getNotifications unreadOnly returns only unread and not expired', async () => {
    const { communicationRouter } = await import('@/trpc/routers/communication')

    const db = createDbMock()
    const now = new Date()

    db.__state.notifications.push({
      id: 'n-expired',
      userId: 'user-1',
      title: 'Old',
      message: 'Expired message',
      type: 'system',
      data: null,
      read: false,
      readAt: null,
      actionUrl: null,
      expiresAt: new Date(now.getTime() - 60_000),
      createdAt: now
    })

    db.__state.notifications.push({
      id: 'n-read',
      userId: 'user-1',
      title: 'Read',
      message: 'Already read',
      type: 'system',
      data: null,
      read: true,
      readAt: now,
      actionUrl: null,
      expiresAt: null,
      createdAt: now
    })

    const caller = communicationRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: { user: { id: 'user-1', role: 'user' } }
    } as any)

    const result = await caller.getNotifications({ unreadOnly: true, limit: 50, offset: 0 })

    expect(result.notifications.every((n) => n.userId === 'user-1')).toBe(true)
    expect(result.notifications.some((n) => n.id === 'n-expired')).toBe(false)
    expect(result.notifications.some((n) => n.read === true)).toBe(false)
    expect(result.total).toBe(1)
    expect(result.hasMore).toBe(false)
  })

  it('admin can list all notifications and receives severity + parsed data', async () => {
    const { communicationRouter } = await import('@/trpc/routers/communication')

    const db = createDbMock()
    const caller = communicationRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: { user: { id: 'admin-1', role: 'admin' } }
    } as any)

    const result = await caller.getAllNotifications({ limit: 50, offset: 0, includeExpired: true })

    expect(result.notifications).toHaveLength(2)
    const sec = result.notifications.find((n) => n.id === 'n-1')
    const ua = result.notifications.find((n) => n.id === 'n-2')

    expect(sec?.severity).toBe('error')
    expect(ua?.severity).toBe('success')
    expect(ua?.data).toEqual({ foo: 'bar' })
  })

  it('non-admin cannot access getAllNotifications', async () => {
    const { communicationRouter } = await import('@/trpc/routers/communication')

    const db = createDbMock()
    const caller = communicationRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: { user: { id: 'user-1', role: 'user' } }
    } as any)

    await expect(
      caller.getAllNotifications({ limit: 50, offset: 0, includeExpired: true })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('admin can mark any notification as read', async () => {
    const { communicationRouter } = await import('@/trpc/routers/communication')

    const db = createDbMock()
    const caller = communicationRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: { user: { id: 'admin-1', role: 'admin' } }
    } as any)

    ;(db.__mocks.updateWhere as any).__pendingId = 'n-1'

    const result = await caller.adminMarkNotificationRead({ notificationId: 'n-1' })
    expect(result.success).toBe(true)

    const n1 = db.__state.notifications.find((n) => n.id === 'n-1')
    expect(n1?.read).toBe(true)
    expect(n1?.readAt).toBeInstanceOf(Date)
  })
})
