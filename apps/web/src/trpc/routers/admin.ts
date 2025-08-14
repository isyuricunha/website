import { adminProcedure, createTRPCRouter } from '../trpc'

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    try {
      // Get all users
      const allUsers = await ctx.db.query.users.findMany({
        columns: {
          id: true,
          role: true,
          createdAt: true
        }
      })

      // Get all comments
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

      // Calculate stats
      const totalUsers = allUsers.length
      const totalComments = allComments.length
      const totalGuestbookEntries = allGuestbookEntries.length
      const adminUsers = allUsers.filter(user => user.role === 'admin').length

      // Calculate recent activity (last 30 days)
      const recentUsers = allUsers.filter(user => 
        user.createdAt && new Date(user.createdAt) >= thirtyDaysAgo
      ).length

      const recentComments = allComments.filter(comment => 
        comment.createdAt && new Date(comment.createdAt) >= thirtyDaysAgo
      ).length

      // Calculate weekly activity (last 7 days)
      const weeklyUsers = allUsers.filter(user => 
        user.createdAt && new Date(user.createdAt) >= sevenDaysAgo
      ).length

      const weeklyComments = allComments.filter(comment => 
        comment.createdAt && new Date(comment.createdAt) >= sevenDaysAgo
      ).length

      return {
        totals: {
          users: totalUsers,
          comments: totalComments,
          guestbookEntries: totalGuestbookEntries,
          admins: adminUsers
        },
        recent: {
          users: recentUsers,
          comments: recentComments
        },
        weekly: {
          users: weeklyUsers,
          comments: weeklyComments
        }
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      return {
        totals: {
          users: 0,
          comments: 0,
          guestbookEntries: 0,
          admins: 0
        },
        recent: {
          users: 0,
          comments: 0
        },
        weekly: {
          users: 0,
          comments: 0
        }
      }
    }
  })
})
