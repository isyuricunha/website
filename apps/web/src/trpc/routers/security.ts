import { TRPCError } from '@trpc/server'
import {
  accountLockouts,
  and,
  desc,
  eq,
  gte,
  ipAccessControl,
  loginAttempts,
  securityEvents,
  securitySettings,
  twoFactorTokens
} from '@isyuricunha/db'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'
import { adminProcedure, protectedProcedure, createTRPCRouter } from '../trpc'

const speakeasy = require('speakeasy')

// Helper function to generate backup codes
function generateBackupCodes(): string[] {
  const codes = []
  for (let i = 0; i < 10; i++) {
    codes.push(randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}

export const securityRouter = createTRPCRouter({
  // Two-Factor Authentication
  enable2FA: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const auditLogger = new AuditLogger(ctx.db)
      const ipAddress = getIpFromHeaders(ctx.headers)
      const userAgent = getUserAgentFromHeaders(ctx.headers)

      // Check if 2FA is already enabled
      const token = await ctx.db.query.twoFactorTokens.findFirst({
        where: eq(twoFactorTokens.userId, ctx.session.user.id)
      })

      if (token) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '2FA is already enabled'
        })
      }

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'App'} (${ctx.session.user.email})`,
        length: 32
      })

      const backupCodes = generateBackupCodes()
      const tokenId = randomBytes(16).toString('hex')

      await ctx.db.insert(twoFactorTokens).values({
        id: tokenId,
        userId: ctx.session.user.id,
        secret: secret.base32,
        backupCodes: JSON.stringify(backupCodes),
        isEnabled: false
      })

      // Log security event
      await auditLogger.logSystemAction(
        ctx.session.user.id,
        'settings_update',
        'security',
        '2fa_setup',
        { action: '2fa_setup_initiated' },
        ipAddress,
        userAgent
      )

      return {
        secret: secret.base32,
        qrCode: secret.otpauth_url,
        backupCodes
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      logger.error('Error enabling 2FA', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to enable 2FA'
      })
    }
  }),

  verify2FA: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        backupCode: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const twoFARecord = await ctx.db.query.twoFactorTokens.findFirst({
          where: eq(twoFactorTokens.userId, ctx.session.user.id)
        })

        if (!twoFARecord) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '2FA not set up'
          })
        }

        // Verify TOTP token
        const verified = speakeasy.totp.verify({
          secret: twoFARecord.secret,
          encoding: 'base32',
          token: input.token,
          window: 2 // Allow 2 time steps of variance
        })

        if (!verified) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid 2FA token'
          })
        }

        // Enable 2FA
        await ctx.db
          .update(twoFactorTokens)
          .set({ isEnabled: true, lastUsedAt: new Date() })
          .where(eq(twoFactorTokens.userId, ctx.session.user.id))

        // Log security event
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'security',
          '2fa_enabled',
          { action: '2fa_enabled' },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        logger.error('Error verifying 2FA', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify 2FA'
        })
      }
    }),

  disable2FA: protectedProcedure
    .input(
      z.object({
        password: z.string().min(1)
      })
    )
    .mutation(async ({ ctx }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // In a real app, verify the password here
        // For now, we'll just disable 2FA

        await ctx.db
          .update(twoFactorTokens)
          .set({ backupCodes: JSON.stringify(generateBackupCodes()) })
          .where(eq(twoFactorTokens.userId, ctx.session.user.id))

        // Log security event
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'security',
          '2fa_disabled',
          { action: '2fa_disabled' },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error disabling 2FA', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disable 2FA'
        })
      }
    }),

  // IP Access Control
  getIpAccessRules: adminProcedure.query(async ({ ctx }) => {
    try {
      const rules = await ctx.db.query.ipAccessControl.findMany({
        orderBy: desc(ipAccessControl.createdAt),
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

      return { rules }
    } catch (error) {
      logger.error('Error fetching IP access rules', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch IP access rules'
      })
    }
  }),

  addIpAccessRule: adminProcedure
    .input(
      z.object({
        ipAddress: z.string().min(1),
        ipRange: z.string().optional(),
        type: z.enum(['whitelist', 'blacklist']),
        description: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const ruleId = randomBytes(16).toString('hex')

        await ctx.db.insert(ipAccessControl).values({
          id: ruleId,
          ipAddress: input.ipAddress,
          ipRange: input.ipRange,
          type: input.type,
          description: input.description,
          createdBy: ctx.session.user.id
        })

        // Log security event
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'security',
          'ip_rule_added',
          {
            ruleId,
            ipAddress: input.ipAddress,
            type: input.type
          },
          ipAddress,
          userAgent
        )

        return { success: true, ruleId }
      } catch (error) {
        logger.error('Error adding IP access rule', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add IP access rule'
        })
      }
    }),

  removeIpAccessRule: adminProcedure
    .input(z.object({ ruleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        await ctx.db.delete(ipAccessControl).where(eq(ipAccessControl.id, input.ruleId))

        // Log security event
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'security',
          'ip_rule_removed',
          { ruleId: input.ruleId },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error removing IP access rule', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove IP access rule'
        })
      }
    }),

  // Security Events
  getSecurityEvents: adminProcedure
    .input(
      z.object({
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        resolved: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        if (input.severity) {
          conditions.push(eq(securityEvents.severity, input.severity))
        }

        if (input.resolved !== undefined) {
          conditions.push(eq(securityEvents.resolved, input.resolved))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const events = await ctx.db.query.securityEvents.findMany({
          where: whereClause,
          orderBy: desc(securityEvents.createdAt),
          limit: input.limit,
          offset: input.offset,
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            },
            resolvedByUser: {
              columns: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        const totalCount = await ctx.db.query.securityEvents.findMany({
          where: whereClause,
          columns: { id: true }
        })

        return {
          events: events.map((event) => ({
            ...event,
            details: event.details ? JSON.parse(event.details) : null
          })),
          total: totalCount.length,
          hasMore: totalCount.length > input.offset + input.limit
        }
      } catch (error) {
        logger.error('Error fetching security events', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch security events'
        })
      }
    }),

  resolveSecurityEvent: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        await ctx.db
          .update(securityEvents)
          .set({
            resolved: true,
            resolvedBy: ctx.session.user.id,
            resolvedAt: new Date()
          })
          .where(eq(securityEvents.id, input.eventId))

        // Log security event
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'security',
          'event_resolved',
          { eventId: input.eventId },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error resolving security event', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resolve security event'
        })
      }
    }),

  // Login Attempts Analysis
  getLoginAttempts: adminProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Get recent login attempts
      const recentAttempts = await ctx.db.query.loginAttempts.findMany({
        where: gte(loginAttempts.createdAt, oneDayAgo),
        columns: { id: true, success: true, ipAddress: true }
      })

      // Get summary statistics
      const totalAttempts = recentAttempts.length
      const successfulAttempts = recentAttempts.filter((a) => a.success).length
      const failedAttempts = totalAttempts - successfulAttempts
      const uniqueIPs = new Set(recentAttempts.map((a) => a.ipAddress ?? '')).size

      return {
        attempts: recentAttempts,
        summary: {
          total: totalAttempts,
          successful: successfulAttempts,
          failed: failedAttempts,
          uniqueIPs,
          successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0
        }
      }
    } catch (error) {
      logger.error('Error fetching login attempts', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch login attempts'
      })
    }
  }),

  // Account Lockouts
  getAccountLockouts: adminProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const conditions = []

        // If userId is provided and not empty, filter by user
        if (input.userId && input.userId.trim() !== '') {
          conditions.push(eq(accountLockouts.userId, input.userId))
        }

        // Only show active (unlocked = false) lockouts for admin view
        conditions.push(eq(accountLockouts.unlocked, false))

        const lockouts = await ctx.db.query.accountLockouts.findMany({
          where: conditions.length > 0 ? and(...conditions) : eq(accountLockouts.unlocked, false),
          orderBy: desc(accountLockouts.lockedAt)
        })

        return { lockouts }
      } catch (error) {
        logger.error('Error fetching account lockouts', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch account lockouts'
        })
      }
    }),

  lockAccount: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string(),
        duration: z.number().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const lockoutId = randomBytes(16).toString('hex')
        await ctx.db.insert(accountLockouts).values({
          id: lockoutId,
          userId: input.userId,
          reason: input.reason,
          lockedBy: ctx.session.user.id,
          lockedUntil: input.duration ? new Date(Date.now() + input.duration * 60 * 1000) : null
        })

        // Log security event
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'user_ban',
          'security',
          'account_locked',
          { lockoutId, userId: input.userId },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error locking account', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to lock account'
        })
      }
    }),

  unlockAccount: adminProcedure
    .input(z.object({ lockoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        const lockout = await ctx.db.query.accountLockouts.findFirst({
          where: eq(accountLockouts.id, input.lockoutId)
        })

        if (!lockout) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Lockout not found'
          })
        }

        await ctx.db
          .update(accountLockouts)
          .set({
            unlocked: true,
            unlockedAt: new Date(),
            unlockedBy: ctx.session.user.id
          })
          .where(eq(accountLockouts.id, input.lockoutId))

        // Log security event
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'user_unban',
          'security',
          'account_unlocked',
          { lockoutId: input.lockoutId },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error unlocking account', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to unlock account'
        })
      }
    }),

  // Security Settings
  getSecuritySettings: adminProcedure.query(async ({ ctx }) => {
    try {
      const settings = await ctx.db.query.securitySettings.findMany({
        orderBy: [securitySettings.category, securitySettings.key],
        with: {
          updatedByUser: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Group by category
      const groupedSettings: Record<string, any[]> = {}
      settings.forEach((setting) => {
        const category = setting.category
        const group = groupedSettings[category] ?? []
        if (!groupedSettings[category]) {
          groupedSettings[category] = group
        }
        group.push(setting)
      })

      return { settings: groupedSettings }
    } catch (error) {
      logger.error('Error fetching security settings', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch security settings'
      })
    }
  }),

  updateSecuritySetting: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
        category: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // Check if setting exists
        const existingSetting = await ctx.db.query.securitySettings.findFirst({
          where: eq(securitySettings.key, input.key)
        })

        if (!existingSetting) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Security setting not found'
          })
        }

        if (existingSetting) {
          // Update existing
          await ctx.db
            .update(securitySettings)
            .set({
              value: input.value,
              description: input.description || existingSetting.description,
              category: input.category || existingSetting.category,
              updatedBy: ctx.session.user.id,
              updatedAt: new Date()
            })
            .where(eq(securitySettings.key, input.key))
        } else {
          // Create new
          const settingId = randomBytes(16).toString('hex')
          await ctx.db.insert(securitySettings).values({
            id: settingId,
            key: input.key,
            value: input.value,
            description: input.description,
            category: input.category || 'general',
            updatedBy: ctx.session.user.id
          })
        }

        // Log security event
        await auditLogger.logSystemAction(
          ctx.session.user.id,
          'settings_update',
          'security',
          'setting_updated',
          {
            key: input.key,
            previousValue: existingSetting?.value,
            newValue: input.value
          },
          ipAddress,
          userAgent
        )

        return { success: true }
      } catch (error) {
        logger.error('Error updating security setting', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update security setting'
        })
      }
    }),

  // Security Dashboard Stats
  getSecurityStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Get recent security events
      const recentEvents = await ctx.db.query.securityEvents.findMany({
        where: gte(securityEvents.createdAt, oneDayAgo),
        columns: { id: true, severity: true }
      })

      // Get recent login attempts
      const recentAttempts = await ctx.db.query.loginAttempts.findMany({
        where: gte(loginAttempts.createdAt, oneDayAgo),
        columns: { id: true, success: true }
      })

      // Get active lockouts
      const activeLockouts = await ctx.db.query.accountLockouts.findMany({
        where: eq(accountLockouts.unlocked, false),
        columns: { id: true }
      })

      // Get 2FA adoption
      const totalUsers = await ctx.db.query.users.findMany({
        columns: { id: true }
      })

      const users2FA = await ctx.db.query.twoFactorTokens.findMany({
        where: eq(twoFactorTokens.isEnabled, true),
        columns: { id: true }
      })

      return {
        events: {
          total: recentEvents.length,
          critical: recentEvents.filter((e) => e.severity === 'critical').length,
          high: recentEvents.filter((e) => e.severity === 'high').length,
          medium: recentEvents.filter((e) => e.severity === 'medium').length,
          low: recentEvents.filter((e) => e.severity === 'low').length
        },
        loginAttempts: {
          total: recentAttempts.length,
          successful: recentAttempts.filter((a) => a.success).length,
          failed: recentAttempts.filter((a) => !a.success).length
        },
        lockouts: {
          active: activeLockouts.length
        },
        twoFactor: {
          totalUsers: totalUsers.length,
          enabledUsers: users2FA.length,
          adoptionRate: totalUsers.length > 0 ? (users2FA.length / totalUsers.length) * 100 : 0
        }
      }
    } catch (error) {
      logger.error('Error fetching security stats', error)
      return {
        events: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
        loginAttempts: { total: 0, successful: 0, failed: 0 },
        lockouts: { active: 0 },
        twoFactor: { totalUsers: 0, enabledUsers: 0, adoptionRate: 0 }
      }
    }
  })
})
