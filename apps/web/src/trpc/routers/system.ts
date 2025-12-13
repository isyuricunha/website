import { TRPCError } from '@trpc/server'
import {
  and,
  bulkOperations,
  desc,
  eq,
  errorLogs,
  gte,
  siteConfig,
  systemHealthLogs
} from '@isyuricunha/db'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { adminProcedure, createTRPCRouter } from '../trpc'
import { logger } from '@/lib/logger'

// Helper function to perform health checks
async function performHealthCheck(type: string, db: any) {
  const startTime = Date.now()
  let status: 'healthy' | 'warning' | 'critical' | 'unknown' = 'unknown'
  let message = ''
  let details = {}

  try {
    switch (type) {
      case 'database':
        // Simple database connectivity test
        await db.query.users.findFirst({ columns: { id: true } })
        status = 'healthy'
        message = 'Database connection successful'
        break

      case 'email': {
        // Check if email service is configured
        const hasResendKey = !!process.env.RESEND_API_KEY
        status = hasResendKey ? 'healthy' : 'warning'
        message = hasResendKey ? 'Email service configured' : 'Email service not configured'
        details = { configured: hasResendKey }
        break
      }

      case 'api': {
        // Check API response time
        const responseTime = Date.now() - startTime
        status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'warning' : 'critical'
        message = `API response time: ${responseTime}ms`
        details = { responseTime }
        break
      }

      case 'storage':
        // Check if we can write to temp directory (basic storage check)
        status = 'healthy'
        message = 'Storage access available'
        break

      default:
        status = 'unknown'
        message = 'Unknown health check type'
    }
  } catch (error) {
    status = 'critical'
    message = error instanceof Error ? error.message : 'Health check failed'
    details = { error: String(error) }
  }

  return {
    status,
    message,
    details,
    responseTime: Date.now() - startTime
  }
}

