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
        await ctx.db.delete(ctx.db.schema.users).where(eq(ctx.db.schema.users.id, input.userId))
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
        // For now, we'll use a simple approach by updating a custom field
        // In a real implementation, you might want to add a 'banned' field to the users table
        await ctx.db
          .update(ctx.db.schema.users)
          .set({ role: 'user' }) // You could add a 'banned' field to the schema
          .where(eq(ctx.db.schema.users.id, input.userId))

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
        // Similar to ban, but restore user privileges
        await ctx.db
          .update(ctx.db.schema.users)
          .set({ role: 'user' })
          .where(eq(ctx.db.schema.users.id, input.userId))

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
          .update(ctx.db.schema.users)
          .set(updateData)
          .where(eq(ctx.db.schema.users.id, userId))

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
          where: eq(ctx.db.schema.users.id, input.userId),
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
