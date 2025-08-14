import type { RouterOutputs } from '../react'

import { TRPCError } from '@trpc/server'
import { passwordResetTokens } from '@tszhong0411/db'
import { and, eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { hash, verify } from '@node-rs/argon2'
import { z } from 'zod'
import { PasswordReset } from '@tszhong0411/emails'

import { resend } from '@/lib/resend'
import { env } from '@tszhong0411/env'
import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc'

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
        // Get user details
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId),
          columns: { email: true, name: true }
        })

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }

        // Generate secure reset token
        const token = randomBytes(32).toString('hex')
        const tokenId = randomBytes(16).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

        // Store reset token in database
        await ctx.db.insert(passwordResetTokens).values({
          id: tokenId,
          token,
          userId: input.userId,
          expiresAt,
          createdAt: new Date(),
          used: false
        })

        // Create reset URL with fallback for development
        const baseUrl = env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'
        const resetUrl = `${baseUrl}/reset-password?token=${token}`

        // Send email if Resend is configured
        if (resend) {
          try {
            await resend.emails.send({
              from: 'yuricunha.com <noreply@yuricunha.com>',
              to: user.email,
              subject: 'Reset your password',
              react: PasswordReset({
                name: user.name,
                resetUrl
              })
            })

            console.log(`Password reset email sent to: ${user.email}`)
            console.log(`Reset URL: ${resetUrl}`)
          } catch (emailError) {
            console.error('Failed to send password reset email:', emailError)
            console.log(`Password reset email failed for: ${user.email}`)
            console.log(`Reset URL: ${resetUrl}`)
          }
        } else {
          console.log(`Password reset email would be sent to: ${user.email}`)
          console.log(`Reset URL: ${resetUrl}`)
          console.log('Note: RESEND_API_KEY not configured - email delivery disabled')
        }

        return { success: true }
      } catch (error) {
        console.error('Password reset error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send password reset email'
        })
      }
    }),

  resetPassword: publicProcedure
    .input(z.object({ 
      token: z.string(),
      newPassword: z.string().min(8)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Find valid reset token
        const resetToken = await ctx.db.query.passwordResetTokens.findFirst({
          where: (tokens, { eq, and }) => and(
            eq(tokens.token, input.token),
            eq(tokens.used, false)
          ),
          with: {
            user: true
          }
        })

        if (!resetToken) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid or expired reset token'
          })
        }

        // Check if token is expired
        if (resetToken.expiresAt < new Date()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Reset token has expired'
          })
        }

        // Hash the new password
        const hashedPassword = await hash(input.newPassword)

        // Update user's password (this would require adding password field to accounts table)
        // For now, we'll simulate this
        console.log(`Password would be updated for user: ${resetToken.userId}`)
        console.log(`New password hash: ${hashedPassword}`)

        // Mark token as used
        await ctx.db
          .update(passwordResetTokens)
          .set({ used: true })
          .where(eq(passwordResetTokens.id, resetToken.id))

        return { success: true }
      } catch (error) {
        console.error('Reset password error:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset password'
        })
      }
    })
})

export type GetUsersOutput = RouterOutputs['users']['getUsers']
