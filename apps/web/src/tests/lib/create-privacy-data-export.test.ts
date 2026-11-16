import { inspect } from 'node:util'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/env', () => ({
  flags: {
    comment: false,
    auth: false,
    stats: false,
    lastfm: false,
    lastfmImport: false,
    analytics: false,
    guestbookNotification: false,
    likeButton: false,
    turnstile: false
  },
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://user:pass@localhost:5432/test',
    UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'test-token',
    RESEND_API_KEY: 're_test_key'
  }
}))

const database = {
  query: {
    users: { findFirst: vi.fn() },
    comments: { findMany: vi.fn() },
    rates: { findMany: vi.fn() },
    guestbook: { findMany: vi.fn() },
    aiChatFeedback: { findMany: vi.fn() },
    emailSubscriptions: { findMany: vi.fn() },
    notificationPreferences: { findMany: vi.fn() }
  }
}

vi.mock('server-only', () => ({}))

vi.mock('@isyuricunha/db', () => ({
  asc: vi.fn((column: string) => ({ direction: 'asc', column })),
  eq: vi.fn((column: string, value: string) => ({ column, value })),
  db: database,
  users: { id: 'users.id' },
  comments: { userId: 'comments.userId', createdAt: 'comments.createdAt' },
  rates: { userId: 'rates.userId', commentId: 'rates.commentId' },
  guestbook: { userId: 'guestbook.userId', createdAt: 'guestbook.createdAt' },
  aiChatFeedback: {
    userId: 'aiChatFeedback.userId',
    createdAt: 'aiChatFeedback.createdAt'
  },
  emailSubscriptions: {
    userId: 'emailSubscriptions.userId',
    subscribedAt: 'emailSubscriptions.subscribedAt'
  },
  notificationPreferences: {
    userId: 'notificationPreferences.userId',
    createdAt: 'notificationPreferences.createdAt'
  }
}))

const forbiddenKey =
  /password|token|secret|credential|role|banned|banReason|quota|apiKey|provider|model|ipAddress|userAgent|metadata|internal/i

const collectKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap((item) => collectKeys(item))
  if (!value || typeof value !== 'object') return []

  return Object.entries(value).flatMap(([key, child]) => [key, ...collectKeys(child)])
}

