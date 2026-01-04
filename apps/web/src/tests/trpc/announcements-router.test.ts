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

const logSystemActionMock = vi.fn().mockImplementation(async () => {
  return
})

vi.mock('@/lib/audit-logger', () => {
  return {
    AuditLogger: class {
      logSystemAction = logSystemActionMock
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

type AnnouncementRow = {
  id: string
  title: string
  content: string
  type: string
  priority: number
  isActive: boolean
  isDismissible: boolean
  targetAudience: string | null
  startDate: Date | null
  endDate: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

type AnnouncementInteractionRow = {
  id: string
  announcementId: string
  userId: string
  viewed: boolean
  dismissed: boolean
  viewedAt: Date | null
  dismissedAt: Date | null
}

const createDbMock = () => {
  const now = new Date()
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

  const announcementsRows: AnnouncementRow[] = [
    {
      id: 'a-role-admin',
      title: 'Admin only',
      content: 'secret',
      type: 'info',
      priority: 0,
      isActive: true,
      isDismissible: true,
      targetAudience: JSON.stringify({ userRoles: ['admin'] }),
      startDate: null,
      endDate: null,
      createdBy: 'admin-1',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'a-role-user-legacy',
      title: 'Users only',
      content: 'hello',
      type: 'info',
      priority: 0,
      isActive: true,
      isDismissible: true,
      targetAudience: JSON.stringify({ roles: ['user'] }),
      startDate: null,
      endDate: null,
      createdBy: 'admin-1',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'a-invalid-json',
      title: 'Broken JSON',
      content: 'still visible',
      type: 'info',
      priority: 0,
      isActive: true,
      isDismissible: true,
      targetAudience: '{',
      startDate: null,
      endDate: null,
      createdBy: 'admin-1',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'a-future',
      title: 'Future',
      content: 'scheduled',
      type: 'info',
      priority: 0,
      isActive: true,
      isDismissible: true,
      targetAudience: null,
      startDate: oneYearFromNow,
      endDate: null,
      createdBy: 'admin-1',
      createdAt: now,
      updatedAt: now
    }
  ]

  const interactions: AnnouncementInteractionRow[] = []

  const insertValues = vi.fn(async (_value: unknown) => {
    return
  })

  const insert = vi.fn((table: unknown) => {
    return {
      values: vi.fn(async (value: any) => {
        const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null

        if (tableName === 'announcement_interactions') {
          interactions.push({
            id: value.id,
            announcementId: value.announcementId,
            userId: value.userId,
            viewed: value.viewed,
            dismissed: value.dismissed,
            viewedAt: value.viewedAt ?? null,
            dismissedAt: value.dismissedAt ?? null
          })
        }

        if (tableName === 'announcements') {
          announcementsRows.push(value)
        }

        await insertValues(value)
        return
      })
    }
  })

  const updateWhere = vi.fn(async () => {
    // we update the first interaction only; tests will set state so this is sufficient
    const first = interactions[0]
    if (!first) return

    if (
      typeof (updateWhere as any).__pendingSet === 'object' &&
      (updateWhere as any).__pendingSet
    ) {
      const setData = (updateWhere as any).__pendingSet as Record<string, unknown>
      if (typeof setData.viewed === 'boolean') first.viewed = setData.viewed
      if (typeof setData.dismissed === 'boolean') first.dismissed = setData.dismissed
      if (setData.viewedAt instanceof Date) first.viewedAt = setData.viewedAt
      if (setData.dismissedAt instanceof Date) first.dismissedAt = setData.dismissedAt
    }

    return
  })

  const updateSet = vi.fn((data: any) => {
    ; (updateWhere as any).__pendingSet = data
    return { where: updateWhere }
  })

  const update = vi.fn((table: unknown) => {
    const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null
    if (tableName === 'announcement_interactions') {
      return { set: updateSet }
    }

    const noopWhere = vi.fn(async () => {
      return
    })

    return { set: vi.fn(() => ({ where: noopWhere })) }
  })

  const query = {
    announcements: {
      findMany: vi.fn(async () => announcementsRows)
    },
    announcementInteractions: {
      findMany: vi.fn(async () => interactions),
      findFirst: vi.fn(async () => interactions[0] ?? null)
    }
  }

  return {
    insert,
    update,
    query,
    __state: {
      announcements: announcementsRows,
      interactions
    },
    __mocks: {
      updateWhere,
      updateSet,
      insertValues
    }
  }
}

describe('announcementsRouter', () => {
  beforeEach(() => {
    logSystemActionMock.mockClear()
    vi.resetModules()
  })

  it('filters announcements by targeting (userRoles + legacy roles) and tolerates invalid JSON', async () => {
    const { announcementsRouter } = await import('@/trpc/routers/announcements')

    const db = createDbMock()

    const caller = announcementsRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: {
        user: { id: 'user-1', role: 'user' }
      }
    } as unknown as Parameters<typeof announcementsRouter.createCaller>[0])

    const result = await caller.getAnnouncements({ active: true, adminView: false })

    const ids = result.announcements.map((a) => a.id)
    expect(ids).toContain('a-role-user-legacy')
    expect(ids).toContain('a-invalid-json')
    expect(ids).not.toContain('a-role-admin')
  }, 15_000)

  it('does not apply date-window filtering for announcements', async () => {
    const { announcementsRouter } = await import('@/trpc/routers/announcements')

    const db = createDbMock()

    const callerAdmin = announcementsRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: {
        user: { id: 'admin-1', role: 'admin' }
      }
    } as unknown as Parameters<typeof announcementsRouter.createCaller>[0])

    const nonAdminView = await callerAdmin.getAnnouncements({ active: true, adminView: false })
    expect(nonAdminView.announcements.map((a) => a.id)).toContain('a-future')

    const adminView = await callerAdmin.getAnnouncements({ active: true, adminView: true })
    expect(adminView.announcements.map((a) => a.id)).toContain('a-future')
  }, 15_000)

  it('markAnnouncementViewed inserts a new interaction when missing', async () => {
    const { announcementsRouter } = await import('@/trpc/routers/announcements')

    const db = createDbMock()

    const caller = announcementsRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: {
        user: { id: 'user-1', role: 'user' }
      }
    } as unknown as Parameters<typeof announcementsRouter.createCaller>[0])

    const result = await caller.markAnnouncementViewed({ announcementId: 'a-invalid-json' })
    expect(result.success).toBe(true)
    expect(db.__state.interactions).toHaveLength(1)

    const interaction = db.__state.interactions[0]
    expect(interaction?.announcementId).toBe('a-invalid-json')
    expect(interaction?.userId).toBe('user-1')
    expect(interaction?.viewed).toBe(true)
    expect(interaction?.dismissed).toBe(false)
    expect(interaction?.viewedAt).toBeInstanceOf(Date)
  }, 15_000)

  it('markAnnouncementViewed updates an existing interaction if it exists and is not viewed', async () => {
    const { announcementsRouter } = await import('@/trpc/routers/announcements')

    const db = createDbMock()

    // Seed a non-viewed interaction
    db.__state.interactions.push({
      id: 'interaction-1',
      announcementId: 'a-invalid-json',
      userId: 'user-1',
      viewed: false,
      dismissed: false,
      viewedAt: null,
      dismissedAt: null
    })

    const caller = announcementsRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: {
        user: { id: 'user-1', role: 'user' }
      }
    } as unknown as Parameters<typeof announcementsRouter.createCaller>[0])

    const result = await caller.markAnnouncementViewed({ announcementId: 'a-invalid-json' })
    expect(result.success).toBe(true)

    const interaction = db.__state.interactions[0]
    expect(interaction?.viewed).toBe(true)
    expect(interaction?.viewedAt).toBeInstanceOf(Date)
  }, 15_000)

  it('markAnnouncementViewed tolerates foreign key violations (announcement deleted) and returns success', async () => {
    const { announcementsRouter } = await import('@/trpc/routers/announcements')

    const db = createDbMock()
    db.insert.mockImplementationOnce(() => {
      const err = new Error('fk violation') as Error & { code?: string }
      err.code = '23503'
      return {
        values: vi.fn(async () => {
          throw err
        })
      }
    })

    const caller = announcementsRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: {
        user: { id: 'user-1', role: 'user' }
      }
    } as unknown as Parameters<typeof announcementsRouter.createCaller>[0])

    const result = await caller.markAnnouncementViewed({ announcementId: 'missing' })
    expect(result.success).toBe(true)
  }, 15_000)

  it('dismissAnnouncement tolerates foreign key violations (announcement deleted) and returns success', async () => {
    const { announcementsRouter } = await import('@/trpc/routers/announcements')

    const db = createDbMock()
    db.insert.mockImplementationOnce(() => {
      const err = new Error('fk violation') as Error & { code?: string }
      err.code = '23503'
      return {
        values: vi.fn(async () => {
          throw err
        })
      }
    })

    const caller = announcementsRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: {
        user: { id: 'user-1', role: 'user' }
      }
    } as unknown as Parameters<typeof announcementsRouter.createCaller>[0])

    const result = await caller.dismissAnnouncement({ announcementId: 'missing' })
    expect(result.success).toBe(true)
  }, 15_000)
})
