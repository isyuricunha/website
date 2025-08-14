import { TRPCError } from '@trpc/server'
import { 
  emailTemplates,
  emailCampaigns,
  emailCampaignRecipients,
  emailSubscriptions
} from '@tszhong0411/db'
import { and, desc, eq, gte, inArray, or } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { Resend } from 'resend'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { adminProcedure, protectedProcedure, createTRPCRouter } from '../trpc'

const resend = new Resend(process.env.RESEND_API_KEY)
const auditLogger = new AuditLogger()

export const emailManagementRouter = createTRPCRouter({
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
          orderBy: desc(emailTemplates.createdAt)
        })

        return { templates }
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
      subject: z.string().min(1),
      content: z.string().min(1),
      type: z.enum(['welcome', 'password_reset', 'email_verification', 'newsletter', 'announcement', 'notification', 'marketing', 'transactional']),
      variables: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const templateId = randomBytes(16).toString('hex')

        await ctx.db.insert(emailTemplates).values({
          id: templateId,
          name: input.name,
          subject: input.subject,
          content: input.content,
          type: input.type,
          variables: input.variables ? JSON.stringify(input.variables) : null,
          createdBy: ctx.session.user.id
        })

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_template',
          templateId,
          {
            action: 'template_created',
            name: input.name,
            type: input.type
          }
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

  // Email Campaigns
  getEmailCampaigns: adminProcedure
    .input(z.object({
      status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
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
          offset: input.offset,
          with: {
            template: true,
            recipients: true
          }
        })

        return { campaigns }
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
      templateId: z.string(),
      recipientList: z.array(z.string()).min(1),
      scheduledFor: z.date().optional(),
      variables: z.record(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const campaignId = randomBytes(16).toString('hex')

        await ctx.db.insert(emailCampaigns).values({
          id: campaignId,
          name: input.name,
          templateId: input.templateId,
          scheduledFor: input.scheduledFor,
          variables: input.variables ? JSON.stringify(input.variables) : null,
          createdBy: ctx.session.user.id
        })

        // Add recipients
        const recipientRecords = input.recipientList.map(email => ({
          id: randomBytes(16).toString('hex'),
          campaignId,
          email,
          status: 'pending' as const
        }))

        await ctx.db.insert(emailCampaignRecipients).values(recipientRecords)

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_campaign',
          campaignId,
          {
            action: 'campaign_created',
            name: input.name,
            recipientCount: input.recipientList.length
          }
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

  // Send email campaign
  sendEmailCampaign: adminProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get campaign details
        const campaign = await ctx.db.query.emailCampaigns.findFirst({
          where: eq(emailCampaigns.id, input.campaignId),
          with: {
            template: true,
            recipients: {
              where: eq(emailCampaignRecipients.status, 'pending')
            }
          }
        })

        if (!campaign) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Campaign not found'
          })
        }

        if (!campaign.template) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Campaign template not found'
          })
        }

        // Update campaign status to sending
        await ctx.db
          .update(emailCampaigns)
          .set({ status: 'sending', sentAt: new Date() })
          .where(eq(emailCampaigns.id, input.campaignId))

        let successCount = 0
        let failureCount = 0

        // Send emails to recipients
        for (const recipient of campaign.recipients) {
          try {
            await resend.emails.send({
              from: 'noreply@yourdomain.com',
              to: recipient.email,
              subject: campaign.template.subject,
              html: campaign.template.content
            })

            // Update recipient status
            await ctx.db
              .update(emailCampaignRecipients)
              .set({ status: 'sent', sentAt: new Date() })
              .where(eq(emailCampaignRecipients.id, recipient.id))

            successCount++
          } catch (error) {
            console.error(`Failed to send email to ${recipient.email}:`, error)
            
            // Update recipient status
            await ctx.db
              .update(emailCampaignRecipients)
              .set({ 
                status: 'failed', 
                error: error instanceof Error ? error.message : 'Unknown error'
              })
              .where(eq(emailCampaignRecipients.id, recipient.id))

            failureCount++
          }
        }

        // Update campaign status
        await ctx.db
          .update(emailCampaigns)
          .set({ 
            status: 'sent',
            sentCount: successCount,
            failedCount: failureCount
          })
          .where(eq(emailCampaigns.id, input.campaignId))

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'email_campaign',
          input.campaignId,
          {
            action: 'campaign_sent',
            successCount,
            failureCount
          }
        )

        return { success: true, successCount, failureCount }
      } catch (error) {
        console.error('Error sending email campaign:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email campaign'
        })
      }
    }),

  // Email Subscriptions
  getEmailSubscriptions: adminProcedure
    .input(z.object({
      active: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.active !== undefined) {
          conditions.push(eq(emailSubscriptions.isActive, input.active))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const subscriptions = await ctx.db.query.emailSubscriptions.findMany({
          where: whereClause,
          orderBy: desc(emailSubscriptions.createdAt),
          limit: input.limit,
          offset: input.offset
        })

        return { subscriptions }
      } catch (error) {
        console.error('Error fetching email subscriptions:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email subscriptions'
        })
      }
    }),

  // Bulk email operations
  sendBulkEmail: adminProcedure
    .input(z.object({
      subject: z.string().min(1),
      content: z.string().min(1),
      recipients: z.array(z.string().email()).min(1).max(100),
      templateId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        let emailContent = input.content
        let emailSubject = input.subject

        // If template is provided, use it
        if (input.templateId) {
          const template = await ctx.db.query.emailTemplates.findFirst({
            where: eq(emailTemplates.id, input.templateId)
          })

          if (template) {
            emailContent = template.content
            emailSubject = template.subject
          }
        }

        let successCount = 0
        let failureCount = 0
        const results = []

        // Send emails
        for (const email of input.recipients) {
          try {
            await resend.emails.send({
              from: 'noreply@yourdomain.com',
              to: email,
              subject: emailSubject,
              html: emailContent
            })

            results.push({ email, status: 'sent' })
            successCount++
          } catch (error) {
            console.error(`Failed to send email to ${email}:`, error)
            results.push({ 
              email, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            })
            failureCount++
          }
        }

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'content_management',
          'bulk_email',
          `bulk-${Date.now()}`,
          {
            action: 'bulk_email_sent',
            recipientCount: input.recipients.length,
            successCount,
            failureCount
          }
        )

        return { 
          success: true, 
          successCount, 
          failureCount, 
          results 
        }
      } catch (error) {
        console.error('Error sending bulk email:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send bulk email'
        })
      }
    }),

  // Get email analytics
  getEmailAnalytics: adminProcedure
    .input(z.object({
      dateRange: z.object({
        start: z.date(),
        end: z.date()
      }).optional(),
      campaignId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.campaignId) {
          conditions.push(eq(emailCampaigns.id, input.campaignId))
        }

        if (input.dateRange) {
          conditions.push(gte(emailCampaigns.createdAt, input.dateRange.start))
          conditions.push(gte(input.dateRange.end, emailCampaigns.createdAt))
        }

        const campaigns = await ctx.db.query.emailCampaigns.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          with: {
            recipients: true
          }
        })

        const analytics = {
          totalCampaigns: campaigns.length,
          totalEmailsSent: campaigns.reduce((sum, campaign) => sum + (campaign.sentCount || 0), 0),
          totalEmailsFailed: campaigns.reduce((sum, campaign) => sum + (campaign.failedCount || 0), 0),
          averageSuccessRate: 0,
          campaignStats: campaigns.map(campaign => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            sentCount: campaign.sentCount || 0,
            failedCount: campaign.failedCount || 0,
            successRate: campaign.sentCount && (campaign.sentCount + (campaign.failedCount || 0)) > 0 
              ? (campaign.sentCount / (campaign.sentCount + (campaign.failedCount || 0))) * 100 
              : 0
          }))
        }

        // Calculate average success rate
        const totalEmails = analytics.totalEmailsSent + analytics.totalEmailsFailed
        analytics.averageSuccessRate = totalEmails > 0 
          ? (analytics.totalEmailsSent / totalEmails) * 100 
          : 0

        return analytics
      } catch (error) {
        console.error('Error fetching email analytics:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email analytics'
        })
      }
    })
})
