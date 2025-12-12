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

vi.mock('@/lib/ai/ai-service', () => ({
    aiService: {
        getAvailableProviders: vi.fn(),
        generateResponse: vi.fn()
    }
}))

describe('/api/ai/chat', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 429 when rate limited', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

        const { POST } = await import('@/app/api/ai/chat/route')

        const req = {
            headers: new Headers(),
            json: async () => ({ message: 'hello' })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)

        expect(res.status).toBe(429)
        expect(await res.json()).toEqual({
            error: 'Rate limit exceeded. Please try again later.'
        })
        expect(ratelimit.limit).toHaveBeenCalledWith('ai_chat:1.2.3.4')
    })

    it('returns 400 on invalid payload (zod)', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

        const { POST } = await import('@/app/api/ai/chat/route')

        const req = {
            headers: new Headers(),
            json: async () => ({ message: '' })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)
        const json = (await res.json()) as { error?: string; details?: unknown }

        expect(res.status).toBe(400)
        expect(json.error).toBe('Invalid request format')
        expect(json.details).toBeTruthy()
    })

    it('falls back to first available provider when requested provider is unavailable', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')
        const { aiService } = await import('@/lib/ai/ai-service')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
        vi.mocked(aiService.getAvailableProviders).mockReturnValue(['ollama'])
        vi.mocked(aiService.generateResponse).mockResolvedValue('ok')

        const { POST } = await import('@/app/api/ai/chat/route')

        const req = {
            headers: new Headers(),
            json: async () => ({
                message: 'hello',
                provider: 'gemini',
                locale: 'pt',
                context: { currentPage: '/test' }
            })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)
        const json = (await res.json()) as {
            message: string
            provider: string
            latencyMs: number
        }

        expect(res.status).toBe(200)
        expect(json.message).toBe('ok')
        expect(json.provider).toBe('ollama')
        expect(typeof json.latencyMs).toBe('number')

        expect(aiService.generateResponse).toHaveBeenCalledWith(
            'hello',
            { currentPage: '/test', locale: 'pt' },
            { provider: 'ollama', model: undefined }
        )
    })

    it('uses requested provider when available', async () => {
        const { ratelimit } = await import('@/lib/ratelimit')
        const { getClientIp } = await import('@/lib/spam-detection')
        const { aiService } = await import('@/lib/ai/ai-service')

        vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
        vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
        vi.mocked(aiService.getAvailableProviders).mockReturnValue(['gemini', 'ollama'])
        vi.mocked(aiService.generateResponse).mockResolvedValue('ok')

        const { POST } = await import('@/app/api/ai/chat/route')

        const req = {
            headers: new Headers(),
            json: async () => ({
                message: 'hello',
                provider: 'ollama',
                locale: 'en',
                context: { currentPage: '/test' }
            })
        } as unknown as Parameters<typeof POST>[0]

        const res = await POST(req)
        const json = (await res.json()) as {
            provider: string
        }

        expect(res.status).toBe(200)
        expect(json.provider).toBe('ollama')

        expect(aiService.generateResponse).toHaveBeenCalledWith(
            'hello',
            { currentPage: '/test', locale: 'en' },
            { provider: 'ollama', model: undefined }
        )
    })
})
