import type { RouterOutputs } from '../react'

import { TRPCError } from '@trpc/server'
import { eq, users } from '@tszhong0411/db'
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
        updatedAt: true,
        banned: true
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
        await ctx.db.delete(users).where(eq(users.id, input.userId))
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
        await ctx.db
          .update(users)
          .set({ banned: true })
          .where(eq(users.id, input.userId))
 
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
        await ctx.db
          .update(users)
          .set({ banned: false })
          .where(eq(users.id, input.userId))
 
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
        const { userId, ...updateData } = input
        await ctx.db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId))

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
          where: eq(users.id, input.userId),
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
