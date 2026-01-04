import { initTRPC, TRPCError } from '@trpc/server'
import { db, errorLogs, errorTracking, performanceMetrics } from '@isyuricunha/db'
import { env } from '@isyuricunha/env'
import { SuperJSON } from 'superjson'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger'
import { randomBytes } from 'crypto'

import { getSession } from '@/lib/auth'

type trpc_context_opts = {
  headers: Headers
  method?: string
  url?: string
}

const map_trpc_error_to_status_code = (code?: string): number => {
  switch (code) {
    case 'BAD_REQUEST':
      return 400
    case 'UNAUTHORIZED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'TOO_MANY_REQUESTS':
      return 429
    case 'INTERNAL_SERVER_ERROR':
    default:
      return 500
  }
}

const safe_json_stringify = (value: unknown) => {
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

export const createTRPCContext = async (opts: trpc_context_opts) => {
  const session = await getSession()

  return {
    db,
    session,
    method: opts.method,
    url: opts.url,
    ...opts
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJSON,
  errorFormatter({ shape, error, path }) {
    if (env.NODE_ENV === 'development') {
      logger.error(`tRPC failed on ${path ?? '<no-path>'}`, error)
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    }
  }
})

export const createTRPCRouter = t.router

const timingMiddleware = t.middleware(async ({ next, path, ctx }) => {
  const start = Date.now()

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const end = Date.now()
  const duration_ms = end - start

  logger.debug(`[TRPC] ${path} took ${duration_ms}ms to execute`)

  if (env.NODE_ENV !== 'test') {
    try {
      const request_method = ctx.method ?? 'POST'
      const request_url = ctx.url ?? '/api/trpc'
      const endpoint = `${request_url}/${path}`

      const user_agent = ctx.headers.get('user-agent')
      const ip_address =
        ctx.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        ctx.headers.get('x-real-ip') ||
        ctx.headers.get('cf-connecting-ip') ||
        null

      const status_code = result.ok ? 200 : map_trpc_error_to_status_code(result.error?.code)
      const error_message = result.ok ? null : (result.error?.message ?? 'Unknown error')

      await ctx.db.insert(performanceMetrics).values({
        id: randomBytes(16).toString('hex'),
        metricName: 'response_time',
        value: duration_ms,
        unit: 'ms',
        endpoint,
        userId: ctx.session?.user?.id ?? null,
        sessionId: null,
        userAgent: user_agent,
        ipAddress: ip_address,
        metadata: null,
        createdAt: new Date()
      })

      if (!result.ok) {
        await ctx.db.insert(errorLogs).values({
          id: randomBytes(16).toString('hex'),
          level: 'error',
          message: error_message ?? 'Unknown error',
          stack: safe_json_stringify(result.error) ?? null,
          url: endpoint,
          userAgent: user_agent,
          userId: ctx.session?.user?.id ?? null,
          ipAddress: ip_address,
          metadata: safe_json_stringify({ trpcPath: path, code: result.error?.code }) ?? null,
          resolved: false,
          resolvedBy: null,
          resolvedAt: null,
          createdAt: new Date()
        })

        await ctx.db.insert(errorTracking).values({
          id: randomBytes(16).toString('hex'),
          errorType: 'server',
          errorName: result.error?.code ?? 'TRPCError',
          message: error_message ?? 'Unknown error',
          stack: safe_json_stringify(result.error) ?? null,
          filename: null,
          lineNumber: null,
          columnNumber: null,
          userId: ctx.session?.user?.id ?? null,
          sessionId: null,
          url: endpoint,
          userAgent: user_agent,
          ipAddress: ip_address,
          breadcrumbs: null,
          tags: null,
          fingerprint: `${path}:${result.error?.code ?? 'error'}`,
          count: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          resolved: false,
          resolvedBy: null,
          resolvedAt: null,
          createdAt: new Date()
        })
      }
    } catch (error) {
      logger.warn('Failed to record monitoring metrics', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return result
})

export const publicProcedure = t.procedure.use(timingMiddleware)

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user }
    }
  })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return next({ ctx })
})
