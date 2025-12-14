import { apiUsage, db, performanceMetrics } from '@isyuricunha/db'

type AiChatObservabilityInput = {
    requestId: string
    endpoint: string
    method: string
    statusCode: number
    responseTimeMs: number
    provider: string
    mode: string
    model?: string
    ipAddress?: string
    userAgent?: string
    requestSizeBytes?: number
    responseSizeBytes?: number
    tokensEstimated?: number
    errorMessage?: string
}

const create_id = (): string => {
    try {
        return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    } catch {
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
}

export const estimate_tokens = (input: string): number => {
    // Very rough heuristic: ~4 chars per token in English.
    // We keep it as an estimate for observability only.
    return Math.max(0, Math.ceil(input.length / 4))
}

export async function record_ai_chat_observability(input: AiChatObservabilityInput): Promise<void> {
    try {
        const now = new Date()

        await db.insert(apiUsage).values({
            id: create_id(),
            endpoint: input.endpoint,
            method: input.method,
            statusCode: input.statusCode,
            responseTime: input.responseTimeMs,
            requestSize: input.requestSizeBytes,
            responseSize: input.responseSizeBytes,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            apiKey: null,
            errorMessage: input.errorMessage,
            createdAt: now
        })

        await db.insert(performanceMetrics).values({
            id: create_id(),
            metricName: 'response_time',
            value: input.responseTimeMs,
            unit: 'ms',
            endpoint: input.endpoint,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            metadata: JSON.stringify({
                requestId: input.requestId,
                provider: input.provider,
                mode: input.mode,
                model: input.model,
                tokensEstimated: input.tokensEstimated,
                statusCode: input.statusCode
            }),
            createdAt: now
        })
    } catch {
        // Best-effort only: never fail the request.
    }
}
