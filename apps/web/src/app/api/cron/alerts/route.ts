import type { NextRequest } from 'next/server'

import { randomBytes } from 'crypto'

import {
  alertInstances,
  alerts,
  apiUsage,
  db,
  desc,
  eq,
  errorTracking,
  gte,
  performanceMetrics,
  securityEvents,
  users,
  notifications
} from '@isyuricunha/db'
import { redis } from '@isyuricunha/kv'

import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

type Operator = 'gt' | 'gte' | 'lt' | 'lte'

type Metric =
  | 'api_error_rate'
  | 'avg_response_time'
  | 'unresolved_error_count'
  | 'security_critical_events'

type AlertConditions = {
  metric: Metric
  operator: Operator
  threshold: number
  timeRangeMinutes?: number
  cooldownMinutes?: number
}

const lock_key = 'cron:alerts:lock'

const compare = (value: number, operator: Operator, threshold: number): boolean => {
  switch (operator) {
    case 'gt':
      return value > threshold
    case 'gte':
      return value >= threshold
    case 'lt':
      return value < threshold
    case 'lte':
      return value <= threshold
  }
}

const parse_conditions = (raw: string): AlertConditions | null => {
  try {
    const parsed = JSON.parse(raw) as unknown

    if (!parsed || typeof parsed !== 'object') return null

    const obj = parsed as Record<string, unknown>

    const metric = obj.metric
    const operator = obj.operator
    const threshold = obj.threshold

    if (
      metric !== 'api_error_rate' &&
      metric !== 'avg_response_time' &&
      metric !== 'unresolved_error_count' &&
      metric !== 'security_critical_events'
    ) {
      return null
    }

    if (operator !== 'gt' && operator !== 'gte' && operator !== 'lt' && operator !== 'lte') {
      return null
    }

    if (typeof threshold !== 'number' || Number.isNaN(threshold)) {
      return null
    }

    const timeRangeMinutes =
      typeof obj.timeRangeMinutes === 'number' && obj.timeRangeMinutes > 0
        ? Math.floor(obj.timeRangeMinutes)
        : undefined

    const cooldownMinutes =
      typeof obj.cooldownMinutes === 'number' && obj.cooldownMinutes > 0
        ? Math.floor(obj.cooldownMinutes)
        : undefined

    return {
      metric,
      operator,
      threshold,
      timeRangeMinutes,
      cooldownMinutes
    }
  } catch {
    return null
  }
}

const get_time_range_start = (now: Date, minutes: number) => {
  return new Date(now.getTime() - minutes * 60_000)
}

const get_metric_value = async (metric: Metric, now: Date, timeRangeMinutes: number) => {
  const start = get_time_range_start(now, timeRangeMinutes)

  if (metric === 'api_error_rate') {
    const rows = await db.query.apiUsage.findMany({
      where: gte(apiUsage.createdAt, start),
      columns: { statusCode: true }
    })

    if (rows.length === 0) return 0

    const errorCount = rows.filter((r) => r.statusCode >= 400).length
    return (errorCount / rows.length) * 100
  }

  if (metric === 'avg_response_time') {
    const rows = await db.query.performanceMetrics.findMany({
      where: eq(performanceMetrics.metricName, 'response_time'),
      columns: { value: true, createdAt: true }
    })

    const windowed = rows.filter((r) => r.createdAt >= start)
    if (windowed.length === 0) return 0

    const sum = windowed.reduce((acc, r) => acc + r.value, 0)
    return sum / windowed.length
  }

  if (metric === 'unresolved_error_count') {
    const rows = await db.query.errorTracking.findMany({
      where: eq(errorTracking.resolved, false),
      columns: { lastSeen: true }
    })

    return rows.filter((r) => r.lastSeen >= start).length
  }

  if (metric === 'security_critical_events') {
    const rows = await db.query.securityEvents.findMany({
      where: eq(securityEvents.resolved, false),
      columns: { severity: true, createdAt: true }
    })

    return rows.filter((r) => r.severity === 'critical' && r.createdAt >= start).length
  }

  return 0
}

const get_notification_type = (type: string): 'system' | 'security' => {
  return type === 'security' ? 'security' : 'system'
}

const get_notification_action_url = (type: string): string => {
  return type === 'security' ? '/admin/security' : '/admin/monitoring'
}

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

      const active_alerts = await db.query.alerts.findMany({
        where: eq(alerts.isActive, true),
        orderBy: desc(alerts.createdAt)
      })

      const admins = await db.query.users.findMany({
        where: eq(users.role, 'admin'),
        columns: { id: true }
      })

      let evaluated = 0
      let triggered = 0
      let instances_created = 0
      let notifications_created = 0

      for (const alert of active_alerts) {
        evaluated += 1

        const conditions = parse_conditions(alert.conditions)
        if (!conditions) {
          continue
        }

        const time_range_minutes = conditions.timeRangeMinutes ?? 10
        const cooldown_minutes = conditions.cooldownMinutes ?? 60

        const metric_value = await get_metric_value(conditions.metric, now, time_range_minutes)
        const is_triggered = compare(metric_value, conditions.operator, conditions.threshold)

        if (!is_triggered) continue
        triggered += 1

        const last_instance = await db.query.alertInstances.findFirst({
          where: eq(alertInstances.alertId, alert.id),
          orderBy: desc(alertInstances.triggeredAt),
          columns: { triggeredAt: true }
        })

        if (last_instance) {
          const elapsed_ms = now.getTime() - last_instance.triggeredAt.getTime()
          if (elapsed_ms < cooldown_minutes * 60_000) {
            continue
          }
        }

        const instance_id = randomBytes(16).toString('hex')
        const notification_ids: string[] = []

        const notification_type = get_notification_type(alert.type)
        const action_url = get_notification_action_url(alert.type)

        const title = `[${alert.severity.toUpperCase()}] ${alert.name}`
        const message =
          alert.description ??
          `Alert triggered: ${conditions.metric} ${conditions.operator} ${conditions.threshold} (value: ${metric_value.toFixed(2)})`

        const notification_rows = admins.map((admin) => {
          const id = randomBytes(16).toString('hex')
          notification_ids.push(id)

          return {
            id,
            userId: admin.id,
            title,
            message,
            type: notification_type,
            data: JSON.stringify({
              alertId: alert.id,
              alertInstanceId: instance_id,
              metric: conditions.metric,
              operator: conditions.operator,
              threshold: conditions.threshold,
              value: metric_value,
              timeRangeMinutes: time_range_minutes
            }),
            actionUrl: action_url,
            expiresAt: null
          }
        })

        await db.transaction(async (tx) => {
          await tx.insert(alertInstances).values({
            id: instance_id,
            alertId: alert.id,
            triggeredValue: metric_value,
            message,
            metadata: JSON.stringify({
              conditions,
              calculatedAt: now.toISOString(),
              notificationType: notification_type,
              notificationCount: notification_rows.length
            }),
            resolved: false,
            resolvedBy: null,
            resolvedAt: null,
            notificationsSent: JSON.stringify(notification_ids),
            triggeredAt: now
          })

          if (notification_rows.length > 0) {
            await tx.insert(notifications).values(notification_rows)
          }
        })

        instances_created += 1
        notifications_created += notification_rows.length
      }

      return Response.json({
        success: true,
        evaluated,
        triggered,
        instancesCreated: instances_created,
        notificationsCreated: notifications_created,
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
    logger.error('Cron alerts job failed', error)
    return Response.json(
      { success: false, error: 'Internal server error', durationMs: Date.now() - started_at },
      { status: 500 }
    )
  }
}
