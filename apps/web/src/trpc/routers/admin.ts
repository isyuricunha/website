import { auditLogs as audit_logs_table, desc, gte } from '@tszhong0411/db'
import { adminProcedure, createTRPCRouter } from '../trpc'
import { logger } from '@/lib/logger'

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    try {
      // Get all users with creation dates
      const allUsers = await ctx.db.query.users.findMany({
        columns: {
          id: true,
          role: true,
          createdAt: true
        }
      })

      // Get all comments with creation dates
      const allComments = await ctx.db.query.comments.findMany({
        columns: {
          id: true,
          createdAt: true
        }
      })

      // Get all guestbook entries
      const allGuestbookEntries = await ctx.db.query.guestbook.findMany({
        columns: {
          id: true,
          createdAt: true
        }
      })

      // Calculate basic stats
      const totalUsers = allUsers.length
      const totalComments = allComments.length
      const totalGuestbookEntries = allGuestbookEntries.length
      const adminUsers = allUsers.filter((user) => user.role === 'admin').length

      // Calculate recent activity (last 30 days)
      const recentUsers = allUsers.filter(
        (user) => user.createdAt && new Date(user.createdAt) >= thirtyDaysAgo
      ).length

      const recentComments = allComments.filter(
        (comment) => comment.createdAt && new Date(comment.createdAt) >= thirtyDaysAgo
      ).length

      // Calculate weekly activity (last 7 days)
      const weeklyUsers = allUsers.filter(
        (user) => user.createdAt && new Date(user.createdAt) >= sevenDaysAgo
      ).length

      const weeklyComments = allComments.filter(
        (comment) => comment.createdAt && new Date(comment.createdAt) >= sevenDaysAgo
      ).length

      // Calculate user growth trends (monthly data for the past year)
      const userGrowthData = []
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

        const monthlyUsers = allUsers.filter(
          (user) =>
            user.createdAt &&
            new Date(user.createdAt) >= monthStart &&
            new Date(user.createdAt) <= monthEnd
        ).length

        userGrowthData.push({
          month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
          users: monthlyUsers,
          cumulative: allUsers.filter(
            (user) => user.createdAt && new Date(user.createdAt) <= monthEnd
          ).length
        })
      }

      // Calculate engagement metrics
      const activeUsers = allUsers.filter(
        (user) => user.createdAt && new Date(user.createdAt) >= thirtyDaysAgo
      ).length

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
          activeUsers
        },
        weekly: {
          users: weeklyUsers,
          comments: weeklyComments
        },
        growth: {
          userGrowthData,
          engagementRate: Math.round(engagementRate * 100) / 100
        },
        recentActivity: recentAuditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          adminName: log.adminUser.name,
          createdAt: log.createdAt,
          details: log.details ? JSON.parse(log.details) : null
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
        growth: {
          userGrowthData: [],
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
          details: log.details ? JSON.parse(log.details) : null,
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
