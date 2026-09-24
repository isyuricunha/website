import type { RouterOutputs } from '../react'

import { TRPCError } from '@trpc/server'
import { and, comments, desc, eq, lt, users, sessions, sql } from '@isyuricunha/db'
import { ratelimit } from '@isyuricunha/kv'
import { z } from 'zod'

import { env } from '@isyuricunha/env'
import { AuditLogger, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'
import { get_request_locale } from '@/lib/request-locale'
import { create_presigned_r2_put_url, get_r2_public_base_url } from '@/lib/r2'
import { getLocalizedPath } from '@/utils/get-localized-path'
import { getDefaultImage } from '@/utils/get-default-image'
import { getIp } from '@/utils/get-ip'
import { auth } from '@/lib/auth'
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { randomUUID } from 'node:crypto'

const get_site_url = (headers: Headers) => {
  const configured_url = env.NEXT_PUBLIC_WEBSITE_URL
  if (configured_url) {
    return configured_url.replace(/\/$/, '')
  }

  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  if (host) {
    const protocol =
      headers.get('x-forwarded-proto') ?? (env.NODE_ENV === 'production' ? 'https' : 'http')
    return `${protocol}://${host}`
  }

  return 'http://localhost:3000'
}

const getAvatarExtension = (contentType: 'image/png' | 'image/jpeg' | 'image/webp') => {
  switch (contentType) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'jpg'
  }
}

const avatarUploadUrlInputSchema = z.object({
  contentType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  size: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024)
})

const publicProfileHandleInputSchema = z.object({
  handle: z.string().min(1)
})

const infiniteUserCommentsInputSchema = z.object({
  handle: z.string().min(1),
  cursor: z.date().nullish(),
  limit: z.number().min(1).max(50).default(10)
})

const userIdInputSchema = z.object({ userId: z.string() })

const updateUserInputSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin']).optional(),
  image: z.string().optional()
})

const emailInputSchema = z.object({ email: z.string().email() })

const resetPasswordInputSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8)
})

