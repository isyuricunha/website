import { TRPCError } from '@trpc/server'
import { 
  emailTemplates,
  emailCampaigns,
  emailCampaignRecipients,
  announcements,
  announcementInteractions,
  notifications,
  notificationPreferences,
  emailSubscriptions
} from '@tszhong0411/db'
import { and, desc, eq, gte, inArray, or } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { Resend } from 'resend'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { adminProcedure, protectedProcedure, createTRPCRouter } from '../trpc'

const resend = new Resend(process.env.RESEND_API_KEY)

export const communicationRouter = createTRPCRouter({
  // Email Templates
  getEmailTemplates: adminProcedure
    .input(z.object({
      type: z.enum(['welcome', 'password_reset', 'email_verification', 'newsletter', 'announcement', 'notification', 'marketing', 'transactional']).optional(),
      active: z.boolean().optional()
    }))
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
          templates: templates.map(template => ({
            ...template,
            variables: template.variables ? JSON.parse(template.variables) : []
          }))
        }
      } catch (error) {
        console.error('Error fetching email templates:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email templates'
        })
      }
    }),

  createEmailTemplate: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(['welcome', 'password_reset', 'email_verification', 'newsletter', 'announcement', 'notification', 'marketing', 'transactional']),
      subject: z.string().min(1),
      htmlContent: z.string().min(1),
      textContent: z.string().optional(),
      variables: z.array(z.string()).default([])
    }))
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
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'email_template',
          templateId,
          {
            action: 'template_created',
            name: input.name,
            type: input.type
          },
          ipAddress,
          userAgent
        )

        return { success: true, templateId }
      } catch (error) {
        console.error('Error creating email template:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create email template'
        })
      }
    }),

  updateEmailTemplate: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      subject: z.string().min(1).optional(),
      htmlContent: z.string().min(1).optional(),
      textContent: z.string().optional(),
      variables: z.array(z.string()).optional(),
      isActive: z.boolean().optional()
    }))
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

        await ctx.db
          .update(emailTemplates)
          .set(filteredUpdateData)
          .where(eq(emailTemplates.id, id))

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'email_template',
          id,
          {
            action: 'template_updated',
            updatedFields: Object.keys(filteredUpdateData)
          },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        console.error('Error updating email template:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update email template'
        })
      }
    }),

  // Email Campaigns
  getEmailCampaigns: adminProcedure
    .input(z.object({
      status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed']).optional(),
      limit: z.number().min(1).max(100).default(20)
    }))
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
          campaigns: campaigns.map(campaign => ({
            ...campaign,
            targetAudience: campaign.targetAudience ? JSON.parse(campaign.targetAudience) : null
          }))
        }
      } catch (error) {
        console.error('Error fetching email campaigns:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email campaigns'
        })
      }
    }),

  createEmailCampaign: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      templateId: z.string().optional(),
      htmlContent: z.string().optional(),
      textContent: z.string().optional(),
      targetAudience: z.object({
        userRoles: z.array(z.string()).optional(),
        userIds: z.array(z.string()).optional(),
        emailList: z.array(z.string()).optional()
      }).optional(),
      scheduledAt: z.date().optional()
    }))
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
              where: inArray(ctx.db.query.users.role, input.targetAudience.userRoles),
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
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'email_campaign',
          campaignId,
          {
            action: 'campaign_created',
            name: input.name,
            totalRecipients
          },
          ipAddress,
          userAgent
        )

        return { success: true, campaignId }
      } catch (error) {
        console.error('Error creating email campaign:', error)
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
        // 1. Generate recipient list based on targetAudience
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
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'bulk_operation',
          'email_campaign',
          input.campaignId,
          {
            action: 'campaign_sent',
            totalRecipients: campaign.totalRecipients
          },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        console.error('Error sending email campaign:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email campaign'
        })
      }
    }),

  // Announcements
  getAnnouncements: protectedProcedure
    .input(z.object({
      active: z.boolean().optional(),
      adminView: z.boolean().default(false)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []
        
        if (input.active !== undefined) {
          conditions.push(eq(announcements.isActive, input.active))
        }

        // For non-admin users, only show current announcements
        if (!input.adminView && ctx.session.user.role !== 'admin') {
          const now = new Date()
          conditions.push(
            or(
              eq(announcements.startDate, null),
              gte(now, announcements.startDate)
            )
          )
          conditions.push(
            or(
              eq(announcements.endDate, null),
              gte(announcements.endDate, now)
            )
          )
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const announcementList = await ctx.db.query.announcements.findMany({
          where: whereClause,
          orderBy: [desc(announcements.priority), desc(announcements.createdAt)],
          with: input.adminView ? {
            createdByUser: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          } : {}
        })

        // Get user interactions for non-admin view
        let userInteractions: any = {}
        if (!input.adminView) {
          const interactions = await ctx.db.query.announcementInteractions.findMany({
            where: and(
              eq(announcementInteractions.userId, ctx.session.user.id),
              inArray(announcementInteractions.announcementId, announcementList.map(a => a.id))
            )
          })
          
          userInteractions = interactions.reduce((acc, interaction) => {
            acc[interaction.announcementId] = interaction
            return acc
          }, {} as any)
        }

        return {
          announcements: announcementList.map(announcement => ({
            ...announcement,
            targetAudience: announcement.targetAudience ? JSON.parse(announcement.targetAudience) : null,
            userInteraction: userInteractions[announcement.id] || null
          }))
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch announcements'
        })
      }
    }),

  createAnnouncement: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      type: z.enum(['info', 'warning', 'success', 'error', 'maintenance', 'feature', 'update']).default('info'),
      priority: z.number().min(0).max(10).default(0),
      isDismissible: z.boolean().default(true),
      targetAudience: z.object({
        userRoles: z.array(z.string()).optional(),
        userIds: z.array(z.string()).optional()
      }).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const announcementId = randomBytes(16).toString('hex')

        await ctx.db.insert(announcements).values({
          id: announcementId,
          title: input.title,
          content: input.content,
          type: input.type,
          priority: input.priority,
          isDismissible: input.isDismissible,
          targetAudience: input.targetAudience ? JSON.stringify(input.targetAudience) : null,
          startDate: input.startDate,
          endDate: input.endDate,
          createdBy: ctx.session.user.id
        })

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'announcement',
          announcementId,
          {
            action: 'announcement_created',
            title: input.title,
            type: input.type
          },
          ipAddress,
          userAgent
        )

        return { success: true, announcementId }
      } catch (error) {
        console.error('Error creating announcement:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create announcement'
        })
      }
    }),

  dismissAnnouncement: protectedProcedure
    .input(z.object({ announcementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if interaction already exists
        const existing = await ctx.db.query.announcementInteractions.findFirst({
          where: and(
            eq(announcementInteractions.announcementId, input.announcementId),
            eq(announcementInteractions.userId, ctx.session.user.id)
          )
        })

        if (existing) {
          // Update existing interaction
          await ctx.db
            .update(announcementInteractions)
            .set({
              dismissed: true,
              dismissedAt: new Date()
            })
            .where(eq(announcementInteractions.id, existing.id))
        } else {
          // Create new interaction
          const interactionId = randomBytes(16).toString('hex')
          await ctx.db.insert(announcementInteractions).values({
            id: interactionId,
            announcementId: input.announcementId,
            userId: ctx.session.user.id,
            viewed: true,
            dismissed: true,
            viewedAt: new Date(),
            dismissedAt: new Date()
          })
        }

        return { success: true }
      } catch (error) {
        console.error('Error dismissing announcement:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to dismiss announcement'
        })
      }
    }),

  // Notifications
  getNotifications: protectedProcedure
    .input(z.object({
      unreadOnly: z.boolean().default(false),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = [eq(notifications.userId, ctx.session.user.id)]
        
        if (input.unreadOnly) {
          conditions.push(eq(notifications.read, false))
        }

        // Filter out expired notifications
        const now = new Date()
        conditions.push(
          or(
            eq(notifications.expiresAt, null),
            gte(notifications.expiresAt, now)
          )
        )

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
          notifications: userNotifications.map(notification => ({
            ...notification,
            data: notification.data ? JSON.parse(notification.data) : null
          })),
          total: totalCount.length,
          hasMore: totalCount.length > input.offset + input.limit
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
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
          .where(and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.session.user.id)
          ))

        return { success: true }
      } catch (error) {
        console.error('Error marking notification as read:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read'
        })
      }
    }),

  markAllNotificationsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await ctx.db
          .update(notifications)
          .set({
            read: true,
            readAt: new Date()
          })
          .where(and(
            eq(notifications.userId, ctx.session.user.id),
            eq(notifications.read, false)
          ))

        return { success: true }
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark all notifications as read'
        })
      }
    }),

  // Communication Stats
  getCommunicationStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Email campaign stats
        const totalCampaigns = await ctx.db.query.emailCampaigns.findMany({
          columns: { id: true, status: true, sentCount: true, deliveredCount: true }
        })

        const recentCampaigns = totalCampaigns.filter(c => 
          c.status === 'sent' || c.status === 'sending'
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
              info: totalAnnouncements.filter(a => a.type === 'info').length,
              warning: totalAnnouncements.filter(a => a.type === 'warning').length,
              success: totalAnnouncements.filter(a => a.type === 'success').length,
              error: totalAnnouncements.filter(a => a.type === 'error').length
            }
          },
          notifications: {
            total: totalNotifications.length,
            read: totalNotifications.filter(n => n.read).length,
            unread: totalNotifications.filter(n => !n.read).length
          }
        }
      } catch (error) {
        console.error('Error fetching communication stats:', error)
        return {
          campaigns: { total: 0, sent: 0, totalEmailsSent: 0, totalEmailsDelivered: 0 },
          announcements: { total: 0, active: 0, byType: { info: 0, warning: 0, success: 0, error: 0 } },
          notifications: { total: 0, read: 0, unread: 0 }
        }
      }
    })
})
