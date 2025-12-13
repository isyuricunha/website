import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn()
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

vi.mock('@/lib/ai/ai-service', () => ({
    aiService: {
        translateContent: vi.fn()
    }
}))

vi.mock('@/lib/blog/blog-service', () => ({
    BlogService: {
        getPost: vi.fn(),
        savePost: vi.fn()
    }
}))

describe('/api/admin/translate', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 429 when rate limited', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

        const { POST } = await import('@/app/api/admin/translate/route')

        const req = {
            headers: new Headers(),
            json: async () => ({ slug: 'test', sourceLocale: 'en' })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)

        expect(res.status).toBe(429)
    })

    it('returns 400 on invalid payload (zod)', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

        const { POST } = await import('@/app/api/admin/translate/route')

        const req = {
            headers: new Headers(),
            json: async () => ({ slug: '', sourceLocale: '' })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)

        expect(res.status).toBe(400)
        const json = (await res.json()) as { error?: string }
        expect(json.error).toBe('Invalid request format')
    })
})
