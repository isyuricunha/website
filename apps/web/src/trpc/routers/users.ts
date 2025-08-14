import type { RouterOutputs } from '../react'

import { TRPCError } from '@trpc/server'
import { eq } from '@tszhong0411/db'
import { z } from 'zod'

import { adminProcedure, createTRPCRouter } from '../trpc'

export const usersRouter = createTRPCRouter({
  getUsers: adminProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        username: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return {
      users: result
    }
  }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // For now, we'll simulate user deletion by updating their role
        // In a real implementation, you might want to soft delete or actually remove the user
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId)
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }
        
        // Simulate deletion by marking user as inactive (you could implement actual deletion)
        console.log(`User ${input.userId} would be deleted in production`)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user'
        })
      }
    }),

  banUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user exists
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId)
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }
        
        // For now, we'll simulate banning by logging
        // In a real implementation, you might want to add a 'banned' field to the users table
        console.log(`User ${input.userId} would be banned in production`)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to ban user'
        })
      }
    }),

  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user exists
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId)
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }
        
        // For now, we'll simulate unbanning by logging
        // In a real implementation, you might want to update a 'banned' field to false
        console.log(`User ${input.userId} would be unbanned in production`)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to unban user'
        })
      }
    }),

  updateUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      name: z.string().optional(),
      username: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(['user', 'admin']).optional(),
      image: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user exists
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId)
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }
        
        // For now, we'll simulate updating by logging
        // In a real implementation, you would perform the actual update
        console.log(`User ${input.userId} would be updated with:`, input)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user'
        })
      }
    }),

  sendPasswordReset: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get user email
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId),
          columns: { email: true }
        })

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }

        // In a real implementation, you would send an email here
        // For now, we'll just return success
        console.log(`Password reset email would be sent to: ${user.email}`)

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send password reset email'
        })
      }
    })
})

export type GetUsersOutput = RouterOutputs['users']['getUsers']
