import { TRPCError } from '@trpc/server'
import {
  announcements,
  emailCampaigns,
  emailTemplates,
  notifications,
  users,
  and,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  or
} from '@isyuricunha/db'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'
import { adminProcedure, protectedProcedure, createTRPCRouter } from '../trpc'

const parseJson = (raw: string | null): unknown => {
  if (!raw) return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

const getNotificationSeverity = (
  type: 'system' | 'user_action' | 'content' | 'security' | 'marketing' | 'reminder'
): 'info' | 'success' | 'warning' | 'error' => {
  switch (type) {
    case 'security':
      return 'error'
    case 'user_action':
      return 'success'
    case 'system':
    case 'reminder':
      return 'warning'
    case 'content':
    case 'marketing':
    default:
      return 'info'
  }
}

export const communicationRouter = createTRPCRouter({
  // Email Templates
  getEmailTemplates: adminProcedure
    .input(
      z.object({
        type: z
          .enum([
            'welcome',
            'password_reset',
            'email_verification',
            'newsletter',
            'announcement',
            'notification',
            'marketing',
            'transactional'
          ])
          .optional(),
        active: z.boolean().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.type) {
          conditions.push(eq(emailTemplates.type, input.type))
        }

        if (input.active !== undefined) {
          conditions.push(eq(emailTemplates.isActive, input.active))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const templates = await ctx.db.query.emailTemplates.findMany({
          where: whereClause,
          orderBy: desc(emailTemplates.updatedAt),
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
          templates: templates.map((template) => ({
            ...template,
            variables: template.variables ? JSON.parse(template.variables) : []
          }))
        }
      } catch (error) {
        logger.error('Error fetching email templates', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email templates'
        })
      }
    }),

  getAllNotifications: adminProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        unreadOnly: z.boolean().default(false),
        includeExpired: z.boolean().default(false),
        type: z.enum(['system', 'user_action', 'content', 'security', 'marketing', 'reminder']).optional(),
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const now = new Date()
        const conditions = [] as any[]

        if (input.userId) {
          conditions.push(eq(notifications.userId, input.userId))
        }

        if (!input.includeExpired) {
          conditions.push(or(isNull(notifications.expiresAt), gte(notifications.expiresAt, now)))
        }

        if (input.unreadOnly) {
          conditions.push(eq(notifications.read, false))
        }

        if (input.type) {
          conditions.push(eq(notifications.type, input.type))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const rows = await ctx.db.query.notifications.findMany({
          where: whereClause,
          orderBy: desc(notifications.createdAt),
          limit: input.limit,
          offset: input.offset
        })

        const totalCount = await ctx.db.query.notifications.findMany({
          where: whereClause,
          columns: { id: true }
        })

        return {
          notifications: rows.map((notification) => ({
            ...notification,
            data: parseJson(notification.data),
            severity: getNotificationSeverity(notification.type)
          })),
          total: totalCount.length,
          hasMore: totalCount.length > input.offset + input.limit
        }
      } catch (error) {
        logger.error('Error fetching all notifications', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications'
        })
      }
    }),

  createEmailTemplate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum([
          'welcome',
          'password_reset',
          'email_verification',
          'newsletter',
          'announcement',
          'notification',
          'marketing',
          'transactional'
        ]),
        subject: z.string().min(1),
        htmlContent: z.string().min(1),
        textContent: z.string().optional(),
        variables: z.array(z.string()).default([])
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const templateId = randomBytes(16).toString('hex')

        await ctx.db.insert(emailTemplates).values({
          id: templateId,
          name: input.name,
          type: input.type,
          subject: input.subject,
          htmlContent: input.htmlContent,
          textContent: input.textContent,
          variables: JSON.stringify(input.variables),
          createdBy: ctx.session.user.id
        })

        // Log audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'bulk_operation',
          '',
          {
            action: 'bulk_notification_send',
            recipientCount: 0,
            notificationType: input.type
          },
          ipAddress,
          userAgent
        )

        return { success: true, templateId }
      } catch (error) {
        logger.error('Error creating email template', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create email template'
        })
      }
    }),

  updateEmailTemplate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        subject: z.string().min(1).optional(),
        htmlContent: z.string().min(1).optional(),
        textContent: z.string().optional(),
        variables: z.array(z.string()).optional(),
        isActive: z.boolean().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const { id, ...updateData } = input

        // Filter out undefined values
        const filteredUpdateData: any = {}
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined) {
            if (key === 'variables') {
              filteredUpdateData[key] = JSON.stringify(value)
            } else {
              filteredUpdateData[key] = value
            }
          }
        })

        filteredUpdateData.updatedAt = new Date()

        await ctx.db.update(emailTemplates).set(filteredUpdateData).where(eq(emailTemplates.id, id))

        // Log audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'bulk_operation',
          '',
          {
            action: 'bulk_notification_send',
            recipientCount: 0,
            notificationType: ''
          },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error updating email template', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update email template'
        })
      }
    }),

  // Email Campaigns
  getEmailCampaigns: adminProcedure
    .input(
      z.object({
        status: z
          .enum(['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed'])
          .optional(),
        limit: z.number().min(1).max(100).default(20)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.status) {
          conditions.push(eq(emailCampaigns.status, input.status))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const campaigns = await ctx.db.query.emailCampaigns.findMany({
          where: whereClause,
          orderBy: desc(emailCampaigns.createdAt),
          limit: input.limit,
          with: {
            template: {
              columns: {
                id: true,
                name: true,
                type: true
              }
            },
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
          campaigns: campaigns.map((campaign) => ({
            ...campaign,
            targetAudience: campaign.targetAudience ? JSON.parse(campaign.targetAudience) : null
          }))
        }
      } catch (error) {
        logger.error('Error fetching email campaigns', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email campaigns'
        })
      }
    }),

  createEmailCampaign: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        subject: z.string().min(1),
        templateId: z.string().optional(),
        htmlContent: z.string().optional(),
        textContent: z.string().optional(),
        targetAudience: z
          .object({
            userRoles: z.array(z.string()).optional(),
            userIds: z.array(z.string()).optional(),
            emailList: z.array(z.string()).optional()
          })
          .optional(),
        scheduledAt: z.date().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const campaignId = randomBytes(16).toString('hex')

        // Calculate total recipients based on target audience
        let totalRecipients = 0
        if (input.targetAudience) {
          if (input.targetAudience.userIds) {
            totalRecipients += input.targetAudience.userIds.length
          }
          if (input.targetAudience.emailList) {
            totalRecipients += input.targetAudience.emailList.length
          }
          if (input.targetAudience.userRoles) {
            // Count users with specified roles
            const roleUsers = await ctx.db.query.users.findMany({
              where: inArray(
                users.role,
                input.targetAudience.userRoles.filter((role) => role === 'user' || role === 'admin')
              ),
              columns: { id: true }
            })
            totalRecipients += roleUsers.length
          }
        }

        await ctx.db.insert(emailCampaigns).values({
          id: campaignId,
          name: input.name,
          subject: input.subject,
          templateId: input.templateId,
          htmlContent: input.htmlContent,
          textContent: input.textContent,
          targetAudience: input.targetAudience ? JSON.stringify(input.targetAudience) : null,
          totalRecipients,
          scheduledAt: input.scheduledAt,
          status: input.scheduledAt ? 'scheduled' : 'draft',
          createdBy: ctx.session.user.id
        })

        // Log audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'bulk_operation',
          '',
          {
            action: 'bulk_notification_send',
            recipientCount: totalRecipients,
            notificationType: ''
          },
          ipAddress,
          userAgent
        )

        return { success: true, campaignId }
      } catch (error) {
        logger.error('Error creating email campaign', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create email campaign'
        })
      }
    }),

  sendEmailCampaign: adminProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // Get campaign details
        const campaign = await ctx.db.query.emailCampaigns.findFirst({
          where: eq(emailCampaigns.id, input.campaignId),
          with: {
            template: true
          }
        })

        if (!campaign) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Campaign not found'
          })
        }

        if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Campaign cannot be sent in current status'
          })
        }

        // Update campaign status to sending
        await ctx.db
          .update(emailCampaigns)
          .set({
            status: 'sending',
            startedAt: new Date()
          })
          .where(eq(emailCampaigns.id, input.campaignId))

        // In a real implementation, you would:
        // 1. Generate recipient list based on target audience
        // 2. Queue emails for sending (using a job queue like Bull/BullMQ)
        // 3. Send emails in batches to avoid rate limits
        // 4. Track delivery, opens, clicks, etc.

        // For now, we'll just mark it as sent
        setTimeout(async () => {
          await ctx.db
            .update(emailCampaigns)
            .set({
              status: 'sent',
              completedAt: new Date(),
              sentCount: campaign.totalRecipients,
              deliveredCount: campaign.totalRecipients
            })
            .where(eq(emailCampaigns.id, input.campaignId))
        }, 1000)

        // Log audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'bulk_operation',
          '',
          {
            action: 'bulk_notification_send',
            recipientCount: campaign.totalRecipients,
            notificationType: ''
          },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        logger.error('Error sending email campaign', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email campaign'
        })
      }
    }),

  // Notifications
  getNotifications: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const now = new Date()
        const conditions = [
          eq(notifications.userId, ctx.session.user.id),
          or(isNull(notifications.expiresAt), gte(notifications.expiresAt, now))
        ]

        if (input.unreadOnly) {
          conditions.push(eq(notifications.read, false))
        }

        const userNotifications = await ctx.db.query.notifications.findMany({
          where: and(...conditions),
          orderBy: desc(notifications.createdAt),
          limit: input.limit,
          offset: input.offset
        })

        const totalCount = await ctx.db.query.notifications.findMany({
          where: and(...conditions),
          columns: { id: true }
        })

        return {
          notifications: userNotifications.map((notification) => ({
            ...notification,
            data: parseJson(notification.data),
            severity: getNotificationSeverity(notification.type)
          })),
          total: totalCount.length,
          hasMore: totalCount.length > input.offset + input.limit
        }
      } catch (error) {
        logger.error('Error fetching notifications', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications'
        })
      }
    }),

  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(notifications)
          .set({
            read: true,
            readAt: new Date()
          })
          .where(
            and(
              eq(notifications.id, input.notificationId),
              eq(notifications.userId, ctx.session.user.id)
            )
          )

        return { success: true }
      } catch (error) {
        logger.error('Error marking notification as read', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read'
        })
      }
    }),

  adminMarkNotificationRead: adminProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(notifications)
          .set({
            read: true,
            readAt: new Date()
          })
          .where(eq(notifications.id, input.notificationId))

        return { success: true }
      } catch (error) {
        logger.error('Error marking notification as read (admin)', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read'
        })
      }
    }),

  markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.db
        .update(notifications)
        .set({
          read: true,
          readAt: new Date()
        })
        .where(and(eq(notifications.userId, ctx.session.user.id), eq(notifications.read, false)))

      return { success: true }
    } catch (error) {
      logger.error('Error marking all notifications as read', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark all notifications as read'
      })
    }
  }),

  // Create notification (admin only)
  createNotification: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.enum(['system', 'user_action', 'content', 'security', 'marketing', 'reminder']).default('system'),
        userId: z.string().optional(),
        expiresAt: z.date().optional(),
        actionUrl: z.string().url().optional(),
        data: z.record(z.string(), z.unknown()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const notificationId = randomBytes(16).toString('hex')

        const dataJson = input.data ? JSON.stringify(input.data) : null

        // If userId is provided, send to specific user, otherwise send to all users
        if (input.userId) {
          await ctx.db.insert(notifications).values({
            id: notificationId,
            userId: input.userId,
            title: input.title,
            message: input.content,
            type: input.type,
            data: dataJson,
            actionUrl: input.actionUrl,
            expiresAt: input.expiresAt
          })
        } else {
          // Send to all users - get all user IDs
          const allUsers = await ctx.db.query.users.findMany({
            columns: { id: true }
          })

          // Create notifications for eligible users
          const notificationsList = allUsers.map((user) => ({
            id: randomBytes(16).toString('hex'),
            userId: user.id,
            title: input.title,
            message: input.content,
            type: input.type,
            data: dataJson,
            actionUrl: input.actionUrl,
            expiresAt: input.expiresAt
          }))

          if (notificationsList.length > 0) {
            await ctx.db.insert(notifications).values(notificationsList)
          }
        }

        // Log audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'bulk_operation',
          notificationId,
          {
            action: 'notification_created',
            title: input.title,
            type: input.type,
            targetUser: input.userId || 'all_users'
          },
          getIpFromHeaders(ctx.headers),
          getUserAgentFromHeaders(ctx.headers)
        )

        return { success: true, notificationId }
      } catch (error) {
        logger.error('Error creating notification', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create notification'
        })
      }
    }),

  // Communication Stats
  getCommunicationStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Email campaign stats
      const totalCampaigns = await ctx.db.query.emailCampaigns.findMany({
        columns: { id: true, status: true, sentCount: true, deliveredCount: true }
      })

      const recentCampaigns = totalCampaigns.filter(
        (c) => c.status === 'sent' || c.status === 'sending'
      )

      // Announcement stats
      const totalAnnouncements = await ctx.db.query.announcements.findMany({
        where: gte(announcements.createdAt, thirtyDaysAgo),
        columns: { id: true, type: true }
      })

      const activeAnnouncements = await ctx.db.query.announcements.findMany({
        where: eq(announcements.isActive, true),
        columns: { id: true }
      })

      // Notification stats
      const totalNotifications = await ctx.db.query.notifications.findMany({
        where: gte(notifications.createdAt, thirtyDaysAgo),
        columns: { id: true, read: true }
      })

      return {
        campaigns: {
          total: totalCampaigns.length,
          sent: recentCampaigns.length,
          totalEmailsSent: totalCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
          totalEmailsDelivered: totalCampaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0)
        },
        announcements: {
          total: totalAnnouncements.length,
          active: activeAnnouncements.length,
          byType: {
            info: totalAnnouncements.filter((a) => a.type === 'info').length,
            warning: totalAnnouncements.filter((a) => a.type === 'warning').length,
            success: totalAnnouncements.filter((a) => a.type === 'success').length,
            error: totalAnnouncements.filter((a) => a.type === 'error').length
          }
        },
        notifications: {
          total: totalNotifications.length,
          read: totalNotifications.filter((n) => n.read).length,
          unread: totalNotifications.filter((n) => !n.read).length
        }
      }
    } catch (error) {
      console.error('Error fetching communication stats:', error)
      return {
        campaigns: { total: 0, sent: 0, totalEmailsSent: 0, totalEmailsDelivered: 0 },
        announcements: {
          total: 0,
          active: 0,
          byType: { info: 0, warning: 0, success: 0, error: 0 }
        },
        notifications: { total: 0, read: 0, unread: 0 }
      }
    }
  })
})
