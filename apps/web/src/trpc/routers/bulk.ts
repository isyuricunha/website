import { TRPCError } from '@trpc/server'
import {
  and,
  bulkOperations,
  desc,
  eq,
  inArray,
  isNull,
  or,
  posts,
  sessions,
  users
} from '@isyuricunha/db'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { adminProcedure, createTRPCRouter } from '../trpc'
import { logger } from '@/lib/logger'

const bulk_operation_statuses = ['pending', 'running', 'completed', 'failed', 'cancelled'] as const

type Database = typeof import('@isyuricunha/db').db

const isBulkOperationCancelled = async (db: Database, operationId: string): Promise<boolean> => {
  const op = await db.query.bulkOperations.findFirst({
    where: eq(bulkOperations.id, operationId),
    columns: { status: true }
  })

  return op?.status === 'cancelled'
}

export const bulkRouter = createTRPCRouter({
  listBulkOperations: adminProcedure
    .input(
      z.object({
        status: z.enum(bulk_operation_statuses).optional(),
        type: z.string().max(100).optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = []

      if (input.status) conditions.push(eq(bulkOperations.status, input.status))
      if (input.type) conditions.push(eq(bulkOperations.type, input.type))

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      const operations = await ctx.db.query.bulkOperations.findMany({
        where: whereClause,
        with: {
          createdByUser: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: desc(bulkOperations.createdAt),
        limit: input.limit,
        offset: input.offset
      })

      return operations.map((operation) => {
        const total = operation.totalItems
        const processed = operation.processedItems

        return {
          ...operation,
          parameters: operation.parameters ? JSON.parse(operation.parameters) : null,
          results: operation.results ? JSON.parse(operation.results) : null,
          progress: total > 0 ? Math.round((processed / total) * 100) : 0
        }
      })
    }),

  // Bulk user operations
  bulkUserAction: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()).min(1).max(100),
        action: z.enum(['delete', 'ban', 'unban', 'update_role']),
        parameters: z.record(z.string(), z.any()).optional() // For additional parameters like new role
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operationId = randomBytes(16).toString('hex')
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const totalItems = input.userIds.length
        let processedItems = 0
        let successfulItems = 0
        let failedItems = 0
        const results: any[] = []

        // Create bulk operation record
        await ctx.db.insert(bulkOperations).values({
          id: operationId,
          type: `user_${input.action}`,
          status: 'running',
          totalItems,
          processedItems: 0,
          successfulItems: 0,
          failedItems: 0,
          parameters: JSON.stringify({
            action: input.action,
            userIds: input.userIds,
            ...input.parameters
          }),
          startedAt: new Date(),
          createdBy: ctx.session.user.id,
          createdAt: new Date()
        })

        // Get user details for validation and audit
        const targetUsers = await ctx.db.query.users.findMany({
          where: inArray(users.id, input.userIds),
          columns: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        })

        // Validate that we found all users
        for (const userId of input.userIds) {
          if (await isBulkOperationCancelled(ctx.db, operationId)) {
            await ctx.db
              .update(bulkOperations)
              .set({
                status: 'cancelled',
                completedAt: new Date(),
                results: JSON.stringify(results)
              })
              .where(eq(bulkOperations.id, operationId))

            return {
              success: true,
              operationId,
              cancelled: true,
              summary: {
                total: totalItems,
                successful: successfulItems,
                failed: failedItems,
                processed: processedItems
              }
            }
          }

          processedItems++

          try {
            const user = targetUsers.find((u) => u.id === userId)

            if (!user) {
              results.push({
                userId,
                success: false,
                error: 'User not found'
              })
              failedItems++
              continue
            }

            // Prevent operations on admin users (safety check)
            if (user.role === 'admin' && (input.action === 'delete' || input.action === 'ban')) {
              results.push({
                userId,
                success: false,
                error: 'Cannot delete or ban admin users'
              })
              failedItems++
              continue
            }

            switch (input.action) {
              case 'delete':
                await ctx.db.delete(users).where(eq(users.id, userId))
                await auditLogger.logUserAction(
                  ctx.session.user.id,
                  'user_delete',
                  userId,
                  {
                    bulkOperation: true,
                    operationId,
                    deletedUser: { name: user.name, email: user.email, role: user.role }
                  },
                  ipAddress,
                  userAgent
                )
                break

              case 'ban':
                // Delete all user sessions to effectively "ban" them
                await ctx.db.delete(sessions).where(eq(sessions.userId, userId))
                await auditLogger.logUserAction(
                  ctx.session.user.id,
                  'user_ban',
                  userId,
                  {
                    bulkOperation: true,
                    operationId,
                    bannedUser: { name: user.name, email: user.email }
                  },
                  ipAddress,
                  userAgent
                )
                break

              case 'unban':
                // For unban, we just log the action (sessions will be created on next login)
                await auditLogger.logUserAction(
                  ctx.session.user.id,
                  'user_unban',
                  userId,
                  {
                    bulkOperation: true,
                    operationId,
                    unbannedUser: { name: user.name, email: user.email }
                  },
                  ipAddress,
                  userAgent
                )
                break

              case 'update_role': {
                const newRole = input.parameters?.role
                if (!newRole || !['user', 'admin'].includes(newRole)) {
                  throw new Error('Invalid role specified')
                }

                await ctx.db
                  .update(users)
                  .set({ role: newRole, updatedAt: new Date() })
                  .where(eq(users.id, userId))

                await auditLogger.logUserAction(
                  ctx.session.user.id,
                  'user_update',
                  userId,
                  {
                    bulkOperation: true,
                    operationId,
                    previousRole: user.role,
                    newRole,
                    user: { name: user.name, email: user.email }
                  },
                  ipAddress,
                  userAgent
                )
                break
              }

              default:
                throw new Error(`Unknown action: ${input.action}`)
            }

            results.push({
              userId,
              success: true,
              user: { name: user.name, email: user.email }
            })
            successfulItems++
          } catch (error) {
            results.push({
              userId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            })
            failedItems++
          }

          // Update progress
          await ctx.db
            .update(bulkOperations)
            .set({
              processedItems,
              successfulItems,
              failedItems,
              results: JSON.stringify(results)
            })
            .where(eq(bulkOperations.id, operationId))
        }

        // Mark operation as completed
        await ctx.db
          .update(bulkOperations)
          .set({
            status: failedItems === 0 ? 'completed' : 'completed', // Could be 'partial' if some failed
            completedAt: new Date(),
            results: JSON.stringify(results)
          })
          .where(eq(bulkOperations.id, operationId))

        // Log the bulk operation in audit trail
        await auditLogger.logBulkOperation(
          ctx.session.user.id,
          {
            operationId,
            action: input.action,
            totalItems,
            successfulItems,
            failedItems,
            results: results.slice(0, 10) // Limit results in audit log
          },
          ipAddress,
          userAgent
        )

        return {
          success: true,
          operationId,
          summary: {
            total: totalItems,
            successful: successfulItems,
            failed: failedItems,
            processed: processedItems
          }
        }
      } catch (error) {
        logger.error('Bulk operation error:', error)

        // Try to update operation status to failed
        try {
          await ctx.db
            .update(bulkOperations)
            .set({
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              completedAt: new Date()
            })
            .where(eq(bulkOperations.id, operationId))
        } catch (updateError) {
          logger.error('Failed to update bulk operation status:', updateError)
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bulk operation failed'
        })
      }
    }),

  bulkPostAction: adminProcedure
    .input(
      z
        .object({
          postIds: z.array(z.string()).min(1).max(100),
          action: z.enum(['publish', 'archive', 'delete'])
        })
        .strict()
    )
    .mutation(async ({ ctx, input }) => {
      const operationId = randomBytes(16).toString('hex')

      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const totalItems = input.postIds.length
        let processedItems = 0
        let successfulItems = 0
        let failedItems = 0
        const results: Array<{ postId: string; success: boolean; error?: string }> = []

        await ctx.db.insert(bulkOperations).values({
          id: operationId,
          type: `post_${input.action}`,
          status: 'running',
          totalItems,
          processedItems: 0,
          successfulItems: 0,
          failedItems: 0,
          parameters: JSON.stringify({ action: input.action, postIds: input.postIds }),
          startedAt: new Date(),
          createdBy: ctx.session.user.id,
          createdAt: new Date()
        })

        const targetPosts = await ctx.db.query.posts.findMany({
          where: inArray(posts.id, input.postIds),
          columns: {
            id: true,
            title: true,
            status: true,
            publishedAt: true
          }
        })

        for (const postId of input.postIds) {
          if (await isBulkOperationCancelled(ctx.db, operationId)) {
            await ctx.db
              .update(bulkOperations)
              .set({
                status: 'cancelled',
                completedAt: new Date(),
                results: JSON.stringify(results)
              })
              .where(eq(bulkOperations.id, operationId))

            return {
              success: true,
              operationId,
              cancelled: true,
              summary: {
                total: totalItems,
                successful: successfulItems,
                failed: failedItems,
                processed: processedItems
              }
            }
          }

          processedItems++

          try {
            const post = targetPosts.find((p) => p.id === postId)
            if (!post) {
              results.push({ postId, success: false, error: 'Post not found' })
              failedItems++
            } else if (input.action === 'delete') {
              await ctx.db.delete(posts).where(eq(posts.id, postId))
              results.push({ postId, success: true })
              successfulItems++
            } else {
              const nextStatus = input.action === 'publish' ? 'published' : 'archived'
              const now = new Date()

              await ctx.db
                .update(posts)
                .set({ status: nextStatus, updatedAt: now })
                .where(eq(posts.id, postId))

              if (nextStatus === 'published') {
                await ctx.db
                  .update(posts)
                  .set({ publishedAt: now })
                  .where(and(eq(posts.id, postId), isNull(posts.publishedAt)))
              }

              results.push({ postId, success: true })
              successfulItems++
            }
          } catch (error) {
            results.push({
              postId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            })
            failedItems++
          }

          await ctx.db
            .update(bulkOperations)
            .set({
              processedItems,
              successfulItems,
              failedItems,
              results: JSON.stringify(results)
            })
            .where(eq(bulkOperations.id, operationId))
        }

        await ctx.db
          .update(bulkOperations)
          .set({
            status: 'completed',
            completedAt: new Date(),
            results: JSON.stringify(results)
          })
          .where(eq(bulkOperations.id, operationId))

        await auditLogger.logBulkOperation(
          ctx.session.user.id,
          {
            operationId,
            type: `post_${input.action}`,
            totalItems,
            successfulItems,
            failedItems
          },
          ipAddress,
          userAgent
        )

        return {
          success: true,
          operationId,
          summary: {
            total: totalItems,
            successful: successfulItems,
            failed: failedItems,
            processed: processedItems
          }
        }
      } catch (error) {
        logger.error('Bulk post operation error:', error)

        try {
          await ctx.db
            .update(bulkOperations)
            .set({
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              completedAt: new Date()
            })
            .where(eq(bulkOperations.id, operationId))
        } catch (updateError) {
          logger.error('Failed to update bulk operation status:', updateError)
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bulk operation failed'
        })
      }
    }),

  // Get users for bulk operations (with filtering)
  getUsersForBulkOperation: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(['user', 'admin']).optional(),
        excludeAdmins: z.boolean().default(true),
        limit: z.number().min(1).max(1000).default(100)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.excludeAdmins) {
          conditions.push(eq(users.role, 'user'))
        } else if (input.role) {
          conditions.push(eq(users.role, input.role))
        }

        if (input.search) {
          conditions.push(
            or(
              eq(users.name, input.search),
              eq(users.email, input.search),
              eq(users.username, input.search)
            )
          )
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const targetUsers = await ctx.db.query.users.findMany({
          where: whereClause,
          columns: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            image: true,
            createdAt: true
          },
          limit: input.limit
        })

        return {
          users: targetUsers,
          total: targetUsers.length
        }
      } catch (error) {
        logger.error('Error fetching users for bulk operation:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users'
        })
      }
    }),

  // Cancel bulk operation
  cancelBulkOperation: adminProcedure
    .input(z.object({ operationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // Check if operation exists and can be cancelled
        const operation = await ctx.db.query.bulkOperations.findFirst({
          where: eq(bulkOperations.id, input.operationId)
        })

        if (!operation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Bulk operation not found'
          })
        }

        if (operation.status !== 'pending' && operation.status !== 'running') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot cancel completed or failed operation'
          })
        }

        await ctx.db
          .update(bulkOperations)
          .set({
            status: 'cancelled',
            completedAt: new Date()
          })
          .where(eq(bulkOperations.id, input.operationId))

        // Log the cancellation
        await auditLogger.log({
          adminUserId: ctx.session.user.id,
          action: 'bulk_operation',
          targetType: 'bulk_operation',
          targetId: input.operationId,
          details: { action: 'cancelled' },
          ipAddress,
          userAgent
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        logger.error('Error cancelling bulk operation:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel bulk operation'
        })
      }
    }),

  // Get bulk operation status
  getBulkOperationStatus: adminProcedure
    .input(z.object({ operationId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const operation = await ctx.db.query.bulkOperations.findFirst({
          where: eq(bulkOperations.id, input.operationId),
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

        if (!operation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Bulk operation not found'
          })
        }

        return {
          ...operation,
          parameters: operation.parameters ? JSON.parse(operation.parameters) : null,
          results: operation.results ? JSON.parse(operation.results) : null,
          progress:
            operation.totalItems > 0
              ? Math.round((operation.processedItems / operation.totalItems) * 100)
              : 0
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        logger.error('Error fetching bulk operation status:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bulk operation status'
        })
      }
    })
})