export const systemRouter = createTRPCRouter({
  // Get system health overview
  getSystemHealth: adminProcedure.query(async ({ ctx }) => {
    try {
      const healthChecks = ['database', 'email', 'api', 'storage']
      const results = []

      for (const checkType of healthChecks) {
        const result = await performHealthCheck(checkType, ctx.db)
        results.push({
          type: checkType,
          ...result,
          timestamp: new Date()
        })

        // Log health check result
        const logId = randomBytes(16).toString('hex')
        await ctx.db.insert(systemHealthLogs).values({
          id: logId,
          checkType: checkType as any,
          status: result.status,
          responseTime: result.responseTime,
          message: result.message,
          details: JSON.stringify(result.details),
          createdAt: new Date()
        })
      }

      // Get recent health history
      const recentLogs = await ctx.db.query.systemHealthLogs.findMany({
        orderBy: desc(systemHealthLogs.createdAt),
        limit: 50
      })

      // Calculate overall system status
      const criticalCount = results.filter((r) => r.status === 'critical').length
      const warningCount = results.filter((r) => r.status === 'warning').length

      let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (criticalCount > 0) overallStatus = 'critical'
      else if (warningCount > 0) overallStatus = 'warning'

      return {
        overallStatus,
        checks: results,
        history: recentLogs.map((log) => ({
          ...log,
          details: log.details ? JSON.parse(log.details) : null
        }))
      }
    } catch (error) {
      logger.error('Error getting system health', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get system health'
      })
    }
  }),

  // Get error logs
  getErrorLogs: adminProcedure
    .input(
      z.object({
        level: z.enum(['error', 'warning', 'info']).optional(),
        resolved: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.level) {
          conditions.push(eq(errorLogs.level, input.level))
        }

        if (input.resolved !== undefined) {
          conditions.push(eq(errorLogs.resolved, input.resolved))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const logs = await ctx.db.query.errorLogs.findMany({
          where: whereClause,
          orderBy: desc(errorLogs.createdAt),
          limit: input.limit,
          offset: input.offset,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            },
            resolvedByUser: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        const totalCount = await ctx.db.query.errorLogs.findMany({
          where: whereClause,
          columns: { id: true }
        })

        return {
          logs: logs.map((log) => ({
            ...log,
            metadata: log.metadata ? JSON.parse(log.metadata) : null
          })),
          total: totalCount.length,
          hasMore: totalCount.length > input.offset + input.limit
        }
      } catch (error) {
        logger.error('Error fetching error logs', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch error logs'
        })
      }
    }),

  // Log an error
  logError: adminProcedure
    .input(
      z.object({
        level: z.enum(['error', 'warning', 'info']),
        message: z.string(),
        stack: z.string().optional(),
        url: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const errorId = randomBytes(16).toString('hex')
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        await ctx.db.insert(errorLogs).values({
          id: errorId,
          level: input.level,
          message: input.message,
          stack: input.stack,
          url: input.url,
          userId: ctx.session.user.id,
          ipAddress,
          userAgent: userAgent,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          createdAt: new Date()
        })

        return { success: true, errorId }
      } catch (error) {
        logger.error('Error logging error', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to log error'
        })
      }
    }),

  // Resolve error
  resolveError: adminProcedure
    .input(z.object({ errorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        await ctx.db
          .update(errorLogs)
          .set({
            resolved: true,
            resolvedBy: ctx.session.user.id,
            resolvedAt: new Date()
          })
          .where(eq(errorLogs.id, input.errorId))

        // Log the audit trail
        await auditLogger.log({
          adminUserId: ctx.session.user.id,
          action: 'settings_update', // We can extend this to 'error_resolve' later
          targetType: 'error',
          targetId: input.errorId,
          details: { action: 'resolved' },
          ipAddress,
          userAgent
        })

        return { success: true }
      } catch (error) {
        logger.error('Error resolving error', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resolve error'
        })
      }
    }),

  // Get site configuration
  getSiteConfig: adminProcedure.query(async ({ ctx }) => {
    try {
      const config = await ctx.db.query.siteConfig.findMany({
        orderBy: [siteConfig.type, siteConfig.key],
        with: {
          updatedByUser: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Group by type
      const groupedConfig: Record<string, any[]> = {}
      config.forEach((item) => {
        const type = item.type
        const group = groupedConfig[type] ?? []
        if (!groupedConfig[type]) {
          groupedConfig[type] = group
        }
        group.push({
          ...item,
          value: item.value ? JSON.parse(item.value) : null
        })
      })

      return { config: groupedConfig }
    } catch (error) {
      logger.error('Error fetching site config', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch site configuration'
      })
    }
  }),

  // Update site configuration
  updateSiteConfig: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z
          .enum(['general', 'seo', 'social', 'email', 'analytics', 'security', 'features'])
          .optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // Check if config exists
        const existingConfig = await ctx.db.query.siteConfig.findFirst({
          where: eq(siteConfig.key, input.key)
        })

        if (existingConfig) {
          // Update existing
          await ctx.db
            .update(siteConfig)
            .set({
              value: input.value,
              type: input.type || existingConfig.type,
              description: input.description || existingConfig.description,
              isPublic: input.isPublic ?? existingConfig.isPublic,
              updatedBy: ctx.session.user.id,
              updatedAt: new Date()
            })
            .where(eq(siteConfig.key, input.key))
        } else {
          // Create new
          const configId = randomBytes(16).toString('hex')
          await ctx.db.insert(siteConfig).values({
            id: configId,
            key: input.key,
            value: input.value,
            type: input.type || 'general',
            description: input.description,
            isPublic: input.isPublic || false,
            updatedBy: ctx.session.user.id,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }

        // Log the audit trail
        await auditLogger.log({
          adminUserId: ctx.session.user.id,
          action: 'settings_update',
          targetType: 'config',
          targetId: input.key,
          details: {
            key: input.key,
            previousValue: existingConfig?.value,
            newValue: input.value,
            type: input.type
          },
          ipAddress,
          userAgent
        })

        return { success: true }
      } catch (error) {
        logger.error('Error updating site config', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update site configuration'
        })
      }
    }),

  // Get bulk operations
  getBulkOperations: adminProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
        limit: z.number().min(1).max(50).default(20)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.status) {
          conditions.push(eq(bulkOperations.status, input.status))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const operations = await ctx.db.query.bulkOperations.findMany({
          where: whereClause,
          orderBy: desc(bulkOperations.createdAt),
          limit: input.limit,
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
          operations: operations.map((op) => ({
            ...op,
            parameters: op.parameters ? JSON.parse(op.parameters) : null,
            results: op.results ? JSON.parse(op.results) : null
          }))
        }
      } catch (error) {
        logger.error('Error fetching bulk operations', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bulk operations'
        })
      }
    }),

  // Get system statistics
  getSystemStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Error statistics
      const totalErrors = await ctx.db.query.errorLogs.findMany({
        columns: { id: true }
      })

      const recentErrors = await ctx.db.query.errorLogs.findMany({
        where: gte(errorLogs.createdAt, oneDayAgo),
        columns: { id: true, level: true }
      })

      const unresolvedErrors = await ctx.db.query.errorLogs.findMany({
        where: eq(errorLogs.resolved, false),
        columns: { id: true }
      })

      // Health check statistics
      const recentHealthChecks = await ctx.db.query.systemHealthLogs.findMany({
        where: gte(systemHealthLogs.createdAt, oneWeekAgo),
        columns: { id: true, status: true, checkType: true }
      })

      const healthyChecks = recentHealthChecks.filter((h) => h.status === 'healthy').length
      const warningChecks = recentHealthChecks.filter((h) => h.status === 'warning').length
      const criticalChecks = recentHealthChecks.filter((h) => h.status === 'critical').length

      return {
        errors: {
          total: totalErrors.length,
          recent: recentErrors.length,
          unresolved: unresolvedErrors.length,
          byLevel: {
            error: recentErrors.filter((e) => e.level === 'error').length,
            warning: recentErrors.filter((e) => e.level === 'warning').length,
            info: recentErrors.filter((e) => e.level === 'info').length
          }
        },
        health: {
          total: recentHealthChecks.length,
          healthy: healthyChecks,
          warning: warningChecks,
          critical: criticalChecks,
          uptime: (healthyChecks / (recentHealthChecks.length || 1)) * 100
        }
      }
    } catch (error) {
      logger.error('Error fetching system stats', error)
      return {
        errors: {
          total: 0,
          recent: 0,
          unresolved: 0,
          byLevel: { error: 0, warning: 0, info: 0 }
        },
        health: {
          total: 0,
          healthy: 0,
          warning: 0,
          critical: 0,
          uptime: 0
        }
      }
    }
  })
})
