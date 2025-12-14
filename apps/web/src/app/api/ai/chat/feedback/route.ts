import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { aiChatFeedback, db } from '@isyuricunha/db'

import { getSession } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { ratelimit } from '@/lib/ratelimit'
import { getClientIp } from '@/lib/spam-detection'

const requestSchema = z.object({
    requestId: z.string().min(1).max(200),
    messageId: z.string().min(1).max(200),
    rating: z.enum(['like', 'dislike']),
    comment: z.string().max(2000).optional(),
    pagePath: z.string().max(500).optional(),
    provider: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    locale: z.string().min(2).max(10).optional()
})

const create_id = (): string => {
    try {
        return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    } catch {
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
}

export async function POST(req: NextRequest) {
    const started_at = Date.now()

    try {
        const ip = getClientIp(req.headers)
        const { success } = await ratelimit.limit(rate_limit_keys.ai_chat_feedback(ip))

        if (!success) {
            return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
        }

        const body = await req.json()
        const parsed = requestSchema.parse(body)

        const session = await getSession()
        const user_agent = req.headers.get('user-agent') ?? undefined

        await db.insert(aiChatFeedback).values({
            id: create_id(),
            requestId: parsed.requestId,
            messageId: parsed.messageId,
            rating: parsed.rating,
            comment: parsed.comment ?? null,
            pagePath: parsed.pagePath ?? null,
            provider: parsed.provider ?? null,
            model: parsed.model ?? null,
            locale: parsed.locale ?? null,
            userId: session?.user?.id ?? null,
            ipAddress: ip,
            userAgent: user_agent,
            createdAt: new Date()
        })

        return NextResponse.json(
            {
                success: true
            },
            { status: 200 }
        )
    } catch (error) {
        logger.error('AI chat feedback error', error, { responseTimeMs: Date.now() - started_at })

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request format', details: error.issues }, { status: 400 })
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