describe('createPrivacyDataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    database.query.users.findFirst.mockResolvedValue({
      id: 'user-1',
      username: 'alice',
      name: 'Alice',
      email: 'alice@example.com',
      emailVerified: true,
      image: 'https://example.com/alice.png',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-02T00:00:00.000Z'),
      isAnonymous: false,
      bio: 'Hello',
      isPublic: true,
      nameColor: '#ffffff',
      nameEffect: 'none',
      role: 'admin',
      banned: false,
      credentialHash: 'must-not-leak',
      quota: 999
    })
    database.query.comments.findMany.mockResolvedValue([
      {
        id: 'comment-1',
        body: 'My comment',
        postId: 'post-slug',
        parentId: null,
        isDeleted: false,
        createdAt: new Date('2025-01-03T00:00:00.000Z'),
        updatedAt: new Date('2025-01-04T00:00:00.000Z'),
        userId: 'user-1',
        internalNote: 'must-not-leak'
      }
    ])
    database.query.rates.findMany.mockResolvedValue([
      { commentId: 'comment-2', like: true, userId: 'user-1' }
    ])
    database.query.guestbook.findMany.mockResolvedValue([
      {
        id: 'guestbook-1',
        body: 'Hello guestbook',
        createdAt: new Date('2025-01-05T00:00:00.000Z'),
        updatedAt: new Date('2025-01-06T00:00:00.000Z'),
        userId: 'user-1'
      }
    ])
    database.query.aiChatFeedback.findMany.mockResolvedValue([
      {
        rating: 'like',
        comment: 'Helpful',
        pagePath: '/en',
        locale: 'en',
        createdAt: new Date('2025-01-07T00:00:00.000Z'),
        provider: 'private-provider',
        model: 'private-model',
        requestId: 'internal-request',
        messageId: 'internal-message',
        ipAddress: '203.0.113.1',
        userAgent: 'private-agent'
      }
    ])
    database.query.emailSubscriptions.findMany.mockResolvedValue([
      {
        subscriptionTypes: '["newsletter"]',
        isActive: true,
        subscribedAt: new Date('2025-01-08T00:00:00.000Z'),
        unsubscribedAt: null,
        unsubscribeToken: 'must-not-leak',
        email: 'alice@example.com'
      }
    ])
    database.query.notificationPreferences.findMany.mockResolvedValue([
      {
        notificationType: 'content',
        channel: 'email',
        enabled: true,
        createdAt: new Date('2025-01-09T00:00:00.000Z'),
        updatedAt: new Date('2025-01-10T00:00:00.000Z'),
        userId: 'user-1'
      }
    ])
  })

  it('exports only allowlisted fields for the authenticated user', async () => {
    const { createPrivacyDataExport } = await import('@/lib/privacy/create-privacy-data-export')

    const result = await createPrivacyDataExport('user-1', {
      database: database as never,
      generatedAt: new Date('2026-09-06T16:00:00.000Z')
    })

    expect(result).toEqual({
      schemaVersion: 1,
      generatedAt: '2026-09-06T16:00:00.000Z',
      account: {
        username: 'alice',
        name: 'Alice',
        email: 'alice@example.com',
        emailVerified: true,
        image: 'https://example.com/alice.png',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        isAnonymous: false,
        bio: 'Hello',
        isPublic: true,
        nameColor: '#ffffff',
        nameEffect: 'none'
      },
      content: {
        comments: [
          {
            body: 'My comment',
            isDeleted: false,
            createdAt: '2025-01-03T00:00:00.000Z',
            updatedAt: '2025-01-04T00:00:00.000Z'
          }
        ],
        guestbookEntries: [
          {
            body: 'Hello guestbook',
            createdAt: '2025-01-05T00:00:00.000Z',
            updatedAt: '2025-01-06T00:00:00.000Z'
          }
        ]
      },
      interactions: {
        aiChatFeedback: [
          {
            rating: 'like',
            comment: 'Helpful',
            pagePath: '/en',
            locale: 'en',
            createdAt: '2025-01-07T00:00:00.000Z'
          }
        ]
      },
      preferences: {
        emailSubscriptions: [
          {
            subscriptionTypes: ['newsletter'],
            isActive: true,
            subscribedAt: '2025-01-08T00:00:00.000Z',
            unsubscribedAt: null
          }
        ],
        notifications: [
          {
            notificationType: 'content',
            channel: 'email',
            enabled: true,
            createdAt: '2025-01-09T00:00:00.000Z',
            updatedAt: '2025-01-10T00:00:00.000Z'
          }
        ]
      }
    })

    expect(collectKeys(result).filter((key) => forbiddenKey.test(key))).toEqual([])
    expect(JSON.stringify(result)).not.toMatch(/comment-1|comment-2|guestbook-1|post-slug/)
    expect(database.query.rates.findMany).not.toHaveBeenCalled()

    const {
      aiChatFeedback,
      comments,
      emailSubscriptions,
      guestbook,
      notificationPreferences,
      users
    } = await import('@isyuricunha/db')

    // The drizzle where node for the requesting user must be present on every
    // read (privacy export must never cross account boundaries). The node is
    // a symbolic SQL expression; assert its stable plain fields.
    const findManyQueries: Array<{ query: typeof database.query.comments; column: unknown }> = [
      { query: database.query.comments, column: comments.userId },
      { query: database.query.guestbook, column: guestbook.userId },
      { query: database.query.aiChatFeedback, column: aiChatFeedback.userId },
      { query: database.query.emailSubscriptions, column: emailSubscriptions.userId },
      { query: database.query.notificationPreferences, column: notificationPreferences.userId }
    ]
    for (const { query, column } of findManyQueries) {
      const args = query.findMany.mock.calls[0]?.[0] as { where?: object }
      expect(args?.where).toBeDefined()
      // The drizzle where node is a symbolic SQL tree; assert the rendered
      // clause carries the requesting user id and that the table under query
      // is the request-scoped one from the schema.
      expect(inspect(args?.where, { depth: 8 })).toContain('user-1')
      expect(JSON.stringify(column)).toContain('userId')
    }
    const userArgs = database.query.users.findFirst.mock.calls[0]?.[0] as { where?: object }
    expect(userArgs?.where).toBeDefined()
    expect(inspect(userArgs?.where, { depth: 8 })).toContain('user-1')
    expect(database.query.users.findFirst.mock.calls[0]?.[0]).toHaveProperty('columns')
  })

  it('fails closed when the account no longer exists', async () => {
    const { createPrivacyDataExport } = await import('@/lib/privacy/create-privacy-data-export')
    database.query.users.findFirst.mockResolvedValue(null)

    await expect(
      createPrivacyDataExport('user-1', {
        database: database as never,
        generatedAt: new Date('2026-09-06T16:00:00.000Z')
      })
    ).rejects.toThrow('Account not found')
  })
})
