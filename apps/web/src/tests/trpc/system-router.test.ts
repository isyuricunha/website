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

const auditLogMock = vi.fn().mockImplementation(async () => {
    return
})

vi.mock('@/lib/audit-logger', () => {
    return {
        AuditLogger: class {
            log = auditLogMock
        },
        getIpFromHeaders: () => '203.0.113.10',
        getUserAgentFromHeaders: () => 'vitest'
    }
})

vi.mock('crypto', async (importOriginal) => {
    const actual = await importOriginal<typeof import('crypto')>()
    let counter = 0

    return {
        ...actual,
        randomBytes: () => {
            counter += 1
            return {
                toString: () => `id-${counter}`
            }
        }
    }
})

type SystemHealthLogRow = {
    id: string
    checkType: string
    status: 'healthy' | 'warning' | 'critical' | 'unknown'
    responseTime: number | null
    message: string | null
    details: string | null
    createdAt: Date
}

type ErrorLogRow = {
    id: string
    level: 'error' | 'warning' | 'info'
    message: string
    resolved: boolean
    resolvedBy: string | null
    resolvedAt: Date | null
    createdAt: Date
}

const createDbMock = () => {
    const health_logs: SystemHealthLogRow[] = []
    const error_logs: ErrorLogRow[] = [
        {
            id: 'error-1',
            level: 'error',
            message: 'boom',
            resolved: false,
            resolvedBy: null,
            resolvedAt: null,
            createdAt: new Date()
        }
    ]

    const insert = vi.fn((table: unknown) => {
        return {
            values: vi.fn(async (value: any) => {
                const tableName = (table as any)?.[Symbol.for('drizzle:Name')] ?? null

                if (tableName === 'system_health_logs') {
                    health_logs.push(value)
                }

                return
            })
        }
    })

    const updateWhere = vi.fn(async () => {
        const error = error_logs[0]
        if (error) {
            error.resolved = true
            error.resolvedBy = 'admin-1'
            error.resolvedAt = new Date()
        }
        return
    })

    const updateSet = vi.fn(() => ({ where: updateWhere }))
    const update = vi.fn(() => ({ set: updateSet }))

    const query = {
        users: {
            findFirst: vi.fn(async () => ({ id: 'admin-1' }))
        },
        systemHealthLogs: {
            findMany: vi.fn(async () => health_logs)
        },
        errorLogs: {
            findMany: vi.fn(async () => error_logs)
        },
        siteConfig: {
            findMany: vi.fn(async () => [])
        }
    }

    return {
        insert,
        update,
        query,
        __state: {
            health_logs,
            error_logs
        },
        __mocks: {
            updateWhere,
            updateSet
        }
    }
}

describe('systemRouter', () => {
    beforeEach(() => {
        auditLogMock.mockClear()
        vi.resetModules()
    })

    it('getSystemHealth records health logs and returns history', async () => {
        const { systemRouter } = await import('@/trpc/routers/system')

        const db = createDbMock()

        const caller = systemRouter.createCaller({
            db: db as unknown,
            headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
            session: {
                user: { id: 'admin-1', role: 'admin' }
            }
        } as unknown as Parameters<typeof systemRouter.createCaller>[0])

        const result = await caller.getSystemHealth()

        expect(result.overallStatus).toEqual(expect.any(String))
        expect(result.checks).toHaveLength(4)
        expect(db.__state.health_logs).toHaveLength(4)
        expect(result.history.length).toBeGreaterThanOrEqual(1)
    })

    it('resolveError marks error resolved', async () => {
        const { systemRouter } = await import('@/trpc/routers/system')

        const db = createDbMock()

        const caller = systemRouter.createCaller({
            db: db as unknown,
            headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
            session: {
                user: { id: 'admin-1', role: 'admin' }
            }
        } as unknown as Parameters<typeof systemRouter.createCaller>[0])

        const result = await caller.resolveError({ errorId: 'error-1' })

        expect(result.success).toBe(true)
        expect(db.__state.error_logs[0]?.resolved).toBe(true)
        expect(db.__state.error_logs[0]?.resolvedBy).toBe('admin-1')
        expect(db.__mocks.updateWhere).toHaveBeenCalledTimes(1)
        expect(auditLogMock).toHaveBeenCalledTimes(1)
    })
})