export const usersRouter = createTRPCRouter({
  createAvatarUploadUrl: protectedProcedure
    .input(avatarUploadUrlInputSchema)
    .mutation(async ({ ctx, input }) => {
      const is_anonymous = ctx.session.user.isAnonymous === true
      if (is_anonymous) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Anonymous users cannot change avatar until they update their email.'
        })
      }

      if (!env.R2_BUCKET_NAME) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'R2 is not configured'
        })
      }

      const public_base_url = get_r2_public_base_url()
      if (!public_base_url) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'R2_PUBLIC_BASE_URL is not configured'
        })
      }

      const ext = getAvatarExtension(input.contentType)

      const key = `avatars/${ctx.session.user.id}/${randomUUID()}.${ext}`

      const presigned = await create_presigned_r2_put_url({
        bucket: env.R2_BUCKET_NAME,
        key,
        contentType: input.contentType,
        cacheControl: 'public, max-age=31536000, immutable',
        expiresInSeconds: 60
      })

      if (!presigned) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'R2 is not configured'
        })
      }

      const publicUrl = `${public_base_url}/${key}`

      return {
        key,
        uploadUrl: presigned.url,
        publicUrl,
        requiredHeaders: presigned.requiredHeaders
      }
    }),

  getPublicProfile: publicProcedure
    .input(publicProfileHandleInputSchema)
    .query(async ({ ctx, input }) => {
      // DB-backed public lookup: rate limit so anonymous traffic cannot hammer
      // the profile query (and the timing/apiUsage telemetry rows it creates).
      const ip = getIpFromHeaders(ctx.headers)
      const { success: rl_ok } = await ratelimit.limit(`users:public-profile:${ip}`)
      if (!rl_ok) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const handle_lower = input.handle.toLowerCase()

      const user = await ctx.db.query.users.findFirst({
        where: (users, { and, eq }) =>
          and(eq(users.isPublic, true), eq(sql`lower(${users.username})`, handle_lower)),
        columns: {
          id: true,
          username: true,
          name: true,
          image: true,
          bio: true,
          isPublic: true,
          nameColor: true,
          nameEffect: true,
          role: true
        }
      })

      if (user) {
        return {
          ...user,
          image: user.image ?? getDefaultImage(user.id)
        }
      }

      const user_by_id = await ctx.db.query.users.findFirst({
        where: (users, { and, eq }) => and(eq(users.isPublic, true), eq(users.id, input.handle)),
        columns: {
          id: true,
          username: true,
          name: true,
          image: true,
          bio: true,
          isPublic: true,
          nameColor: true,
          nameEffect: true,
          role: true
        }
      })

      if (!user_by_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        })
      }

      return {
        ...user_by_id,
        image: user_by_id.image ?? getDefaultImage(user_by_id.id)
      }
    }),

  getInfiniteUserComments: publicProcedure
    .input(infiniteUserCommentsInputSchema)
    .query(async ({ ctx, input }) => {
      const locale = get_request_locale(ctx.headers)

      // Public DB-touching endpoint: rate limit like the other public queries.
      // getIp trusts only platform headers; getIpFromHeaders honours the
      // client-forgeable x-forwarded-for and would let callers rotate keys.
      const ip = getIp(ctx.headers)
      const { success: rl_ok } = await ratelimit.limit(`users:public-comments:${ip}`)
      if (!rl_ok) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const profile = await ctx.db.query.users.findFirst({
        where: (users, { and, eq }) =>
          and(
            eq(users.isPublic, true),
            eq(sql`lower(${users.username})`, input.handle.toLowerCase())
          ),
        columns: {
          id: true
        }
      })

      const profile_id =
        profile?.id ??
        (
          await ctx.db.query.users.findFirst({
            where: (users, { and, eq }) =>
              and(eq(users.isPublic, true), eq(users.id, input.handle)),
            columns: {
              id: true
            }
          })
        )?.id

      if (!profile_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        })
      }

      const query = await ctx.db.query.comments.findMany({
        where: and(
          eq(comments.userId, profile_id),
          eq(comments.isDeleted, false),
          input.cursor ? lt(comments.createdAt, input.cursor) : undefined
        ),
        limit: input.limit,
        orderBy: desc(comments.createdAt),
        with: {
          post: {
            columns: {
              slug: true,
              title: true
            }
          }
        },
        columns: {
          id: true,
          body: true,
          createdAt: true,
          postId: true,
          parentId: true
        }
      })

      const result = query.map((comment) => {
        const post_url = getLocalizedPath({ slug: `/blog/${comment.postId}`, locale })
        return {
          ...comment,
          type: comment.parentId ? ('reply' as const) : ('comment' as const),
          post: {
            slug: comment.postId,
            title: comment.post?.title ?? comment.postId,
            url: post_url
          }
        }
      })

      return {
        comments: result,
        nextCursor: result.at(-1)?.createdAt ?? null
      }
    }),

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

  deleteUser: adminProcedure.input(userIdInputSchema).mutation(async ({ ctx, input }) => {
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

  banUser: adminProcedure.input(userIdInputSchema).mutation(async ({ ctx, input }) => {
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

      // Set the banned flag and delete all user sessions to effectively "ban" them
      await ctx.db.update(users).set({ banned: true }).where(eq(users.id, input.userId))
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

  unbanUser: adminProcedure.input(userIdInputSchema).mutation(async ({ ctx, input }) => {
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

      // Clear the banned flag so the user can sign in again
      await ctx.db.update(users).set({ banned: false }).where(eq(users.id, input.userId))

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

  updateUser: adminProcedure.input(updateUserInputSchema).mutation(async ({ ctx, input }) => {
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

  requestPasswordReset: publicProcedure.input(emailInputSchema).mutation(async ({ ctx, input }) => {
    const ip = getIpFromHeaders(ctx.headers)
    const { success: rl_ok } = await ratelimit.limit(`users:password-reset:${ip}`)
    if (!rl_ok) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const locale = get_request_locale(ctx.headers)
      const baseUrl = get_site_url(ctx.headers)
      const resetPath = getLocalizedPath({ slug: '/reset-password', locale })
      const redirectTo = `${baseUrl}${resetPath}`

      await auth.api.requestPasswordReset({
        body: {
          email: input.email,
          redirectTo
        }
      })

      return { success: true }
    } catch (error) {
      logger.error('Request password reset error', error)
      // Always return success to prevent email enumeration
      return { success: true }
    }
  }),

  sendPasswordReset: adminProcedure.input(userIdInputSchema).mutation(async ({ ctx, input }) => {
    try {
      const locale = get_request_locale(ctx.headers)
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

      const baseUrl = get_site_url(ctx.headers)
      const resetPath = getLocalizedPath({ slug: '/reset-password', locale })
      const redirectTo = `${baseUrl}${resetPath}`

      await auth.api.requestPasswordReset({
        body: {
          email: user.email,
          redirectTo
        }
      })

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
      logger.error('Password reset error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send password reset email'
      })
    }
  }),

  resetPassword: publicProcedure.input(resetPasswordInputSchema).mutation(async ({ input }) => {
    try {
      await auth.api.resetPassword({
        body: {
          token: input.token,
          newPassword: input.newPassword
        }
      })

      return { success: true }
    } catch (error) {
      logger.error('Reset password error', error)
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset password'
      })
    }
  })
})

export type GetUsersOutput = RouterOutputs['users']['getUsers']
