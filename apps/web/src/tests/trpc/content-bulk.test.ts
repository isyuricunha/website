import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => {
    return {
        getSession: vi.fn(async () => null)
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

const logBulkOperationMock = vi.fn().mockImplementation(async () => {
    return
})

vi.mock('@/lib/audit-logger', () => {
    return {
        AuditLogger: class {
            logBulkOperation = logBulkOperationMock
        },
        getIpFromHeaders: (headers: Headers): string | undefined => {
            return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
        },
        getUserAgentFromHeaders: (headers: Headers): string | undefined => {
            return headers.get('user-agent') || undefined
        }
    }
})

const createDbMock = (options: {
    updatedRows?: Array<{ id: string }>
    publishedAtRows?: Array<{ id: string }>
    deletedRows?: Array<{ id: string }>
}) => {
    const updatedRows = options.updatedRows ?? []
    const publishedAtRows = options.publishedAtRows ?? []
    const deletedRows = options.deletedRows ?? []

    let updateCallIndex = 0

    const updateReturning = vi.fn(async () => {
        updateCallIndex += 1
        return updateCallIndex === 1 ? updatedRows : publishedAtRows
    })

    const updateWhere = vi.fn(() => ({ returning: updateReturning }))
    const updateSet = vi.fn(() => ({ where: updateWhere }))

    const update = vi.fn(() => ({ set: updateSet }))

    const deleteReturning = vi.fn(async () => deletedRows)
    const deleteWhere = vi.fn(() => ({ returning: deleteReturning }))
    const del = vi.fn(() => ({ where: deleteWhere }))

    return {
        update,
        delete: del,
        __mocks: {
            update,
            updateSet,
            updateWhere,
            updateReturning,
            del,
            deleteWhere,
            deleteReturning
        }
    }
}

const createSessionContext = (user: { id: string; role: 'user' | 'admin' }) => {
    return {
        user,
        session: {
            id: `${user.id}-session`,
            userId: user.id,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            token: 'session-token',
            createdAt: new Date(),
            updatedAt: new Date(),
            ipAddress: null,
            userAgent: null,
            impersonatedBy: null
        }
    }
}

describe('contentRouter bulk mutations', () => {
    it('rejects bulkUpdatePostStatus for non-admin', async () => {
        const { contentRouter } = await import('@/trpc/routers/content')

        const db = createDbMock({
            updatedRows: [{ id: 'a' }]
        })

        const caller = contentRouter.createCaller({
            db: db as unknown,
            headers: new Headers(),
            session: createSessionContext({ id: 'user-1', role: 'user' })
        } as unknown as Parameters<typeof contentRouter.createCaller>[0])

        await expect(
            caller.bulkUpdatePostStatus({ ids: ['a'], status: 'archived' })
        ).rejects.toMatchObject({ code: 'FORBIDDEN' })
    }, 15_000)

    it('bulkUpdatePostStatus updates status and sets publishedAt for unpublished posts', async () => {
        const { contentRouter } = await import('@/trpc/routers/content')

        logBulkOperationMock.mockClear()

        const db = createDbMock({
            updatedRows: [{ id: 'a' }, { id: 'b' }],
            publishedAtRows: [{ id: 'a' }]
        })

        const caller = contentRouter.createCaller({
            db: db as unknown,
            headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
            session: createSessionContext({ id: 'admin-1', role: 'admin' })
        } as unknown as Parameters<typeof contentRouter.createCaller>[0])

        const result = await caller.bulkUpdatePostStatus({ ids: ['a', 'b'], status: 'published' })

        expect(result).toEqual({
            success: true,
            operationId: expect.any(String),
            updatedCount: 2
        })

        expect(db.__mocks.update).toHaveBeenCalledTimes(2)
        expect(logBulkOperationMock).toHaveBeenCalledTimes(1)

        const [adminUserId, details, ipAddress, userAgent] = logBulkOperationMock.mock.calls[0] ?? []

        expect(adminUserId).toBe('admin-1')
        expect(details).toEqual(
            expect.objectContaining({
                operationId: result.operationId,
                type: 'post_status_update',
                status: 'published',
                updatedCount: 2,
                publishedAtUpdatedCount: 1
            })
        )
        expect(ipAddress).toBe('203.0.113.10')
        expect(userAgent).toBeUndefined()
    })

    it('bulkDeletePosts deletes posts in bulk and logs a bulk operation', async () => {
        const { contentRouter } = await import('@/trpc/routers/content')

        logBulkOperationMock.mockClear()

        const db = createDbMock({
            deletedRows: [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
        })

        const caller = contentRouter.createCaller({
            db: db as unknown,
            headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }),
            session: createSessionContext({ id: 'admin-1', role: 'admin' })
        } as unknown as Parameters<typeof contentRouter.createCaller>[0])

        const result = await caller.bulkDeletePosts({ ids: ['a', 'b', 'c'] })

        expect(result).toEqual({
            success: true,
            operationId: expect.any(String),
            deletedCount: 3
        })

        expect(db.__mocks.del).toHaveBeenCalledTimes(1)
        expect(logBulkOperationMock).toHaveBeenCalledTimes(1)

        const [adminUserId, details, ipAddress, userAgent] = logBulkOperationMock.mock.calls[0] ?? []

        expect(adminUserId).toBe('admin-1')
        expect(details).toEqual(
            expect.objectContaining({
                operationId: result.operationId,
                type: 'post_delete',
                deletedCount: 3,
                postIds: ['a', 'b', 'c']
            })
        )
        expect(ipAddress).toBe('203.0.113.10')
        expect(userAgent).toBeUndefined()
    })
})

