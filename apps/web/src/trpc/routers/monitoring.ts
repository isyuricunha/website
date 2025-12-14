import { TRPCError } from '@trpc/server'
import {
  alertInstances,
  alerts,
  analyticsEvents,
  and,
  apiUsage,
  desc,
  eq,
  errorTracking,
  gte,
  performanceMetrics,
  queryPerformance,
  resourceUsage,
  userActivity
} from '@isyuricunha/db'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'
import { adminProcedure, createTRPCRouter } from '../trpc'

// Helper function to get time range
function getTimeRange(range: string): Date {
  const now = new Date()
  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000)
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000)
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
}

export const monitoringRouter = createTRPCRouter({
  // Performance Metrics
  getPerformanceMetrics: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
        metricType: z
          .enum([
            'response_time',
            'throughput',
            'error_rate',
            'cpu_usage',
            'memory_usage',
            'disk_usage',
            'network_io',
            'database_connections'
          ])
          .optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(performanceMetrics.createdAt, startTime)]

        if (input.metricType) {
          conditions.push(eq(performanceMetrics.metricName, input.metricType))
        }

        const metrics = await ctx.db.query.performanceMetrics.findMany({
          where: and(...conditions),
          orderBy: desc(performanceMetrics.createdAt),
          limit: 1000 // Limit to prevent overwhelming responses
        })

        // Group metrics by type and calculate aggregates
        const groupedMetrics: Record<string, any> = {}
        metrics.forEach((metric) => {
          if (!groupedMetrics[metric.metricName]) {
            groupedMetrics[metric.metricName] = {
              data: [],
              avg: 0,
              min: Infinity,
              max: -Infinity,
              latest: null
            }
          }

          const group = groupedMetrics[metric.metricName]
          group.data.push({
            timestamp: metric.createdAt,
            value: metric.value,
            tags: metric.metadata ? JSON.parse(metric.metadata) : []
          })

          group.min = Math.min(group.min, metric.value)
          group.max = Math.max(group.max, metric.value)

          if (!group.latest || metric.createdAt > group.latest.timestamp) {
            group.latest = {
              value: metric.value,
              timestamp: metric.createdAt
            }
          }
        })

        // Calculate averages
        Object.keys(groupedMetrics).forEach((type) => {
          const group = groupedMetrics[type]
          group.avg =
            group.data.reduce((sum: number, item: any) => sum + item.value, 0) / group.data.length
        })

        return {
          metrics: groupedMetrics,
          timeRange: input.timeRange,
          totalDataPoints: metrics.length
        }
      } catch (error) {
        logger.error('Error fetching performance metrics', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch performance metrics'
        })
      }
    }),

  recordPerformanceMetric: adminProcedure
    .input(
      z.object({
        metricType: z.enum([
          'response_time',
          'throughput',
          'error_rate',
          'cpu_usage',
          'memory_usage',
          'disk_usage',
          'network_io',
          'database_connections'
        ]),
        value: z.number(),
        unit: z.string().optional(),
        tags: z.record(z.string(), z.string()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const metricId = randomBytes(16).toString('hex')

        await ctx.db.insert(performanceMetrics).values({
          id: metricId,
          metricName: input.metricType,
          value: input.value,
          unit: input.unit || 'count',
          metadata: input.tags ? JSON.stringify(input.tags) : null,
          createdAt: new Date()
        })

        return { success: true, metricId }
      } catch (error) {
        logger.error('Error recording performance metric', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record performance metric'
        })
      }
    }),

  // Analytics Events
  getAnalyticsEvents: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
        eventType: z.string().optional(),
        limit: z.number().min(1).max(1000).default(100)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(analyticsEvents.createdAt, startTime)]

        if (input.eventType) {
          conditions.push(eq(analyticsEvents.eventType, input.eventType))
        }

        const events = await ctx.db.query.analyticsEvents.findMany({
          where: and(...conditions),
          orderBy: desc(analyticsEvents.createdAt),
          limit: input.limit,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        // Get event type distribution
        const eventTypes: Record<string, number> = {}
        events.forEach((event) => {
          eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1
        })

        return {
          events: events.map((event) => ({
            ...event,
            properties: event.properties ? JSON.parse(event.properties) : null
          })),
          eventTypes,
          totalEvents: events.length
        }
      } catch (error) {
        logger.error('Error fetching analytics events', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch analytics events'
        })
      }
    }),

  // Resource Usage
  getResourceUsage: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
        resourceType: z
          .enum(['cpu', 'memory', 'disk', 'network', 'database_connections', 'cache_hit_rate'])
          .optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const resourceUsageData = await ctx.db.query.resourceUsage.findMany({
          where: input.resourceType
            ? and(
              eq(resourceUsage.type, input.resourceType),
              gte(resourceUsage.createdAt, startTime)
            )
            : gte(resourceUsage.createdAt, startTime),
          orderBy: desc(resourceUsage.createdAt),
          limit: 1000
        })

        // Group by resource type and calculate statistics
        const groupedUsage: Record<string, any> = {}
        resourceUsageData.forEach((item) => {
          if (!groupedUsage[item.type]) {
            groupedUsage[item.type] = {
              data: [],
              avgUsage: 0,
              maxUsage: 0,
              currentUsage: 0,
              alerts: 0
            }
          }

          const group = groupedUsage[item.type]
          group.data.push({
            timestamp: item.createdAt,
            usage: item.value,
            limit: item.maxValue
          })

          group.maxUsage = Math.max(group.maxUsage, item.value)

          if (!group.currentUsage || item.createdAt > group.currentUsage) {
            group.currentUsage = item.value
          }

          // Count threshold breaches as alerts
          if (item.value > (item.maxValue || 100)) {
            group.alerts++
          }
        })

        // Calculate averages
        Object.keys(groupedUsage).forEach((type) => {
          const group = groupedUsage[type]
          group.avgUsage =
            group.data.reduce((sum: number, item: any) => sum + item.usage, 0) / group.data.length
        })

        return {
          usage: groupedUsage,
          timeRange: input.timeRange
        }
      } catch (error) {
        logger.error('Error fetching resource usage', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch resource usage'
        })
      }
    }),

  // API Usage Tracking
  getApiUsage: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
        endpoint: z.string().optional(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(apiUsage.createdAt, startTime)]

        if (input.endpoint) {
          conditions.push(eq(apiUsage.endpoint, input.endpoint))
        }

        if (input.method) {
          conditions.push(eq(apiUsage.method, input.method))
        }

        const usage = await ctx.db.query.apiUsage.findMany({
          where: and(...conditions),
          orderBy: desc(apiUsage.createdAt),
          limit: 1000,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        // Calculate statistics
        const total_requests = usage.length
        const total_requests_safe = Math.max(total_requests, 1)
        const stats = {
          totalRequests: total_requests,
          uniqueUsers: new Set(usage.map((u) => u.userId).filter(Boolean)).size,
          avgResponseTime:
            usage.reduce((sum, u) => sum + (u.responseTime || 0), 0) / total_requests_safe,
          errorRate: (usage.filter((u) => u.statusCode >= 400).length / total_requests_safe) * 100,
          topEndpoints: {} as Record<string, number>,
          statusCodes: {} as Record<string, number>
        }

        // Group by endpoint and status code
        usage.forEach((item) => {
          stats.topEndpoints[item.endpoint] = (stats.topEndpoints[item.endpoint] || 0) + 1
          stats.statusCodes[item.statusCode.toString()] =
            (stats.statusCodes[item.statusCode.toString()] || 0) + 1
        })

        return {
          usage: usage.map((item) => ({
            ...item,
            headers: {} // responseHeaders not stored in schema
          })),
          stats,
          timeRange: input.timeRange
        }
      } catch (error) {
        logger.error('Error fetching API usage', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch API usage'
        })
      }
    }),

  // Query Performance
  getQueryPerformance: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
        slowQueriesOnly: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(50)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(queryPerformance.createdAt, startTime)]

        if (input.slowQueriesOnly) {
          // Consider queries > 1000ms as slow
          conditions.push(gte(queryPerformance.executionTime, 1000))
        }

        const queries = await ctx.db.query.queryPerformance.findMany({
          where: and(...conditions),
          orderBy: desc(queryPerformance.executionTime),
          limit: input.limit
        })

        // Calculate statistics
        const total_queries = queries.length
        const total_queries_safe = Math.max(total_queries, 1)
        const stats = {
          totalQueries: total_queries,
          avgExecutionTime: queries.reduce((sum, q) => sum + q.executionTime, 0) / total_queries_safe,
          slowQueries: queries.filter((q) => q.executionTime > 1000).length,
          topSlowQueries: queries
            .filter((q) => q.executionTime > 1000)
            .slice(0, 10)
            .map((q) => ({
              query: q.queryType.slice(0, 100) + '...',
              executionTime: q.executionTime,
              timestamp: q.createdAt
            }))
        }

        return {
          queries: queries.map((query) => ({
            ...query,
            parameters: query.queryHash
          })),
          stats,
          timeRange: input.timeRange
        }
      } catch (error) {
        logger.error('Error fetching query performance', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch query performance'
        })
      }
    }),

  // Error Tracking
  getErrorTracking: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
        resolved: z.boolean().optional(),
        errorType: z.enum(['javascript', 'server', 'database', 'network']).optional(),
        limit: z.number().min(1).max(100).default(50)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(errorTracking.firstSeen, startTime)]

        if (input.resolved !== undefined) {
          conditions.push(eq(errorTracking.resolved, input.resolved))
        }

        if (input.errorType) {
          conditions.push(eq(errorTracking.errorType, input.errorType))
        }

        const errors = await ctx.db.query.errorTracking.findMany({
          where: and(...conditions),
          orderBy: desc(errorTracking.firstSeen),
          limit: input.limit,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        // Group by error type
        const errorTypeStats: Record<string, number> = {}
        errors.forEach((error) => {
          const errorType = error.errorType || 'unknown'
          errorTypeStats[errorType] = (errorTypeStats[errorType] || 0) + 1
        })

        // Group by fingerprint to show error frequency
        const errorGroups: Record<string, any> = {}
        errors.forEach((error) => {
          const fingerprint = error.fingerprint || 'unknown'
          if (!errorGroups[fingerprint]) {
            errorGroups[fingerprint] = {
              fingerprint,
              message: error.message,
              resourceType: 'unknown',
              count: 0,
              firstSeen: error.firstSeen,
              lastSeen: error.lastSeen,
              resolved: error.resolved
            }
          }

          const group = errorGroups[fingerprint]
          group.count++

          if (error.firstSeen < group.firstSeen) {
            group.firstSeen = error.firstSeen
          }

          if (error.lastSeen > group.lastSeen) {
            group.lastSeen = error.lastSeen
          }
        })

        return {
          errors: errors.map((error) => ({
            ...error,
            context: JSON.parse(error.breadcrumbs || '{}'),
            timestamp: error.firstSeen,
            stackTrace: error.stack
          })),
          errorGroups: Object.values(errorGroups),
          errorTypeStats,
          totalErrors: errors.length
        }
      } catch (error) {
        logger.error('Error fetching error tracking', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch error tracking'
        })
      }
    }),

  resolveError: adminProcedure
    .input(z.object({ errorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        await ctx.db
          .update(errorTracking)
          .set({
            resolved: true,
            resolvedAt: new Date()
          })
          .where(eq(errorTracking.id, input.errorId))

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'error_tracking',
          input.errorId,
          { action: 'error_resolved' },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error resolving error', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resolve error'
        })
      }
    }),

  // Alerts
  getAlerts: adminProcedure
    .input(
      z.object({
        active: z.boolean().optional(),
        severity: z.enum(['info', 'warning', 'critical']).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.active !== undefined) {
          conditions.push(eq(alerts.isActive, input.active))
        }

        if (input.severity) {
          conditions.push(eq(alerts.severity, input.severity))
        }

        const alertList = await ctx.db.query.alerts.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          orderBy: [desc(alerts.severity), desc(alerts.createdAt)],
          with: {
            createdByUser: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        return {
          alerts: alertList.map((alert) => ({
            ...alert,
            conditions: alert.conditions ? JSON.parse(alert.conditions) : null,
            notificationChannels: alert.notificationChannels
              ? JSON.parse(alert.notificationChannels)
              : []
          }))
        }
      } catch (error) {
        logger.error('Error fetching alerts', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch alerts'
        })
      }
    }),

  getAlertInstances: adminProcedure
    .input(
      z.object({
        alertId: z.string().optional(),
        resolved: z.boolean().optional(),
        timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h')
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(alertInstances.triggeredAt, startTime)]

        if (input.alertId) {
          conditions.push(eq(alertInstances.alertId, input.alertId))
        }

        if (input.resolved !== undefined) {
          conditions.push(eq(alertInstances.resolved, input.resolved))
        }

        const instances = await ctx.db.query.alertInstances.findMany({
          where: and(...conditions),
          orderBy: desc(alertInstances.triggeredAt),
          limit: 100,
          with: {
            alert: {
              columns: {
                id: true,
                name: true,
                severity: true
              }
            }
          }
        })

        return {
          instances: instances.map((instance) => ({
            ...instance,
            triggerData: instance.metadata ? JSON.parse(instance.metadata) : null
          }))
        }
      } catch (error) {
        logger.error('Error fetching alert instances', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch alert instances'
        })
      }
    }),

  // User Activity Tracking
  getUserActivity: adminProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
        activityType: z.string().optional(),
        limit: z.number().min(1).max(100).default(50)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(userActivity.createdAt, startTime)]

        if (input.userId) {
          conditions.push(eq(userActivity.userId, input.userId))
        }

        if (input.activityType) {
          conditions.push(eq(userActivity.action, input.activityType))
        }

        const activities = await ctx.db.query.userActivity.findMany({
          where: and(...conditions),
          orderBy: desc(userActivity.createdAt),
          limit: input.limit,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        // Calculate activity statistics
        const stats = {
          totalActivities: activities.length,
          uniqueUsers: new Set(activities.map((a) => a.userId)).size,
          activityTypes: {} as Record<string, number>,
          hourlyDistribution: {} as Record<string, number>
        }

        activities.forEach((activity) => {
          stats.activityTypes[activity.action] = (stats.activityTypes[activity.action] || 0) + 1

          const hour = activity.createdAt.getHours()
          stats.hourlyDistribution[hour] = (stats.hourlyDistribution[hour] || 0) + 1
        })

        return {
          activities: activities.map((activity) => ({
            ...activity,
            metadata: activity.details ? JSON.parse(activity.details) : null
          })),
          stats
        }
      } catch (error) {
        logger.error('Error fetching user activity', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user activity'
        })
      }
    }),

  // Monitoring Dashboard Stats
  getMonitoringStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

      // Get recent performance metrics
      const recentMetrics = await ctx.db.query.performanceMetrics.findMany({
        where: gte(performanceMetrics.createdAt, oneHourAgo),
        columns: { id: true, metricName: true, value: true }
      })

      // Get recent errors
      const recentErrors = await ctx.db.query.errorTracking.findMany({
        where: gte(errorTracking.firstSeen, oneHourAgo),
        columns: { id: true, errorType: true, resolved: true }
      })

      // Get active alerts
      const activeAlerts = await ctx.db.query.alerts.findMany({
        where: eq(alerts.isActive, true),
        columns: { id: true, severity: true }
      })

      // Get recent API usage
      const recentApiCalls = await ctx.db.query.apiUsage.findMany({
        where: gte(apiUsage.createdAt, oneHourAgo),
        columns: { id: true, statusCode: true, responseTime: true }
      })

      const totalErrors = recentErrors.length
      const resolvedErrors = recentErrors.filter((e) => e.resolved).length
      const serverErrors = recentErrors.filter((e) => e.errorType === 'server').length

      return {
        performance: {
          totalMetrics: recentMetrics.length,
          avgResponseTime:
            recentMetrics
              .filter((m) => m.metricName === 'response_time')
              .reduce((sum, m) => sum + m.value, 0) /
            Math.max(recentMetrics.filter((m) => m.metricName === 'response_time').length, 1),
          throughput:
            recentMetrics
              .filter((m) => m.metricName === 'throughput')
              .reduce((sum, m) => sum + m.value, 0) /
            Math.max(recentMetrics.filter((m) => m.metricName === 'throughput').length, 1)
        },
        errors: {
          total: totalErrors,
          unresolved: totalErrors - resolvedErrors,
          javascript: recentErrors.filter((e) => e.errorType === 'javascript').length,
          database: recentErrors.filter((e) => e.errorType === 'database').length,
          server: serverErrors
        },
        alerts: {
          total: activeAlerts.length,
          critical: activeAlerts.filter((a) => a.severity === 'critical').length,
          warning: activeAlerts.filter((a) => a.severity === 'warning').length
        },
        api: {
          totalRequests: recentApiCalls.length,
          errorRate:
            recentApiCalls.length > 0
              ? (recentApiCalls.filter((u) => u.statusCode >= 400).length / recentApiCalls.length) *
              100
              : 0,
          avgResponseTime:
            recentApiCalls.length > 0
              ? recentApiCalls.reduce((sum, u) => sum + (u.responseTime || 0), 0) /
              recentApiCalls.length
              : 0
        }
      }
    } catch (error) {
      logger.error('Error fetching monitoring stats', error)
      return {
        performance: { totalMetrics: 0, avgResponseTime: 0 },
        errors: { total: 0, unresolved: 0, critical: 0, high: 0 },
        alerts: { total: 0, critical: 0, high: 0 },
        api: { totalRequests: 0, errorRate: 0, avgResponseTime: 0 }
      }
    }
  })
})
