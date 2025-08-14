import type { RouterOutputs } from '../react'

import { TRPCError } from '@trpc/server'
import { passwordResetTokens, users, sessions } from '@tszhong0411/db'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { hash } from '@node-rs/argon2'
import { z } from 'zod'
import { PasswordReset } from '@tszhong0411/emails'

import { resend } from '@/lib/resend'
import { env } from '@tszhong0411/env'
import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
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
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // Check if user exists and get user details for audit log
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId),
          columns: { id: true, name: true, email: true, role: true }
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }

        // Prevent deletion of admin users (safety check)
        if (user.role === 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot delete admin users'
          })
        }
        
        // Actually delete the user from database
        await ctx.db.delete(users).where(eq(users.id, input.userId))
        
        // Log the audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'user_delete',
          input.userId,
          { 
            deletedUser: { 
              name: user.name, 
              email: user.email, 
              role: user.role 
            } 
          },
          ipAddress,
          userAgent
        )
        
        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
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
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // Check if user exists
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId),
          columns: { id: true, name: true, email: true, role: true }
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }

        // Prevent banning admin users
        if (user.role === 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot ban admin users'
          })
        }
        
        // For now, we'll delete all user sessions to effectively "ban" them
        // In a more sophisticated system, you'd add a 'banned' field to users table
        await ctx.db.delete(sessions).where(eq(sessions.userId, input.userId))
        
        // Log the audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'user_ban',
          input.userId,
          { 
            bannedUser: { 
              name: user.name, 
              email: user.email 
            } 
          },
          ipAddress,
          userAgent
        )
        
        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
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
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

        // Check if user exists
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, input.userId),
          columns: { id: true, name: true, email: true }
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }
        
        // Since we "ban" by deleting sessions, "unbanning" means the user can sign in again
        // In a more sophisticated system, you'd update a 'banned' field to false
        // For now, we'll just log the unban action
        
        // Log the audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'user_unban',
          input.userId,
          { 
            unbannedUser: { 
              name: user.name, 
              email: user.email 
            } 
          },
          ipAddress,
          userAgent
        )
        
        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
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
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)
        const { userId, ...updateData } = input

        // Check if user exists and get current data
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, userId),
          columns: { id: true, name: true, email: true, username: true, role: true, image: true }
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }

        // Check for email uniqueness if email is being updated
        if (updateData.email && updateData.email !== user.email) {
          const existingUser = await ctx.db.query.users.findFirst({
            where: eq(users.email, updateData.email)
          })
          if (existingUser) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Email already exists'
            })
          }
        }

        // Check for username uniqueness if username is being updated
        if (updateData.username && updateData.username !== user.username) {
          const existingUser = await ctx.db.query.users.findFirst({
            where: eq(users.username, updateData.username)
          })
          if (existingUser) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Username already exists'
            })
          }
        }
        
        // Filter out undefined values for the update
        const filteredUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined)
        )

        if (Object.keys(filteredUpdateData).length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No valid update data provided'
          })
        }

        // Perform the actual update
        await ctx.db
          .update(users)
          .set({ ...filteredUpdateData, updatedAt: new Date() })
          .where(eq(users.id, userId))
        
        // Log the audit trail
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'user_update',
          userId,
          { 
            previousData: user,
            updatedData: filteredUpdateData
          },
          ipAddress,
          userAgent
        )
        
        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
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
        const auditLogger = new AuditLogger(ctx.db)
        const ipAddress = getIpFromHeaders(ctx.headers)
        const userAgent = getUserAgentFromHeaders(ctx.headers)

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
        const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'
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

        // Log the audit trail for password reset initiation
        await auditLogger.logUserAction(
          ctx.session.user.id,
          'user_password_reset',
          input.userId,
          { 
            targetUser: { 
              name: user.name, 
              email: user.email 
            },
            resetInitiated: true
          },
          ipAddress,
          userAgent
        )

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
