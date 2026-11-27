import { TRPCError } from '@trpc/server'

const unavailableMessages = new Set(['Rate limiter unavailable', 'Rate limiter timed out'])

export const isRateLimiterUnavailable = (error: { code: string; message: string } | undefined) =>
  error?.code === 'SERVICE_UNAVAILABLE' && unavailableMessages.has(error.message)

type Limiter = {
  limit: (identifier: string) => Promise<{ success: boolean; reason?: string }>
}

/** Keep protected operations fail-closed, distinguishing infrastructure from quota. */
export const enforceRateLimit = async (
  limiter: Limiter,
  identifier: string,
  denialMessage?: string
) => {
  let result: Awaited<ReturnType<Limiter['limit']>>
  try {
    result = await limiter.limit(identifier)
  } catch {
    throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Rate limiter unavailable' })
  }

  if (result.reason === 'timeout') {
    throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Rate limiter timed out' })
  }
  if (!result.success) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: denialMessage })
  }
}
