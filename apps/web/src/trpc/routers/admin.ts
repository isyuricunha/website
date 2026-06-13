import {
  auditLogs as audit_logs_table,
  comments,
  count,
  desc,
  eq,
  gte,
  guestbook,
  users
} from '@isyuricunha/db'
import { adminProcedure, createTRPCRouter } from '../trpc'
import { logger } from '@/lib/logger'

const safeJsonParse = (str: string | null): unknown => {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    try {
      // Use COUNT queries instead of loading all rows into memory
      const [totalUsersRow] = await ctx.db.select({ value: count() }).from(users)

      const [totalCommentsRow] = await ctx.db.select({ value: count() }).from(comments)

      const [totalGuestbookRow] = await ctx.db.select({ value: count() }).from(guestbook)

      const [adminUsersRow] = await ctx.db
        .select({ value: count() })
        .from(users)
        .where(eq(users.role, 'admin'))

      const [recentUsersRow] = await ctx.db
        .select({ value: count() })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))

      const [recentCommentsRow] = await ctx.db
        .select({ value: count() })
        .from(comments)
        .where(gte(comments.createdAt, thirtyDaysAgo))

      const [weeklyUsersRow] = await ctx.db
        .select({ value: count() })
        .from(users)
        .where(gte(users.createdAt, sevenDaysAgo))

      const [weeklyCommentsRow] = await ctx.db
        .select({ value: count() })
        .from(comments)
        .where(gte(comments.createdAt, sevenDaysAgo))

      const totalUsers = totalUsersRow?.value ?? 0
      const totalComments = totalCommentsRow?.value ?? 0
      const totalGuestbookEntries = totalGuestbookRow?.value ?? 0
      const adminUsers = adminUsersRow?.value ?? 0
      const recentUsers = recentUsersRow?.value ?? 0
      const recentComments = recentCommentsRow?.value ?? 0
      const weeklyUsers = weeklyUsersRow?.value ?? 0
      const weeklyComments = weeklyCommentsRow?.value ?? 0

      // Calculate previous month counts for trend computation
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      const [prevUsersRow] = await ctx.db
        .select({ value: count() })
        .from(users)
        .where(gte(users.createdAt, sixtyDaysAgo))

      const [prevCommentsRow] = await ctx.db
        .select({ value: count() })
        .from(comments)
        .where(gte(comments.createdAt, sixtyDaysAgo))

      // Previous month = total in 60d window - total in 30d window
      const prevMonthUsers = Math.max(0, (prevUsersRow?.value ?? 0) - recentUsers)
      const prevMonthComments = Math.max(0, (prevCommentsRow?.value ?? 0) - recentComments)

      // Compute real trend percentages
      const userTrend =
        prevMonthUsers > 0
          ? Math.round(((recentUsers - prevMonthUsers) / prevMonthUsers) * 100)
          : (recentUsers > 0
            ? 100
            : 0)
      const commentTrend =
        prevMonthComments > 0
          ? Math.round(((recentComments - prevMonthComments) / prevMonthComments) * 100)
          : (recentComments > 0
            ? 100
            : 0)

      // Calculate engagement metrics
      const engagementRate = totalUsers > 0 ? totalComments / totalUsers : 0

      // Get recent audit logs for admin activity
      const recentAuditLogs = await ctx.db.query.auditLogs.findMany({
        where: gte(audit_logs_table.createdAt, sevenDaysAgo),
        orderBy: desc(audit_logs_table.createdAt),
        limit: 10,
        with: {
          adminUser: {
            columns: {
              name: true,
              email: true
            }
          }
        }
      })

      return {
        totals: {
          users: totalUsers,
          comments: totalComments,
          guestbookEntries: totalGuestbookEntries,
          admins: adminUsers
        },
        recent: {
          users: recentUsers,
          comments: recentComments,
          activeUsers: recentUsers
        },
        weekly: {
          users: weeklyUsers,
          comments: weeklyComments
        },
        trends: {
          users: userTrend,
          comments: commentTrend
        },
        growth: {
          engagementRate: Math.round(engagementRate * 100) / 100
        },
        recentActivity: recentAuditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          adminName: log.adminUser?.name ?? 'Unknown',
          createdAt: log.createdAt,
          details: safeJsonParse(log.details)
        }))
      }
    } catch (error) {
      logger.error('Error fetching admin stats', error)
      return {
        totals: {
          users: 0,
          comments: 0,
          guestbookEntries: 0,
          admins: 0
        },
        recent: {
          users: 0,
          comments: 0,
          activeUsers: 0
        },
        weekly: {
          users: 0,
          comments: 0
        },
        trends: {
          users: 0,
          comments: 0
        },
        growth: {
          engagementRate: 0
        },
        recentActivity: []
      }
    }
  }),

  getAuditLogs: adminProcedure.query(async ({ ctx }) => {
    try {
      const logs = await ctx.db.query.auditLogs.findMany({
        orderBy: desc(audit_logs_table.createdAt),
        limit: 100,
        with: {
          adminUser: {
            columns: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      return {
        logs: logs.map((log) => ({
          id: log.id,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          adminUser: {
            name: log.adminUser.name,
            email: log.adminUser.email,
            image: log.adminUser.image
          },
          details: safeJsonParse(log.details),
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: log.createdAt
        }))
      }
    } catch (error) {
      logger.error('Error fetching audit logs', error)
      return { logs: [] }
    }
  })
})
