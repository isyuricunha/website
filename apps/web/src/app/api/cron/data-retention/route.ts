import type { NextRequest } from 'next/server'

import { randomBytes } from 'crypto'

import {
  aiChatFeedback,
  analyticsEvents,
  and,
  db,
  errorLogs,
  eq,
  loginAttempts,
  lt,
  performanceMetrics,
  securityEvents
} from '@isyuricunha/db'
import { redis } from '@isyuricunha/kv'

import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const lock_key = 'cron:data-retention:lock'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Retention windows per table. See the Privacy Notice (/privacy) for the
 * user-facing summary of why these exist: IP addresses and related request
 * metadata are collected for rate-limiting, abuse prevention, and debugging,
 * not for indefinite storage.
 *
 * `security_events` and `error_logs` are pruned only when RESOLVED — an
 * unresolved security event or error is kept regardless of age, since an
 * admin may still need to act on it.
 */
const RETENTION = {
  analyticsEventsDays: 180,
  performanceMetricsDays: 90,
  loginAttemptsDays: 90,
  aiChatFeedbackDays: 365,
  resolvedSecurityEventsDays: 180,
  resolvedErrorLogsDays: 180
} as const

const cutoff = (now: Date, days: number) => new Date(now.getTime() - days * DAY_MS)

export async function GET(request: NextRequest) {
  const started_at = Date.now()

  try {
    const cron_secret = process.env.CRON_SECRET
    const auth_header = request.headers.get('authorization')

    if (!cron_secret || auth_header !== `Bearer ${cron_secret}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    const lock_id = randomBytes(16).toString('hex')

    const lock = await redis.set(lock_key, lock_id, { nx: true, ex: 9 * 60 })
    if (!lock) {
      return Response.json({ success: true, skipped: true, reason: 'locked' })
    }

    try {
      const now = new Date()
      const deleted: Record<string, number> = {}

      const analyticsResult = await db
        .delete(analyticsEvents)
        .where(lt(analyticsEvents.createdAt, cutoff(now, RETENTION.analyticsEventsDays)))
      deleted.analyticsEvents = analyticsResult.rowCount ?? 0

      const performanceResult = await db
        .delete(performanceMetrics)
        .where(lt(performanceMetrics.createdAt, cutoff(now, RETENTION.performanceMetricsDays)))
      deleted.performanceMetrics = performanceResult.rowCount ?? 0

      const loginAttemptsResult = await db
        .delete(loginAttempts)
        .where(lt(loginAttempts.createdAt, cutoff(now, RETENTION.loginAttemptsDays)))
      deleted.loginAttempts = loginAttemptsResult.rowCount ?? 0

      const feedbackResult = await db
        .delete(aiChatFeedback)
        .where(lt(aiChatFeedback.createdAt, cutoff(now, RETENTION.aiChatFeedbackDays)))
      deleted.aiChatFeedback = feedbackResult.rowCount ?? 0

      const securityEventsCutoff = cutoff(now, RETENTION.resolvedSecurityEventsDays)
      const securityEventsResult = await db
        .delete(securityEvents)
        .where(
          and(eq(securityEvents.resolved, true), lt(securityEvents.createdAt, securityEventsCutoff))
        )
      deleted.securityEvents = securityEventsResult.rowCount ?? 0

      const errorLogsCutoff = cutoff(now, RETENTION.resolvedErrorLogsDays)
      const errorLogsResult = await db
        .delete(errorLogs)
        .where(and(eq(errorLogs.resolved, true), lt(errorLogs.createdAt, errorLogsCutoff)))
      deleted.errorLogs = errorLogsResult.rowCount ?? 0

      logger.info('Data retention cron completed', { deleted })

      return Response.json({
        success: true,
        deleted,
        durationMs: Date.now() - started_at
      })
    } finally {
      try {
        const current = await redis.get<string>(lock_key)
        if (current === lock_id) {
          await redis.del(lock_key)
        }
      } catch (error) {
        logger.warn('Failed to release cron lock', {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  } catch (error) {
    logger.error('Cron data-retention job failed', error)
    return Response.json(
      { success: false, error: 'Internal server error', durationMs: Date.now() - started_at },
      { status: 500 }
    )
  }
}
