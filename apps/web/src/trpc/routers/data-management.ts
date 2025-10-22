import { TRPCError } from '@trpc/server'
import { 
  databaseBackups,
  databaseRestores,
  dataMigrations,
  dataExports,
  dataImports,
  dataSynchronization,
  dataQualityChecks,
  dataQualityResults
} from '@tszhong0411/db'
import { and, desc, eq, gte } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'
import { adminProcedure, createTRPCRouter } from '../trpc'

export const dataManagementRouter = createTRPCRouter({
  // Database Backups
  getDatabaseBackups: adminProcedure
    .input(z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []
        if (input.status) {
          conditions.push(eq(databaseBackups.status, input.status))
        }

        const backups = await ctx.db.query.databaseBackups.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          orderBy: desc(databaseBackups.createdAt),
          limit: input.limit,
          with: {
            createdByUser: {
              columns: { id: true, name: true, email: true }
            }
          }
        })

        return {
          backups: backups.map(backup => ({
            ...backup,
            metadata: backup.metadata ? JSON.parse(backup.metadata) : null
          }))
        }
      } catch (error) {
        logger.error('Error fetching database backups', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch database backups'
        })
      }
    }),

  createDatabaseBackup: adminProcedure
    .input(z.object({
      type: z.enum(['full', 'incremental', 'differential']).default('full'),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const backupId = randomBytes(16).toString('hex')
        const filename = `backup_${input.type}_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`

        await ctx.db.insert(databaseBackups).values({
          id: backupId,
          filename,
          type: input.type,
          description: input.description,
          status: 'in_progress',
          createdBy: ctx.session.user.id
        })

        // Simulate backup completion
        setTimeout(async () => {
          const fileSize = Math.floor(Math.random() * 1000000) + 100000
          await ctx.db
            .update(databaseBackups)
            .set({
              status: 'completed',
              filePath: `/backups/${filename}`,
              fileSize,
              completedAt: new Date()
            })
            .where(eq(databaseBackups.id, backupId))
        }, 5000)

        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'database_backup',
          backupId,
          { action: 'backup_created', type: input.type },
          ipAddress,
          userAgent
        )

        return { success: true, backupId }
      } catch (error) {
        logger.error('Error creating database backup', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create database backup'
        })
      }
    }),

  // Data Exports
  getDataExports: adminProcedure
    .input(z.object({
      status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []
        if (input.status) {
          conditions.push(eq(dataExports.status, input.status))
        }

        const exports = await ctx.db.query.dataExports.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          orderBy: desc(dataExports.createdAt),
          limit: input.limit,
          with: {
            createdByUser: {
              columns: { id: true, name: true, email: true }
            }
          }
        })

        return {
          exports: exports.map(exportItem => ({
            ...exportItem,
            exportOptions: exportItem.exportOptions ? JSON.parse(exportItem.exportOptions) : null
          }))
        }
      } catch (error) {
        logger.error('Error fetching data exports', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch data exports'
        })
      }
    }),

  createDataExport: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      format: z.enum(['csv', 'json', 'xml', 'xlsx']).default('csv'),
      tables: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const exportId = randomBytes(16).toString('hex')
        const filename = `export_${input.name.replace(/\s+/g, '_')}_${Date.now()}.${input.format}`

        await ctx.db.insert(dataExports).values({
          id: exportId,
          name: input.name,
          format: input.format,
          tables: JSON.stringify(input.tables),
          filename,
          status: 'pending',
          createdBy: ctx.session.user.id
        })

        // Simulate export process
        setTimeout(async () => {
          const recordCount = Math.floor(Math.random() * 5000) + 100
          const fileSize = Math.floor(Math.random() * 10000000) + 1000000
          
          await ctx.db
            .update(dataExports)
            .set({
              status: 'completed',
              completedAt: new Date(),
              recordCount,
              fileSize,
              filePath: `/exports/${filename}`
            })
            .where(eq(dataExports.id, exportId))
        }, 6000)

        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'data_export',
          exportId,
          { action: 'export_created', name: input.name, format: input.format },
          ipAddress,
          userAgent
        )

        return { success: true, exportId }
      } catch (error) {
        logger.error('Error creating data export', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create data export'
        })
      }
    }),

  // Data Quality Checks
  runDataQualityCheck: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      tableName: z.string(),
      checkRules: z.array(z.object({
        field: z.string(),
        rule: z.enum(['not_null', 'unique', 'format', 'range'])
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const checkId = randomBytes(16).toString('hex')

        await ctx.db.insert(dataQualityChecks).values({
          id: checkId,
          name: input.name,
          tableName: input.tableName,
          checkRules: JSON.stringify(input.checkRules),
          status: 'running',
          createdBy: ctx.session.user.id
        })

        // Simulate quality check execution
        setTimeout(async () => {
          const totalRecords = Math.floor(Math.random() * 10000) + 1000
          const passedRecords = Math.floor(totalRecords * (0.8 + Math.random() * 0.2))
          const failedRecords = totalRecords - passedRecords
          
          await ctx.db
            .update(dataQualityChecks)
            .set({
              status: 'completed',
              completedAt: new Date(),
              totalRecords,
              passedRecords,
              failedRecords
            })
            .where(eq(dataQualityChecks.id, checkId))
        }, 7000)

        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'data_quality_check',
          checkId,
          { action: 'quality_check_started', name: input.name },
          ipAddress,
          userAgent
        )

        return { success: true, checkId }
      } catch (error) {
        logger.error('Error running data quality check', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to run data quality check'
        })
      }
    }),

  // Data Management Stats
  getDataManagementStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        const totalBackups = await ctx.db.query.databaseBackups.findMany({
          columns: { id: true, status: true, fileSize: true }
        })

        const totalExports = await ctx.db.query.dataExports.findMany({
          where: gte(dataExports.createdAt, thirtyDaysAgo),
          columns: { id: true, status: true, recordCount: true }
        })

        return {
          backups: {
            total: totalBackups.length,
            completed: totalBackups.filter(b => b.status === 'completed').length,
            totalSize: totalBackups.reduce((sum, b) => sum + (b.fileSize || 0), 0)
          },
          exports: {
            total: totalExports.length,
            completed: totalExports.filter(e => e.status === 'completed').length,
            totalRecords: totalExports.reduce((sum, e) => sum + (e.recordCount || 0), 0)
          }
        }
      } catch (error) {
        logger.error('Error fetching data management stats', error)
        return {
          backups: { total: 0, completed: 0, totalSize: 0 },
          exports: { total: 0, completed: 0, totalRecords: 0 }
        }
      }
    })
})
