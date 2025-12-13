import { TRPCError } from '@trpc/server'
import {
  and,
  announcements,
  announcementInteractions,
  desc,
  eq,
  gte,
  lte,
  inArray
} from '@isyuricunha/db'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'
import { adminProcedure, publicProcedure, createTRPCRouter } from '../trpc'

export const announcementsRouter = createTRPCRouter({
  // Get announcements (public endpoint for homepage banners)
  getAnnouncements: publicProcedure
    .input(
      z.object({
        active: z.boolean().optional(),
        adminView: z.boolean().default(false)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.active !== undefined) {
          conditions.push(eq(announcements.isActive, input.active))
        }

        // No date filtering - if is_active is true, announcement should appear
        // Date fields (startDate/endDate) are kept for reference only

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const announcementList = await ctx.db.query.announcements.findMany({
          where: whereClause,
          orderBy: [desc(announcements.priority), desc(announcements.createdAt)]
        })

        // Filter announcements based on user targeting
        const filteredAnnouncements = announcementList.filter((announcement) => {
          if (!announcement.targetAudience || input.adminView) {
            return true // Show all if no targeting or admin view
          }

          // If user is not authenticated, only show announcements with no specific targeting
          if (!ctx.session?.user) {
            return true // Show to unauthenticated users if no specific targeting
          }

          try {
            const targetAudience = JSON.parse(announcement.targetAudience)
            const userRole = ctx.session.user.role

            // Check role-based targeting
            if (targetAudience.roles && Array.isArray(targetAudience.roles)) {
              return targetAudience.roles.includes(userRole)
            }

            // Check user-specific targeting
            if (targetAudience.userIds && Array.isArray(targetAudience.userIds)) {
              return targetAudience.userIds.includes(ctx.session.user.id)
            }

            // If no specific targeting, show to all
            return true
          } catch {
            // If JSON parsing fails, show to all users
            return true
          }
        })

        // Get user interactions for non-admin view (only for authenticated users)
        let userInteractions: any = {}
        if (!input.adminView && ctx.session?.user) {
          const interactions = await ctx.db.query.announcementInteractions.findMany({
            where: and(
              eq(announcementInteractions.userId, ctx.session.user.id),
              inArray(
                announcementInteractions.announcementId,
                filteredAnnouncements.map((a) => a.id)
              )
            )
          })

          userInteractions = interactions.reduce<any>((acc, interaction) => {
            acc[interaction.announcementId] = interaction
            return acc
          }, {})
        }

        return {
          announcements: filteredAnnouncements.map((announcement) => ({
            ...announcement,
            targetAudience: announcement.targetAudience
              ? JSON.parse(announcement.targetAudience)
              : null,
            userInteraction: userInteractions[announcement.id] || null
          }))
        }
      } catch (error) {
        logger.error('Error fetching announcements', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch announcements'
        })
      }
    }),

  // Create announcement (admin only)
  createAnnouncement: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z
          .enum(['info', 'warning', 'success', 'error', 'maintenance', 'feature', 'update'])
          .default('info'),
        priority: z.number().min(0).max(10).default(0),
        isDismissible: z.boolean().default(true),
        targetAudience: z
          .object({
            userRoles: z.array(z.string()).optional(),
            userIds: z.array(z.string()).optional()
          })
          .optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional()
      })
    )
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
          isActive: true, // Explicitly set new announcements as active
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
            type: input.type,
            priority: input.priority
          },
          ipAddress,
          userAgent
        )

        return { success: true, announcementId }
      } catch (error) {
        logger.error('Error creating announcement', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create announcement'
        })
      }
    }),

  // Dismiss announcement (works for both authenticated and guest users)
  dismissAnnouncement: publicProcedure
    .input(z.object({ announcementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // For authenticated users, store dismissal in database
        if (ctx.session?.user) {
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
        }
        // For guest users, dismissal is handled client-side via localStorage
        // No server-side action needed, just return success

        return { success: true }
      } catch (error) {
        logger.error('Error dismissing announcement', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to dismiss announcement'
        })
      }
    }),

  // Update announcement (admin only)
  updateAnnouncement: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        type: z
          .enum(['info', 'warning', 'success', 'error', 'maintenance', 'feature', 'update'])
          .optional(),
        priority: z.number().min(0).max(10).optional(),
        isDismissible: z.boolean().optional(),
        isActive: z.boolean().optional(),
        targetAudience: z
          .object({
            userRoles: z.array(z.string()).optional(),
            userIds: z.array(z.string()).optional()
          })
          .optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const { id, ...updateData } = input

        await ctx.db
          .update(announcements)
          .set({
            ...updateData,
            targetAudience: updateData.targetAudience
              ? JSON.stringify(updateData.targetAudience)
              : undefined,
            updatedAt: new Date()
          })
          .where(eq(announcements.id, id))

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'announcement',
          id,
          {
            action: 'announcement_updated',
            changes: updateData
          },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error updating announcement', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update announcement'
        })
      }
    }),

  // Delete announcement (admin only)
  deleteAnnouncement: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        await ctx.db.delete(announcements).where(eq(announcements.id, input.id))

        // Log audit trail
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'announcement',
          input.id,
          {
            action: 'announcement_deleted'
          },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error deleting announcement', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete announcement'
        })
      }
    }),

  // Get announcement analytics (admin only)
  getAnnouncementAnalytics: adminProcedure
    .input(
      z.object({
        announcementId: z.string().optional(),
        dateRange: z
          .object({
            start: z.date(),
            end: z.date()
          })
          .optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get announcement engagement stats
        const conditions = []

        if (input.announcementId) {
          conditions.push(eq(announcementInteractions.announcementId, input.announcementId))
        }

        if (input.dateRange) {
          conditions.push(gte(announcementInteractions.viewedAt, input.dateRange.start))
          conditions.push(lte(announcementInteractions.viewedAt, input.dateRange.end))
        }

        const interactions = await ctx.db.query.announcementInteractions.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          with: {
            announcement: true
          }
        })

        const analytics = {
          totalViews: interactions.length,
          totalDismissals: interactions.filter((i) => i.dismissed).length,
          dismissalRate:
            interactions.length > 0
              ? (interactions.filter((i) => i.dismissed).length / interactions.length) * 100
              : 0,
          byAnnouncement: {} as any
        }

        // Group by announcement
        interactions.forEach((interaction) => {
          const announcementId = interaction.announcementId
          if (!analytics.byAnnouncement[announcementId]) {
            analytics.byAnnouncement[announcementId] = {
              title: interaction.announcement?.title || 'Unknown',
              views: 0,
              dismissals: 0,
              dismissalRate: 0
            }
          }

          analytics.byAnnouncement[announcementId].views++
          if (interaction.dismissed) {
            analytics.byAnnouncement[announcementId].dismissals++
          }
        })

        // Calculate dismissal rates
        Object.keys(analytics.byAnnouncement).forEach((announcementId) => {
          const data = analytics.byAnnouncement[announcementId]
          data.dismissalRate = data.views > 0 ? (data.dismissals / data.views) * 100 : 0
        })

        return analytics
      } catch (error) {
        logger.error('Error fetching announcement analytics', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch announcement analytics'
        })
      }
    })
})
