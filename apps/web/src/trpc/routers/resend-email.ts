import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { createTRPCRouter, adminProcedure, protectedProcedure } from '@/trpc/trpc'
import { TRPCError } from '@trpc/server'
import { resendService } from '@/lib/resend-service'
import { users, emailSubscriptions } from '@tszhong0411/db'
import { AuditLogger } from '@/lib/audit-logger'

export const resendEmailRouter = createTRPCRouter({
  /**
   * Audience Management
   */

  // List all Resend audiences
  getAudiences: adminProcedure
    .query(async () => {
      try {
        console.log('🚀 TRPC: Getting audiences...')
        const audiences = await resendService.listAudiences()
        console.log('📋 TRPC: Audiences received:', audiences.length)
        return { audiences }
      } catch (error) {
        console.error('❌ TRPC: Error fetching Resend audiences:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audiences'
        })
      }
    }),

  // Create new audience
  createAudience: adminProcedure
    .input(z.object({
      name: z.string().min(1, 'Audience name is required')
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        const audience = await resendService.createAudience(input.name)

        if (!audience) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create audience'
          })
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_audience',
          audience.id,
          {
            action: 'audience_created',
            name: input.name
          }
        )

        return { success: true, audience }
      } catch (error) {
        console.error('Error creating Resend audience:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create audience'
        })
      }
    }),

  // Delete audience
  deleteAudience: adminProcedure
    .input(z.object({
      audienceId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        const success = await resendService.deleteAudience(input.audienceId)

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete audience'
          })
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_audience',
          input.audienceId,
          {
            action: 'audience_deleted'
          }
        )

        return { success: true }
      } catch (error) {
        console.error('Error deleting Resend audience:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete audience'
        })
      }
    }),

  /**
   * Contact Management
   */

  // Get contacts in audience
  getAudienceContacts: adminProcedure
    .input(z.object({
      audienceId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const contacts = await resendService.listContacts(input.audienceId)
        return { contacts }
      } catch (error) {
        console.error('Error fetching audience contacts:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contacts'
        })
      }
    }),

  // Sync all users to Resend audience
  syncUsersToAudience: adminProcedure
    .input(z.object({
      audienceId: z.string(),
      includeUnsubscribed: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        // Get all users with their subscription status
        const allUsers = await ctx.db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            isActive: emailSubscriptions.isActive
          })
          .from(users)
          .leftJoin(emailSubscriptions, eq(users.id, emailSubscriptions.userId))
          .where(input.includeUnsubscribed ? undefined : eq(emailSubscriptions.isActive, true))

        // Prepare users for sync - handle null/undefined names
        const usersToSync = allUsers.map(user => ({
          email: user.email,
          firstName: user.name ? user.name.split(' ')[0] : undefined,
          lastName: user.name ? user.name.split(' ').slice(1).join(' ') || undefined : undefined,
          subscribed: user.isActive ?? true
        }))

        // Bulk sync to Resend
        const result = await resendService.bulkSyncUsersToAudience(input.audienceId, usersToSync)

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_audience',
          input.audienceId,
          {
            action: 'users_synced',
            totalUsers: usersToSync.length,
            successful: result.success,
            failed: result.failed
          }
        )

        return {
          success: true,
          synced: result.success,
          failed: result.failed,
          total: usersToSync.length
        }
      } catch (error) {
        console.error('Error syncing users to Resend audience:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync users to audience'
        })
      }
    }),

  /**
   * Broadcast Management
   */

  // List all Resend broadcasts
  getBroadcasts: adminProcedure
    .query(async () => {
      try {
        console.log('🚀 TRPC: Getting broadcasts...')
        const broadcasts = await resendService.listBroadcasts()
        console.log('📋 TRPC: Broadcasts received:', broadcasts.length)
        return { broadcasts }
      } catch (error) {
        console.error('❌ TRPC: Error fetching Resend broadcasts:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch broadcasts'
        })
      }
    }),

  // Create broadcast
  createBroadcast: adminProcedure
    .input(z.object({
      name: z.string().min(1, 'Broadcast name is required'),
      audienceId: z.string().min(1, 'Audience is required'),
      from: z.string().email('Valid from email is required'),
      subject: z.string().min(1, 'Subject is required'),
      html: z.string().optional(),
      text: z.string().optional(),
      replyTo: z.string().email().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        const broadcast = await resendService.createBroadcast({
          name: input.name,
          audience_id: input.audienceId,
          from: input.from,
          subject: input.subject,
          html: input.html,
          text: input.text,
          reply_to: input.replyTo
        })

        if (!broadcast) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create broadcast'
          })
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_broadcast',
          broadcast.id,
          {
            action: 'broadcast_created',
            name: input.name,
            subject: input.subject,
            audienceId: input.audienceId
          }
        )

        return { success: true, broadcast }
      } catch (error) {
        console.error('Error creating Resend broadcast:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create broadcast'
        })
      }
    }),

  // Send broadcast immediately
  sendBroadcast: adminProcedure
    .input(z.object({
      broadcastId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        const success = await resendService.sendBroadcast(input.broadcastId)

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send broadcast'
          })
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_broadcast',
          input.broadcastId,
          {
            action: 'broadcast_sent'
          }
        )

        return { success: true }
      } catch (error) {
        console.error('Error sending Resend broadcast:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send broadcast'
        })
      }
    }),

  // Schedule broadcast
  scheduleBroadcast: adminProcedure
    .input(z.object({
      broadcastId: z.string(),
      scheduledAt: z.string().min(1, 'Schedule time is required')
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        const success = await resendService.scheduleBroadcast(input.broadcastId, input.scheduledAt)

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to schedule broadcast'
          })
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_broadcast',
          input.broadcastId,
          {
            action: 'broadcast_scheduled',
            scheduledAt: input.scheduledAt
          }
        )

        return { success: true }
      } catch (error) {
        console.error('Error scheduling Resend broadcast:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule broadcast'
        })
      }
    }),

  // Cancel broadcast
  cancelBroadcast: adminProcedure
    .input(z.object({
      broadcastId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        const success = await resendService.cancelBroadcast(input.broadcastId)

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to cancel broadcast'
          })
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_broadcast',
          input.broadcastId,
          {
            action: 'broadcast_cancelled'
          }
        )

        return { success: true }
      } catch (error) {
        console.error('Error cancelling Resend broadcast:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel broadcast'
        })
      }
    }),

  // Get single broadcast
  getBroadcast: adminProcedure
    .input(z.object({
      broadcastId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const broadcast = await resendService.getBroadcast(input.broadcastId)
        
        if (!broadcast) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Broadcast not found'
          })
        }

        return { broadcast }
      } catch (error) {
        console.error('Error fetching Resend broadcast:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch broadcast'
        })
      }
    }),

  // Update broadcast
  updateBroadcast: adminProcedure
    .input(z.object({
      broadcastId: z.string(),
      html: z.string().optional(),
      subject: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        const broadcast = await resendService.updateBroadcast(input.broadcastId, {
          html: input.html,
          subject: input.subject
        })

        if (!broadcast) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update broadcast'
          })
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_broadcast',
          input.broadcastId,
          {
            action: 'broadcast_updated',
            updates: {
              html: !!input.html,
              subject: !!input.subject
            }
          }
        )

        return { success: true, broadcast }
      } catch (error) {
        console.error('Error updating Resend broadcast:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update broadcast'
        })
      }
    }),

  // Delete broadcast
  deleteBroadcast: adminProcedure
    .input(z.object({
      broadcastId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)

        const success = await resendService.deleteBroadcast(input.broadcastId)

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete broadcast'
          })
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_broadcast',
          input.broadcastId,
          {
            action: 'broadcast_deleted'
          }
        )

        return { success: true }
      } catch (error) {
        console.error('Error deleting Resend broadcast:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete broadcast'
        })
      }
    }),

  /**
   * Analytics & Stats
   */

  // Get email marketing stats
  getEmailStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Get audiences and broadcasts from Resend
        const [audiences, broadcasts] = await Promise.all([
          resendService.listAudiences(),
          resendService.listBroadcasts()
        ])

        // Get local subscription stats
        const totalSubscribers = await ctx.db
          .select({ count: users.id })
          .from(users)
          .leftJoin(emailSubscriptions, eq(users.id, emailSubscriptions.userId))
          .where(eq(emailSubscriptions.isActive, true))

        const totalUsers = await ctx.db
          .select({ count: users.id })
          .from(users)

        // Calculate stats
        const sentBroadcasts = broadcasts.filter(b => b.status === 'sent')
        const scheduledBroadcasts = broadcasts.filter(b => b.status === 'scheduled')
        const draftBroadcasts = broadcasts.filter(b => b.status === 'draft')

        return {
          audiences: {
            total: audiences.length,
            list: audiences
          },
          broadcasts: {
            total: broadcasts.length,
            sent: sentBroadcasts.length,
            scheduled: scheduledBroadcasts.length,
            drafts: draftBroadcasts.length
          },
          subscribers: {
            total: totalSubscribers.length,
            totalUsers: totalUsers.length,
            subscriptionRate: totalUsers.length > 0 ?
              Math.round((totalSubscribers.length / totalUsers.length) * 100) : 0
          }
        }
      } catch (error) {
        console.error('Error fetching email stats:', error)
        return {
          audiences: { total: 0, list: [] },
          broadcasts: { total: 0, sent: 0, scheduled: 0, drafts: 0 },
          subscribers: { total: 0, totalUsers: 0, subscriptionRate: 0 }
        }
      }
    }),

  // Get analytics (alias for getEmailStats for component compatibility)
  getAnalytics: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Get audiences and broadcasts from Resend with rate limiting
        const audiences = await resendService.listAudiences()
        await new Promise(resolve => setTimeout(resolve, 600)) // Extra delay
        const broadcasts = await resendService.listBroadcasts()

        // Get real subscriber count from your main Resend audience
        let realSubscriberCount = 0
        if (audiences.length > 0) {
          // Use the first audience found, or you can specify your specific audience ID
          const mainAudienceId = audiences[0]?.id
          if (mainAudienceId) {
            await new Promise(resolve => setTimeout(resolve, 600)) // Rate limit delay
            realSubscriberCount = await resendService.getAudienceSubscriberCount(mainAudienceId)
          }
        }

        // Get local subscription stats for comparison
        const allSubscriptions = await ctx.db
          .select()
          .from(emailSubscriptions)
          .where(eq(emailSubscriptions.isActive, true))

        const allUsers = await ctx.db
          .select()
          .from(users)

        // Calculate stats
        const sentBroadcasts = broadcasts.filter(b => b.status === 'sent')
        const scheduledBroadcasts = broadcasts.filter(b => b.status === 'scheduled')
        const draftBroadcasts = broadcasts.filter(b => b.status === 'draft')

        const localSubscribers = allSubscriptions.length
        const totalUsers = allUsers.length

        return {
          totalAudiences: audiences.length,
          totalBroadcasts: broadcasts.length,
          totalSubscribers: realSubscriberCount, // Use real count from Resend
          subscriptionRate: totalUsers > 0 ? (realSubscriberCount / totalUsers) * 100 : 0,
          audiences: {
            total: audiences.length,
            list: audiences
          },
          broadcasts: {
            total: broadcasts.length,
            sent: sentBroadcasts.length,
            scheduled: scheduledBroadcasts.length,
            drafts: draftBroadcasts.length
          },
          subscribers: {
            total: realSubscriberCount, // Real subscriber count from Resend
            localSubscribers: localSubscribers, // Local DB count for comparison
            totalUsers,
            subscriptionRate: totalUsers > 0 ? Math.round((realSubscriberCount / totalUsers) * 100) : 0
          }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        return {
          totalAudiences: 0,
          totalBroadcasts: 0,
          totalSubscribers: 0,
          subscriptionRate: 0,
          audiences: { total: 0, list: [] },
          broadcasts: { total: 0, sent: 0, scheduled: 0, drafts: 0 },
          subscribers: { total: 0, totalUsers: 0, subscriptionRate: 0 }
        }
      }
    }),

  /**
   * User Subscription Management
   */

  // Subscribe user to email marketing
  subscribeUser: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const userEmail = ctx.session.user.email
        if (!userEmail) {
          throw new Error('User email is required for subscription')
        }

        // Generate unique ID and unsubscribe token
        const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const unsubscribeToken = `unsubscribe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Update local subscription status
        await ctx.db
          .insert(emailSubscriptions)
          .values({
            id: subscriptionId,
            email: userEmail,
            userId: ctx.session.user.id,
            unsubscribeToken: unsubscribeToken,
            isActive: true,
            subscribedAt: new Date()
          })
          .onConflictDoUpdate({
            target: emailSubscriptions.email,
            set: {
              isActive: true,
              subscribedAt: new Date()
            }
          })

        return { success: true }
      } catch (error) {
        console.error('Error subscribing user:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to subscribe to emails'
        })
      }
    }),

  // Unsubscribe user from email marketing
  unsubscribeUser: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Update existing subscription status
        await ctx.db
          .update(emailSubscriptions)
          .set({
            isActive: false,
            unsubscribedAt: new Date()
          })
          .where(eq(emailSubscriptions.userId, ctx.session.user.id))

        return { success: true }
      } catch (error) {
        console.error('Error unsubscribing user:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to unsubscribe from emails'
        })
      }
    }),

  // Get user subscription status
  getUserSubscriptionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const subscription = await ctx.db.query.emailSubscriptions.findFirst({
          where: eq(emailSubscriptions.userId, ctx.session.user.id)
        })

        return {
          subscribed: subscription?.isActive ?? true, // Default to subscribed
          subscribedAt: subscription?.subscribedAt,
          unsubscribedAt: subscription?.unsubscribedAt
        }
      } catch (error) {
        console.error('Error getting user subscription status:', error)
        return { subscribed: true }
      }
    })
})
