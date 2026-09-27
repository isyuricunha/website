import { initTRPC, TRPCError } from '@trpc/server'
import { apiUsage, db, errorLogs, errorTracking } from '@isyuricunha/db'
import { env } from '@isyuricunha/env'
import { SuperJSON } from 'superjson'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger'
import { randomBytes } from 'crypto'

import { getSession } from '@/lib/auth'
import { telemetryRatelimit } from '@isyuricunha/kv'
import { is_bot_user_agent } from '@/lib/spam-detection'
import { getIp } from '@/utils/get-ip'

type trpc_context_opts = {
  headers: Headers
  method?: string
  url?: string
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

const map_trpc_error_to_status_code = (code: string | undefined): number => {
  switch (code) {
    case 'BAD_REQUEST':
    case 'PARSE_ERROR':
      return 400
    case 'UNAUTHORIZED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'METHOD_NOT_SUPPORTED':
      return 405
    case 'CONFLICT':
      return 409
    case 'PRECONDITION_FAILED':
      return 412
    case 'PAYLOAD_TOO_LARGE':
      return 413
    case 'TOO_MANY_REQUESTS':
      return 429
    case 'NOT_IMPLEMENTED':
      return 501
    case 'TIMEOUT':
      return 504
    case 'CLIENT_CLOSED_REQUEST':
      return 499
    default:
      return 500
  }
}

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

  if (env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'test') {
    try {
      const request_url = ctx.url ?? '/api/trpc'
      const endpoint = `${request_url}/${path}`

      const user_agent = ctx.headers.get('user-agent')
      const resolved_ip = getIp(ctx.headers)
      const ip_address = resolved_ip === '0.0.0.0' ? null : resolved_ip

      const error_message = result.ok ? null : (result.error?.message ?? 'Unknown error')
      const error_code = result.ok ? undefined : result.error?.code

      const status_code = result.ok ? 200 : map_trpc_error_to_status_code(error_code)

      // Telemetry must never become a write-amplification channel: crawlers
      // and rate-limit floods must not translate into Postgres rows. Missing
      // user agent counts as noise for telemetry only.
      const is_bot = is_bot_user_agent(user_agent) || !user_agent
      const is_flood_rejection = error_code === 'TOO_MANY_REQUESTS'
      const is_expected_rejection = is_flood_rejection || error_code === 'NOT_FOUND'

      // Per-IP cap on telemetry writes. telemetryRatelimit fails OPEN by
      // design (see lib/ratelimit.ts): under Redis degradation we keep the
      // observability rows instead of losing the data needed to debug it.
      // Without platform headers getIp() returns the shared 0.0.0.0 fallback,
      // which would put the entire site in one bucket; skip the cap there
      // (non-platform/dev deployments) rather than throttle everyone at once.
      let telemetry_allowed = false
      if (!is_bot) {
        if (resolved_ip === '0.0.0.0') {
          telemetry_allowed = true
        } else {
          try {
            const telemetry_limit = await telemetryRatelimit.limit(`trpc:telemetry:${resolved_ip}`)
            telemetry_allowed = telemetry_limit.success
          } catch {
            telemetry_allowed = true
          }
        }
      }

      if (telemetry_allowed && !is_flood_rejection) {
        await ctx.db.insert(apiUsage).values({
          id: randomBytes(16).toString('hex'),
          endpoint,
          method: ctx.method ?? 'POST',
          statusCode: status_code,
          responseTime: duration_ms,
          requestSize: null,
          responseSize: null,
          userId: ctx.session?.user?.id ?? null,
          ipAddress: ip_address,
          userAgent: user_agent,
          apiKey: null,
          errorMessage: error_message,
          createdAt: new Date()
        })
      }

      if (telemetry_allowed && !is_expected_rejection && !result.ok) {
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
