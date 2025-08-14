import { TRPCError } from '@trpc/server'
import { 
  performanceMetrics,
  analyticsEvents,
  resourceUsage,
  apiUsage,
  queryPerformance,
  errorTracking,
  customMetrics,
  alerts,
  alertInstances,
  userActivity
} from '@tszhong0411/db'
import { and, desc, eq, gte, lte, avg, count, sum, max, min } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { adminProcedure, protectedProcedure, createTRPCRouter } from '../trpc'

// Helper function to get time range
function getTimeRange(range: string): Date {
  const now = new Date()
  switch (range) {
    case '1h': return new Date(now.getTime() - 60 * 60 * 1000)
    case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000)
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default: return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
}

export const monitoringRouter = createTRPCRouter({
  // Performance Metrics
  getPerformanceMetrics: adminProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
      metricType: z.enum(['response_time', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage', 'disk_usage', 'network_io', 'database_connections']).optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(performanceMetrics.createdAt, startTime)]
        
        if (input.metricType) {
          conditions.push(eq(performanceMetrics.metricType, input.metricType))
        }

        const metrics = await ctx.db.query.performanceMetrics.findMany({
          where: and(...conditions),
          orderBy: desc(performanceMetrics.createdAt),
          limit: 1000 // Limit to prevent overwhelming responses
        })

        // Group metrics by type and calculate aggregates
        const groupedMetrics: Record<string, any> = {}
        metrics.forEach(metric => {
          if (!groupedMetrics[metric.metricType]) {
            groupedMetrics[metric.metricType] = {
              data: [],
              avg: 0,
              min: Infinity,
              max: -Infinity,
              latest: null
            }
          }
          
          const group = groupedMetrics[metric.metricType]
          group.data.push({
            timestamp: metric.timestamp,
            value: metric.value,
            tags: metric.tags ? JSON.parse(metric.tags) : null
          })
          
          group.min = Math.min(group.min, metric.value)
          group.max = Math.max(group.max, metric.value)
          
          if (!group.latest || metric.timestamp > group.latest.timestamp) {
            group.latest = {
              timestamp: metric.timestamp,
              value: metric.value
            }
          }
        })

        // Calculate averages
        Object.keys(groupedMetrics).forEach(type => {
          const group = groupedMetrics[type]
          group.avg = group.data.reduce((sum: number, item: any) => sum + item.value, 0) / group.data.length
        })

        return {
          metrics: groupedMetrics,
          timeRange: input.timeRange,
          totalDataPoints: metrics.length
        }
      } catch (error) {
        console.error('Error fetching performance metrics:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch performance metrics'
        })
      }
    }),

  recordPerformanceMetric: adminProcedure
    .input(z.object({
      metricType: z.enum(['response_time', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage', 'disk_usage', 'network_io', 'database_connections']),
      value: z.number(),
      unit: z.string().optional(),
      tags: z.record(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const metricId = randomBytes(16).toString('hex')

        await ctx.db.insert(performanceMetrics).values({
          id: metricId,
          metricType: input.metricType,
          value: input.value,
          unit: input.unit,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          timestamp: new Date()
        })

        return { success: true, metricId }
      } catch (error) {
        console.error('Error recording performance metric:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record performance metric'
        })
      }
    }),

  // Analytics Events
  getAnalyticsEvents: adminProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
      eventType: z.string().optional(),
      limit: z.number().min(1).max(1000).default(100)
    }))
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
        events.forEach(event => {
          eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1
        })

        return {
          events: events.map(event => ({
            ...event,
            properties: event.properties ? JSON.parse(event.properties) : null
          })),
          eventTypes,
          totalEvents: events.length
        }
      } catch (error) {
        console.error('Error fetching analytics events:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch analytics events'
        })
      }
    }),

  // Resource Usage
  getResourceUsage: adminProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
      resourceType: z.enum(['cpu', 'memory', 'disk', 'network', 'database']).optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(resourceUsage.createdAt, startTime)]
        
        if (input.resourceType) {
          conditions.push(eq(resourceUsage.resourceType, input.resourceType))
        }

        const usage = await ctx.db.query.resourceUsage.findMany({
          where: and(...conditions),
          orderBy: desc(resourceUsage.createdAt),
          limit: 1000
        })

        // Group by resource type and calculate statistics
        const groupedUsage: Record<string, any> = {}
        usage.forEach(item => {
          if (!groupedUsage[item.resourceType]) {
            groupedUsage[item.resourceType] = {
              data: [],
              avgUsage: 0,
              maxUsage: 0,
              currentUsage: 0,
              alerts: 0
            }
          }
          
          const group = groupedUsage[item.resourceType]
          group.data.push({
            timestamp: item.timestamp,
            usage: item.usage,
            limit: item.limit
          })
          
          group.maxUsage = Math.max(group.maxUsage, item.usage)
          
          if (!group.currentUsage || item.timestamp > group.currentUsage) {
            group.currentUsage = item.usage
          }
          
          // Count threshold breaches as alerts
          if (item.limit && item.usage > item.limit * 0.8) {
            group.alerts++
          }
        })

        // Calculate averages
        Object.keys(groupedUsage).forEach(type => {
          const group = groupedUsage[type]
          group.avgUsage = group.data.reduce((sum: number, item: any) => sum + item.usage, 0) / group.data.length
        })

        return {
          usage: groupedUsage,
          timeRange: input.timeRange
        }
      } catch (error) {
        console.error('Error fetching resource usage:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch resource usage'
        })
      }
    }),

  // API Usage Tracking
  getApiUsage: adminProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
      endpoint: z.string().optional(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional()
    }))
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
        const stats = {
          totalRequests: usage.length,
          uniqueUsers: new Set(usage.map(u => u.userId).filter(Boolean)).size,
          avgResponseTime: usage.reduce((sum, u) => sum + (u.responseTime || 0), 0) / usage.length,
          errorRate: (usage.filter(u => u.statusCode >= 400).length / usage.length) * 100,
          topEndpoints: {} as Record<string, number>,
          statusCodes: {} as Record<string, number>
        }

        // Group by endpoint and status code
        usage.forEach(item => {
          stats.topEndpoints[item.endpoint] = (stats.topEndpoints[item.endpoint] || 0) + 1
          stats.statusCodes[item.statusCode.toString()] = (stats.statusCodes[item.statusCode.toString()] || 0) + 1
        })

        return {
          usage: usage.map(item => ({
            ...item,
            headers: item.headers ? JSON.parse(item.headers) : null
          })),
          stats,
          timeRange: input.timeRange
        }
      } catch (error) {
        console.error('Error fetching API usage:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch API usage'
        })
      }
    }),

  // Query Performance
  getQueryPerformance: adminProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
      slowQueriesOnly: z.boolean().default(false),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(queryPerformance.timestamp, startTime)]
        
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
        const stats = {
          totalQueries: queries.length,
          avgExecutionTime: queries.reduce((sum, q) => sum + q.executionTime, 0) / queries.length,
          slowQueries: queries.filter(q => q.executionTime > 1000).length,
          topSlowQueries: queries
            .filter(q => q.executionTime > 1000)
            .slice(0, 10)
            .map(q => ({
              query: q.query.substring(0, 100) + '...',
              executionTime: q.executionTime,
              timestamp: q.timestamp
            }))
        }

        return {
          queries: queries.map(query => ({
            ...query,
            parameters: query.parameters ? JSON.parse(query.parameters) : null
          })),
          stats,
          timeRange: input.timeRange
        }
      } catch (error) {
        console.error('Error fetching query performance:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch query performance'
        })
      }
    }),

  // Error Tracking
  getErrorTracking: adminProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
      resolved: z.boolean().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(errorTracking.createdAt, startTime)]
        
        if (input.resolved !== undefined) {
          conditions.push(eq(errorTracking.resolved, input.resolved))
        }
        
        if (input.severity) {
          conditions.push(eq(errorTracking.severity, input.severity))
        }

        const errors = await ctx.db.query.errorTracking.findMany({
          where: and(...conditions),
          orderBy: desc(errorTracking.createdAt),
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

        // Group by fingerprint to show error frequency
        const errorGroups: Record<string, any> = {}
        errors.forEach(error => {
          const fingerprint = error.fingerprint || 'unknown'
          if (!errorGroups[fingerprint]) {
            errorGroups[fingerprint] = {
              fingerprint,
              message: error.message,
              severity: error.severity,
              count: 0,
              firstSeen: error.timestamp,
              lastSeen: error.timestamp,
              resolved: error.resolved
            }
          }
          
          const group = errorGroups[fingerprint]
          group.count++
          
          if (error.timestamp < group.firstSeen) {
            group.firstSeen = error.timestamp
          }
          
          if (error.timestamp > group.lastSeen) {
            group.lastSeen = error.timestamp
          }
        })

        return {
          errors: errors.map(error => ({
            ...error,
            context: error.context ? JSON.parse(error.context) : null,
            stackTrace: error.stackTrace ? JSON.parse(error.stackTrace) : null
          })),
          errorGroups: Object.values(errorGroups),
          totalErrors: errors.length
        }
      } catch (error) {
        console.error('Error fetching error tracking:', error)
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
        console.error('Error resolving error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resolve error'
        })
      }
    }),

  // Alerts
  getAlerts: adminProcedure
    .input(z.object({
      active: z.boolean().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
    }))
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
          alerts: alertList.map(alert => ({
            ...alert,
            conditions: alert.conditions ? JSON.parse(alert.conditions) : null,
            notificationChannels: alert.notificationChannels ? JSON.parse(alert.notificationChannels) : []
          }))
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch alerts'
        })
      }
    }),

  getAlertInstances: adminProcedure
    .input(z.object({
      alertId: z.string().optional(),
      resolved: z.boolean().optional(),
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h')
    }))
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
          instances: instances.map(instance => ({
            ...instance,
            triggerData: instance.triggerData ? JSON.parse(instance.triggerData) : null
          }))
        }
      } catch (error) {
        console.error('Error fetching alert instances:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch alert instances'
        })
      }
    }),

  // User Activity Tracking
  getUserActivity: adminProcedure
    .input(z.object({
      userId: z.string().optional(),
      timeRange: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
      activityType: z.string().optional(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const startTime = getTimeRange(input.timeRange)
        const conditions = [gte(userActivity.timestamp, startTime)]
        
        if (input.userId) {
          conditions.push(eq(userActivity.userId, input.userId))
        }
        
        if (input.activityType) {
          conditions.push(eq(userActivity.activityType, input.activityType))
        }

        const activities = await ctx.db.query.userActivity.findMany({
          where: and(...conditions),
          orderBy: desc(userActivity.timestamp),
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
          uniqueUsers: new Set(activities.map(a => a.userId)).size,
          activityTypes: {} as Record<string, number>,
          hourlyDistribution: {} as Record<string, number>
        }

        activities.forEach(activity => {
          stats.activityTypes[activity.activityType] = (stats.activityTypes[activity.activityType] || 0) + 1
          
          const hour = activity.timestamp.getHours()
          stats.hourlyDistribution[hour] = (stats.hourlyDistribution[hour] || 0) + 1
        })

        return {
          activities: activities.map(activity => ({
            ...activity,
            metadata: activity.metadata ? JSON.parse(activity.metadata) : null
          })),
          stats
        }
      } catch (error) {
        console.error('Error fetching user activity:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user activity'
        })
      }
    }),

  // Monitoring Dashboard Stats
  getMonitoringStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const now = new Date()
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // Get recent performance metrics
        const recentMetrics = await ctx.db.query.performanceMetrics.findMany({
          where: gte(performanceMetrics.createdAt, oneHourAgo),
          columns: { id: true, metricType: true, value: true }
        })

        // Get recent errors
        const recentErrors = await ctx.db.query.errorTracking.findMany({
          where: gte(errorTracking.createdAt, oneHourAgo),
          columns: { id: true, severity: true, resolved: true }
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

        return {
          performance: {
            totalMetrics: recentMetrics.length,
            avgResponseTime: recentMetrics
              .filter(m => m.metricType === 'response_time')
              .reduce((sum, m) => sum + m.value, 0) / 
              Math.max(recentMetrics.filter(m => m.metricType === 'response_time').length, 1)
          },
          errors: {
            total: recentErrors.length,
            unresolved: recentErrors.filter(e => !e.resolved).length,
            critical: recentErrors.filter(e => e.severity === 'critical').length,
            high: recentErrors.filter(e => e.severity === 'high').length
          },
          alerts: {
            total: activeAlerts.length,
            critical: activeAlerts.filter(a => a.severity === 'critical').length,
            high: activeAlerts.filter(a => a.severity === 'high').length
          },
          api: {
            totalRequests: recentApiUsage.length,
            errorRate: recentApiUsage.length > 0 ? 
              (recentApiUsage.filter(u => u.statusCode >= 400).length / recentApiUsage.length) * 100 : 0,
            avgResponseTime: recentApiUsage.length > 0 ?
              recentApiUsage.reduce((sum, u) => sum + (u.responseTime || 0), 0) / recentApiUsage.length : 0
          }
        }
      } catch (error) {
        console.error('Error fetching monitoring stats:', error)
        return {
          performance: { totalMetrics: 0, avgResponseTime: 0 },
          errors: { total: 0, unresolved: 0, critical: 0, high: 0 },
          alerts: { total: 0, critical: 0, high: 0 },
          api: { totalRequests: 0, errorRate: 0, avgResponseTime: 0 }
        }
      }
    })
})
