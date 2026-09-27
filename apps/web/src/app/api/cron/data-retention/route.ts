import type { NextRequest } from 'next/server'

import { randomBytes } from 'crypto'

import {
  aiChatFeedback,
  analyticsEvents,
  and,
  apiUsage,
  db,
  errorLogs,
  eq,
  errorTracking,
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
 * `security_events` is pruned only when RESOLVED: an unresolved security event
 * is kept regardless of age, since an admin may still need to act on it.
 *
 * `error_logs` and `error_tracking` are pruned by AGE alone past the hard cap.
 * Resolution state buys an error time, not immortality: a Dec 2025 incident
 * left 908 unresolved rows sitting in the tables for nine months after the
 * underlying bug was fixed, which is noise, not signal.
 */
const RETENTION = {
  analyticsEventsDays: 180,
  performanceMetricsDays: 30,
  apiUsageDays: 30,
  loginAttemptsDays: 90,
  aiChatFeedbackDays: 365,
  resolvedSecurityEventsDays: 180,
  errorLogsDays: 180,
  errorTrackingDays: 180
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

      const apiUsageResult = await db
        .delete(apiUsage)
        .where(lt(apiUsage.createdAt, cutoff(now, RETENTION.apiUsageDays)))
      deleted.apiUsage = apiUsageResult.rowCount ?? 0

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

      // Errors are pruned by age alone (see RETENTION above): a single pass
      // per table, no resolved-only pass, since the age predicate is a
      // superset of it and two passes would scan error_logs twice.
      const errorLogsResult = await db
        .delete(errorLogs)
        .where(lt(errorLogs.createdAt, cutoff(now, RETENTION.errorLogsDays)))
      deleted.errorLogs = errorLogsResult.rowCount ?? 0

      const errorTrackingResult = await db
        .delete(errorTracking)
        .where(lt(errorTracking.createdAt, cutoff(now, RETENTION.errorTrackingDays)))
      deleted.errorTracking = errorTrackingResult.rowCount ?? 0

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
