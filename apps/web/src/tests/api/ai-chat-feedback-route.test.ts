import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn()
    }
}))

vi.mock('@/lib/ratelimit', () => ({
    ratelimit: {
        limit: vi.fn()
    }
}))

vi.mock('@/lib/spam-detection', () => ({
    getClientIp: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn()
}))

vi.mock('@isyuricunha/db', () => ({
    db: {
        insert: vi.fn(() => ({
            values: vi.fn(async () => {
                return
            })
        }))
    },
    aiChatFeedback: {
        id: 'ai_chat_feedback'
    }
}))

describe('/api/ai/chat/feedback', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 429 when rate limited', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

        const { POST } = await import('@/app/api/ai/chat/feedback/route')

        const req = {
            headers: new Headers(),
            json: async () => ({ requestId: 'r1', messageId: 'm1', rating: 'like' })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)
        expect(res.status).toBe(429)

        const json = (await res.json()) as { error?: string }
        expect(json.error).toBe('Rate limit exceeded. Please try again later.')
        expect(ratelimit.limit).toHaveBeenCalledWith('ai:chat:feedback:1.2.3.4')
    })

    it('returns 400 on invalid payload (zod)', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

        const { POST } = await import('@/app/api/ai/chat/feedback/route')

        const req = {
            headers: new Headers(),
            json: async () => ({ requestId: '', messageId: '', rating: 'like' })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)
        expect(res.status).toBe(400)

        const json = (await res.json()) as { error?: string; details?: unknown }
        expect(json.error).toBe('Invalid request format')
        expect(json.details).toBeTruthy()
    })

    it('persists feedback and returns 200', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')
        const { getSession } = await import('@/lib/auth')
        const { db } = await import('@isyuricunha/db')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
        vi.mocked(getSession).mockResolvedValue({ user: { id: 'u1' } } as never)

        const { POST } = await import('@/app/api/ai/chat/feedback/route')

        const req = {
            headers: new Headers([['user-agent', 'test']]),
            json: async () => ({
                requestId: 'r1',
                messageId: 'm1',
                rating: 'dislike',
                comment: 'bad',
                pagePath: '/en',
                provider: 'gemini',
                model: 'g',
                locale: 'en'
            })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)
        expect(res.status).toBe(200)

        const json = (await res.json()) as { success?: boolean }
        expect(json.success).toBe(true)

        expect(vi.mocked(db.insert)).toHaveBeenCalled()
    })
})
