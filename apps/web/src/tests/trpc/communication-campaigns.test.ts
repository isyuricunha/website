import { beforeEach, describe, expect, it, vi } from 'vitest'

const resendSendMock = vi.fn<
  (args: { from: string; to: string[]; subject: string; html?: string; text?: string }) => Promise<unknown>
>()

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: resendSendMock
      }

      constructor() {
        return
      }
    }
  }
})

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

type EmailCampaignRow = {
  id: string
  subject: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' | 'failed'
  targetAudience: string | null
  htmlContent: string | null
  textContent: string | null
  template: { htmlContent: string; textContent: string | null } | null
  totalRecipients: number
  sentCount: number
  deliveredCount: number
  completedAt: Date | null
  startedAt: Date | null
  updatedAt: Date
}

type EmailCampaignRecipientRow = {
  id: string
  campaignId: string
  userId: string | null
  email: string
  status: string
  sentAt: Date | null
  errorMessage: string | null
}

const createDbMock = () => {
  const campaign: EmailCampaignRow = {
    id: 'c-1',
    subject: 'Hello',
    status: 'draft',
    targetAudience: null,
    htmlContent: '<p>Hello</p>',
    textContent: null,
    template: null,
    totalRecipients: 0,
    sentCount: 0,
    deliveredCount: 0,
    completedAt: null,
    startedAt: null,
    updatedAt: new Date()
  }

  const recipients: EmailCampaignRecipientRow[] = []

  const insert = vi.fn((table: unknown) => {
    return {
      values: vi.fn(async (value: any) => {
        const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null
        if (tableName === 'email_campaign_recipients') {
          if (Array.isArray(value)) {
            recipients.push(...value)
          } else {
            recipients.push(value)
          }
        }
      })
    }
  })

  const updateCampaignWhere = vi.fn(async () => {
    return
  })

  const updateCampaignSet = vi.fn((data: any) => {
    Object.assign(campaign, data)
    return {
      where: updateCampaignWhere
    }
  })

  const updateRecipientWhere = vi.fn(async () => {
    return
  })

  const updateRecipientSet = vi.fn((data: any) => {
    if (typeof data?.status === 'string') {
      for (const row of recipients) {
        if (row.status === 'pending') {
          row.status = data.status
          row.sentAt = data.sentAt ?? null
          row.errorMessage = data.errorMessage ?? null
          break
        }
      }
    }

    return {
      where: updateRecipientWhere
    }
  })

  const update = vi.fn((table: unknown) => {
    const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null
    if (tableName === 'email_campaigns') {
      return { set: updateCampaignSet }
    }

    if (tableName === 'email_campaign_recipients') {
      return { set: updateRecipientSet }
    }

    return {
      set: vi.fn(() => ({
        where: vi.fn(async () => {
          return
        })
      }))
    }
  })

  const query = {
    emailCampaigns: {
      findFirst: vi.fn(async () => campaign)
    },
    users: {
      findMany: vi.fn(async () => [
        { id: 'u-1', email: 'u1@example.com' },
        { id: 'u-2', email: 'u2@example.com' }
      ])
    }
  }

  return {
    insert,
    update,
    query,
    __state: {
      campaign,
      recipients
    },
    __mocks: {
      updateCampaignWhere,
      updateCampaignSet,
      updateRecipientWhere,
      updateRecipientSet
    }
  }
}

describe('communicationRouter campaigns', () => {
  beforeEach(() => {
    vi.resetModules()
    resendSendMock.mockReset()
    resendSendMock.mockResolvedValue({})
    logUserActionMock.mockClear()
  })

  it('sendEmailCampaign sends emails and persists recipients', async () => {
    const { communicationRouter } = await import('@/trpc/routers/communication')

    const db = createDbMock()

    const caller = communicationRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: { user: { id: 'admin-1', role: 'admin' } }
    } as any)

    const result = await caller.sendEmailCampaign({ campaignId: 'c-1' })

    expect(result).toEqual({ success: true, sent: 2, failed: 0, total: 2 })

    expect(resendSendMock).toHaveBeenCalledTimes(2)
    expect(db.__state.recipients).toHaveLength(2)

    expect(db.__state.campaign.status).toBe('sent')
    expect(db.__state.campaign.totalRecipients).toBe(2)
    expect(db.__state.campaign.sentCount).toBe(2)
    expect(db.__state.campaign.deliveredCount).toBe(2)

    expect(logUserActionMock).toHaveBeenCalledTimes(1)
  })

  it('sendEmailCampaign marks campaign as sent when at least one email succeeds', async () => {
    const { communicationRouter } = await import('@/trpc/routers/communication')

    const db = createDbMock()

    resendSendMock.mockRejectedValueOnce(new Error('smtp error'))
    resendSendMock.mockResolvedValueOnce({})

    const caller = communicationRouter.createCaller({
      db: db as unknown,
      headers: new Headers(),
      session: { user: { id: 'admin-1', role: 'admin' } }
    } as any)

    const result = await caller.sendEmailCampaign({ campaignId: 'c-1' })

    expect(result.success).toBe(true)
    expect(result.total).toBe(2)
    expect(result.sent).toBe(1)
    expect(result.failed).toBe(1)

    expect(db.__state.campaign.status).toBe('sent')
    expect(db.__state.campaign.sentCount).toBe(1)
    expect(db.__state.campaign.deliveredCount).toBe(1)
  })
})
