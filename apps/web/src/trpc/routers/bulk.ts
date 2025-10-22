import { TRPCError } from '@trpc/server'
import { bulkOperations, users, sessions } from '@tszhong0411/db'
import { eq, inArray, and, or } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { adminProcedure, createTRPCRouter } from '../trpc'
import { logger } from '@/lib/logger'

export const bulkRouter = createTRPCRouter({
  // Bulk user operations
  bulkUserAction: adminProcedure
    .input(z.object({
      userIds: z.array(z.string()).min(1).max(100),
      action: z.enum(['delete', 'ban', 'unban', 'update_role']),
      parameters: z.record(z.any()).optional() // For additional parameters like new role
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const operationId = randomBytes(16).toString('hex')
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
        const foundUserIds = targetUsers.map(u => u.id)
        const missingUserIds = input.userIds.filter(id => !foundUserIds.includes(id))

        for (const userId of input.userIds) {
          processedItems++
          
          try {
            const user = targetUsers.find(u => u.id === userId)
            
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

              case 'update_role':
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

  // Get users for bulk operations (with filtering)
  getUsersForBulkOperation: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      role: z.enum(['user', 'admin']).optional(),
      excludeAdmins: z.boolean().default(true),
      limit: z.number().min(1).max(1000).default(100)
    }))
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
          progress: operation.totalItems > 0 ? 
            Math.round((operation.processedItems / operation.totalItems) * 100) : 0
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
