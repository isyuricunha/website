import { count, eq, gte, sql } from '@tszhong0411/db'

import { adminProcedure, createTRPCRouter } from '../trpc'

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get total counts
    const [totalUsers] = await ctx.db
      .select({ count: count() })
      .from(ctx.db.schema.users)

    const [totalComments] = await ctx.db
      .select({ count: count() })
      .from(ctx.db.schema.comments)

    const [totalGuestbookEntries] = await ctx.db
      .select({ count: count() })
      .from(ctx.db.schema.guestbook)

    // Get recent activity (last 30 days)
    const [recentUsers] = await ctx.db
      .select({ count: count() })
      .from(ctx.db.schema.users)
      .where(gte(ctx.db.schema.users.createdAt, thirtyDaysAgo))

    const [recentComments] = await ctx.db
      .select({ count: count() })
      .from(ctx.db.schema.comments)
      .where(gte(ctx.db.schema.comments.createdAt, thirtyDaysAgo))

    // Get weekly activity (last 7 days)
    const [weeklyUsers] = await ctx.db
      .select({ count: count() })
      .from(ctx.db.schema.users)
      .where(gte(ctx.db.schema.users.createdAt, sevenDaysAgo))

    const [weeklyComments] = await ctx.db
      .select({ count: count() })
      .from(ctx.db.schema.comments)
      .where(gte(ctx.db.schema.comments.createdAt, sevenDaysAgo))

    // Get admin users count
    const [adminUsers] = await ctx.db
      .select({ count: count() })
      .from(ctx.db.schema.users)
      .where(eq(ctx.db.schema.users.role, 'admin'))

    return {
      totals: {
        users: totalUsers?.count ?? 0,
        comments: totalComments?.count ?? 0,
        guestbookEntries: totalGuestbookEntries?.count ?? 0,
        admins: adminUsers?.count ?? 0
      },
      recent: {
        users: recentUsers?.count ?? 0,
        comments: recentComments?.count ?? 0
      },
      weekly: {
        users: weeklyUsers?.count ?? 0,
        comments: weeklyComments?.count ?? 0
      }
    }
  })
})
