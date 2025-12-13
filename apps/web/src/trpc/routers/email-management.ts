import { TRPCError } from '@trpc/server'
import { and, desc, emailSubscriptions, emailTemplates, eq } from '@tszhong0411/db'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger } from '@/lib/audit-logger'
import { adminProcedure, createTRPCRouter } from '../trpc'
import { logger } from '@/lib/logger'

// DEPRECATED: This router is being replaced by resendEmailRouter
// Only keeping basic template management for system emails
// All campaign management now handled by Resend's native APIs

export const emailManagementRouter = createTRPCRouter({
  // Email Templates (System emails only - newsletters/campaigns use Resend)
  getEmailTemplates: adminProcedure
    .input(
      z.object({
        type: z
          .enum(['welcome', 'password_reset', 'email_verification', 'notification'])
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
          orderBy: desc(emailTemplates.createdAt)
        })

        return { templates }
      } catch (error) {
        logger.error('Error fetching email templates', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email templates'
        })
      }
    }),

  // Create system email templates only (not marketing campaigns)
  createEmailTemplate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        subject: z.string().min(1),
        content: z.string().min(1),
        type: z.enum(['welcome', 'password_reset', 'email_verification', 'notification']),
        variables: z.array(z.string()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const templateId = randomBytes(16).toString('hex')

        await ctx.db.insert(emailTemplates).values({
          id: templateId,
          name: input.name,
          subject: input.subject,
          htmlContent: input.content,
          textContent: null,
          type: input.type,
          variables: input.variables ? JSON.stringify(input.variables) : null,
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
          }
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

  // Email Subscriptions (kept for local subscription tracking)
  getEmailSubscriptions: adminProcedure
    .input(
      z.object({
        active: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.active !== undefined) {
          conditions.push(eq(emailSubscriptions.isActive, input.active))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const subscriptions = await ctx.db.query.emailSubscriptions.findMany({
          where: whereClause,
          orderBy: desc(emailSubscriptions.subscribedAt),
          limit: input.limit,
          offset: input.offset,
          with: {
            user: {
              columns: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        })

        return { subscriptions }
      } catch (error) {
        logger.error('Error fetching email subscriptions', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email subscriptions'
        })
      }
    })
})
