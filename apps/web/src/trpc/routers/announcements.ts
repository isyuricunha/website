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
import { aiService } from '@/lib/ai/ai-service'
import { logger } from '@/lib/logger'
import { adminProcedure, publicProcedure, createTRPCRouter } from '../trpc'

const is_foreign_key_violation = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false
  const maybe = error as { code?: unknown; cause?: unknown }
  if (maybe.code === '23503') return true
  if (maybe.cause && typeof maybe.cause === 'object') {
    const cause = maybe.cause as { code?: unknown }
    return cause.code === '23503'
  }
  return false
}

export const announcementsRouter = createTRPCRouter({
  translateAnnouncement: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        fromLang: z.literal('en').default('en'),
        toLang: z.literal('pt').default('pt'),
        provider: z.enum(['auto', 'hf', 'hf_local', 'gemini', 'groq', 'ollama']).default('auto'),
        model: z.string().min(1).optional()
      })
    )
    .mutation(async ({ input }) => {
      const available_providers = aiService.getAvailableProviders()

      if (available_providers.length === 0) {
        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message: 'No AI providers are currently available.'
        })
      }

      const requested_provider = input.provider === 'auto' ? undefined : input.provider
      const default_provider = available_providers[0]
      const primary_provider =
        requested_provider && available_providers.includes(requested_provider)
          ? requested_provider
          : default_provider

      const provider_candidates = (() => {
        if (!primary_provider) return [] as typeof available_providers

        if (requested_provider && requested_provider !== primary_provider) {
          return [primary_provider, ...available_providers.filter((p) => p !== primary_provider)]
        }

        if (requested_provider) {
          return [requested_provider, ...available_providers.filter((p) => p !== requested_provider)]
        }

        return available_providers
      })()

      const response_schema = z.object({
        title: z.string().min(1),
        content: z.string().min(1)
      })

      const prompt = `Translate this announcement from English to Brazilian Portuguese.

Return ONLY valid JSON (no markdown, no code fences) with exactly these keys:
- title
- content

TITLE:
${input.title}

CONTENT:
${input.content}
`

      const context = {
        currentPage: '/admin/announcements',
        locale: input.toLang
      }

      let last_error: unknown = null

      for (const candidate of provider_candidates) {
        try {
          const raw = await aiService.generateResponse(prompt, context, {
            provider: candidate,
            model: input.model,
            temperature: 0.2,
            maxTokens: 512
          })

          const json = (() => {
            try {
              return JSON.parse(raw)
            } catch {
              const match = raw.match(/\{[\s\S]*\}/)
              if (!match) throw new Error('AI response is not valid JSON')
              return JSON.parse(match[0])
            }
          })()

          const parsed = response_schema.parse(json)

          return {
            titlePt: parsed.title.trim(),
            contentPt: parsed.content.trim(),
            provider: candidate
          }
        } catch (error) {
          last_error = error
        }
      }

      throw last_error instanceof Error ? last_error : new Error('AI provider failed')
    }),

  // Get announcements (public endpoint for homepage banners)
  getAnnouncements: publicProcedure
    .input(
      z.object({
        active: z.boolean().optional(),
        adminView: z.boolean().default(false),
        locale: z.string().min(2).max(10).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const isAdmin = ctx.session?.user?.role === 'admin'
        const adminView = input.adminView && isAdmin
        const locale = input.locale ?? 'en'
        const should_use_pt = locale.toLowerCase().startsWith('pt')

        const isRecord = (value: unknown): value is Record<string, unknown> => {
          return typeof value === 'object' && value !== null
        }

        const getStringArray = (value: unknown, key: string): string[] | null => {
          if (!isRecord(value)) return null
          const raw = value[key]
          if (!Array.isArray(raw)) return null
          if (!raw.every((item) => typeof item === 'string')) return null
          return raw
        }

        const parseTargetAudience = (raw: string) => {
          try {
            return JSON.parse(raw)
          } catch {
            return null
          }
        }

        const conditions = []

        if (input.active !== undefined) {
          conditions.push(eq(announcements.isActive, input.active))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const announcementList = await ctx.db.query.announcements.findMany({
          where: whereClause,
          orderBy: [desc(announcements.priority), desc(announcements.createdAt)]
        })

        let visibleAnnouncements = announcementList

        // Apply active filtering defensively (useful in tests and prevents relying solely on DB where clause)
        if (input.active !== undefined) {
          visibleAnnouncements = visibleAnnouncements.filter(
            (announcement) => announcement.isActive === input.active
          )
        }

        // Filter announcements based on user targeting
        const filteredAnnouncements = visibleAnnouncements.filter((announcement) => {
          if (!announcement.targetAudience || adminView) {
            return true // Show all if no targeting or admin view
          }

          // If user is not authenticated, only show announcements with no specific targeting
          if (!ctx.session?.user) {
            return true // Show to unauthenticated users if no specific targeting
          }

          const targetAudience = parseTargetAudience(announcement.targetAudience)
          if (!targetAudience) {
            return true
          }

          const userRole = ctx.session.user.role

          const roleTargets =
            getStringArray(targetAudience, 'userRoles') ?? getStringArray(targetAudience, 'roles')

          const userTargets = getStringArray(targetAudience, 'userIds')

          // If explicit targets exist, user must match at least one
          if (roleTargets || userTargets) {
            const matchesRole = roleTargets ? roleTargets.includes(userRole) : false
            const matchesUser = userTargets ? userTargets.includes(ctx.session.user.id) : false
            return matchesRole || matchesUser
          }

          // If no specific targeting, show to all
          return true
        })

        // Get user interactions for non-admin view (only for authenticated users)
        let userInteractions: any = {}
        if (!adminView && ctx.session?.user) {
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
            title:
              !adminView && should_use_pt
                ? (announcement.titlePt ?? announcement.title)
                : announcement.title,
            content:
              !adminView && should_use_pt
                ? (announcement.contentPt ?? announcement.content)
                : announcement.content,
            targetAudience: announcement.targetAudience
              ? (() => {
                const parsed = parseTargetAudience(announcement.targetAudience)
                if (!parsed) return null
                if (!isRecord(parsed)) return null
                const userRoles =
                  getStringArray(parsed, 'userRoles') ??
                  getStringArray(parsed, 'roles') ??
                  undefined
                return {
                  ...parsed,
                  userRoles
                }
              })()
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
        titlePt: z.string().min(1).optional(),
        contentPt: z.string().min(1).optional(),
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
          .optional()
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
          titlePt: input.titlePt,
          contentPt: input.contentPt,
          type: input.type,
          priority: input.priority,
          isDismissible: input.isDismissible,
          isActive: true, // Explicitly set new announcements as active
          targetAudience: input.targetAudience ? JSON.stringify(input.targetAudience) : null,
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

  markAnnouncementViewed: publicProcedure
    .input(z.object({ announcementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user) {
          return { success: true }
        }

        const existing = await ctx.db.query.announcementInteractions.findFirst({
          where: and(
            eq(announcementInteractions.announcementId, input.announcementId),
            eq(announcementInteractions.userId, ctx.session.user.id)
          )
        })

        if (existing) {
          if (existing.viewed) {
            return { success: true }
          }

          await ctx.db
            .update(announcementInteractions)
            .set({
              viewed: true,
              viewedAt: new Date()
            })
            .where(eq(announcementInteractions.id, existing.id))

          return { success: true }
        }

        const interactionId = randomBytes(16).toString('hex')
        await ctx.db.insert(announcementInteractions).values({
          id: interactionId,
          announcementId: input.announcementId,
          userId: ctx.session.user.id,
          viewed: true,
          dismissed: false,
          viewedAt: new Date()
        })

        return { success: true }
      } catch (error) {
        if (is_foreign_key_violation(error)) {
          logger.warn('Skipping announcement viewed update due to missing announcement', {
            announcementId: input.announcementId,
            userId: ctx.session?.user?.id
          })
          return { success: true }
        }
        logger.error('Error marking announcement viewed', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark announcement viewed'
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
        if (is_foreign_key_violation(error)) {
          logger.warn('Skipping announcement dismissal due to missing announcement', {
            announcementId: input.announcementId,
            userId: ctx.session?.user?.id
          })
          return { success: true }
        }
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
        titlePt: z.string().min(1).optional(),
        contentPt: z.string().min(1).optional(),
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
          .optional()
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

        const totalViews = interactions.filter((i) => i.viewed).length
        const totalDismissals = interactions.filter((i) => i.dismissed).length

        const analytics = {
          totalViews,
          totalDismissals,
          dismissalRate: totalViews > 0 ? (totalDismissals / totalViews) * 100 : 0,
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

          if (interaction.viewed) {
            analytics.byAnnouncement[announcementId].views++
          }
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
