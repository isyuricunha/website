import type { RouterInputs, RouterOutputs } from '../react'

import { createId } from '@paralleldrive/cuid2'
import { TRPCError } from '@trpc/server'
import {
  and,
  asc,
  comments,
  count,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  lt,
  ne,
  rates
} from '@tszhong0411/db'
import { Comment, Reply } from '@tszhong0411/emails'
import { env } from '@tszhong0411/env'
import { ratelimit } from '@tszhong0411/kv'
import { allPosts } from 'content-collections'
import { z } from 'zod'

import { isProduction } from '@/lib/constants'
import { resend } from '@/lib/resend'
import { getDefaultImage } from '@/utils/get-default-image'
import { getIp } from '@/utils/get-ip'

import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

const getKey = (id: string) => `comments:${id}`

export const commentsRouter = createTRPCRouter({
  getComments: adminProcedure.query(async ({ ctx }) => {
    const query = await ctx.db.query.comments.findMany({
      columns: {
        id: true,
        userId: true,
        parentId: true,
        body: true,
        createdAt: true
      }
    })

    const result = query.map((comment) => ({
      ...comment,
      type: comment.parentId ? 'reply' : 'comment'
    }))

    return {
      comments: result
    }
  }),
  getInfiniteComments: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        parentId: z.string().optional(),
        sort: z.enum(['newest', 'oldest']).default('newest'),
        cursor: z.date().nullish(),
        limit: z.number().min(1).max(50).default(10),
        type: z.enum(['comments', 'replies']).default('comments'),
        highlightedCommentId: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const session = ctx.session

      const ip = getIp(ctx.headers)

      const { success } = await ratelimit.limit(getKey(`getInfiniteComments:${ip}`))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const getCursorFilter = () => {
        if (!input.cursor) return
        return input.sort === 'newest'
          ? lt(comments.createdAt, input.cursor)
          : gt(comments.createdAt, input.cursor)
      }

      const query = await ctx.db.query.comments.findMany({
        where: and(
          eq(comments.postId, input.slug),
          input.parentId ? eq(comments.parentId, input.parentId) : isNull(comments.parentId),
          input.type === 'comments' ? isNull(comments.parentId) : isNotNull(comments.parentId),
          getCursorFilter(),
          input.highlightedCommentId ? ne(comments.id, input.highlightedCommentId) : undefined
        ),
        limit: input.limit,
        with: {
          user: {
            columns: {
              name: true,
              image: true,
              role: true,
              id: true
            }
          },
          rates: {
            where: eq(rates.userId, session?.user.id ?? '')
          }
        },
        orderBy: input.sort === 'newest' ? desc(comments.createdAt) : asc(comments.createdAt),
        columns: {
          id: true,
          userId: true,
          parentId: true,
          body: true,
          createdAt: true,
          isDeleted: true
        }
      })

      if (input.highlightedCommentId && !input.cursor) {
        const highlightedComment = await ctx.db.query.comments.findFirst({
          where: eq(comments.id, input.highlightedCommentId),
          with: {
            user: {
              columns: {
                name: true,
                image: true,
                role: true,
                id: true
              }
            },
            rates: {
              where: eq(rates.userId, session?.user.id ?? '')
            }
          },
          columns: {
            id: true,
            userId: true,
            parentId: true,
            body: true,
            createdAt: true,
            isDeleted: true
          }
        })

        if (highlightedComment) query.unshift(highlightedComment)
      }

      const result = await Promise.all(
        query.map(async (comment) => {
          const replies = await ctx.db
            .select({
              value: count()
            })
            .from(comments)
            .where(eq(comments.parentId, comment.id))

          const selfRate = comment.rates.length > 0 ? comment.rates[0] : null
          const likes = await ctx.db
            .select({
              value: count()
            })
            .from(rates)
            .where(and(eq(rates.commentId, comment.id), eq(rates.like, true)))
          const dislikes = await ctx.db
            .select({
              value: count()
            })
            .from(rates)
            .where(and(eq(rates.commentId, comment.id), eq(rates.like, false)))

          const defaultImage = getDefaultImage(comment.user.id)

          return {
            ...comment,
            body: comment.body,
            replies: replies[0]?.value ?? 0,
            likes: likes[0]?.value ?? 0,
            dislikes: dislikes[0]?.value ?? 0,
            liked: selfRate?.like ?? null,
            user: {
              ...comment.user,
              image: comment.user.image ?? defaultImage,
              name: comment.user.name
            }
          }
        })
      )

      return {
        comments: result,
        nextCursor: result.at(-1)?.createdAt ?? null
      }
    }),
  getTotalCommentsCount: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)

      const { success } = await ratelimit.limit(getKey(`getTotalCommentsCount:${ip}`))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const value = await ctx.db
        .select({
          value: count()
        })
        .from(comments)
        .where(eq(comments.postId, input.slug))

      return {
        comments: value[0]?.value ?? 0
      }
    }),
  getCommentsCount: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)

      const { success } = await ratelimit.limit(getKey(`getCommentsCount:${ip}`))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const value = await ctx.db
        .select({
          value: count()
        })
        .from(comments)
        .where(and(eq(comments.postId, input.slug), isNull(comments.parentId)))

      return {
        comments: value[0]?.value ?? 0
      }
    }),
  getRepliesCount: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const ip = getIp(ctx.headers)

      const { success } = await ratelimit.limit(getKey(`getRepliesCount:${ip}`))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const value = await ctx.db
        .select({
          value: count()
        })
        .from(comments)
        .where(and(eq(comments.postId, input.slug), isNotNull(comments.parentId)))

      return {
        replies: value[0]?.value ?? 0
      }
    }),
  post: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        content: z.string().min(1),
        date: z.string().min(1),
        parentId: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user

      const { success } = await ratelimit.limit(getKey(`post:${user.id}`))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const commentId = createId()

      const page = allPosts.find((post) => post.slug === input.slug)

      if (!page) throw new TRPCError({ code: 'NOT_FOUND', message: 'Blog post not found' })

      const title = page.title
      const defaultImage = getDefaultImage(user.id)

      const userProfile = {
        name: user.name,
        image: user.image ?? defaultImage
      }

      const post = {
        title,
        url: `https://yuricunha.com/blog/${input.slug}`
      }

      await ctx.db.transaction(async (tx) => {
        await tx.insert(comments).values({
          id: commentId,
          body: input.content,
          userId: user.id,
          postId: input.slug,
          parentId: input.parentId
        })

        // Notify the author of the blog post via email
        if (!input.parentId && user.role === 'user') {
          if (!isProduction || !resend) return

          await resend.emails.send({
            from: 'yuricunha.com <me@yuricunha.com>',
            to: env.AUTHOR_EMAIL,
            subject: 'New comment on your blog post',
            react: Comment({
              comment: input.content,
              commenter: userProfile,
              id: `comment=${commentId}`,
              date: input.date,
              post
            })
          })
        }

        // Notify the parent comment owner via email
        if (input.parentId) {
          if (!isProduction || !resend) return

          const parentComment = await tx.query.comments.findFirst({
            where: eq(comments.id, input.parentId),
            with: {
              user: true
            }
          })

          if (parentComment && parentComment.user.email !== user.email) {
            await resend.emails.send({
              from: 'yuricunha.com <me@yuricunha.com>',
              to: parentComment.user.email,
              subject: 'New reply to your comment',
              react: Reply({
                reply: input.content,
                replier: userProfile,
                comment: parentComment.body,
                id: `comment=${input.parentId}&reply=${commentId}`,
                date: input.date,
                post
              })
            })
          }
        }
      })
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user

      const { success } = await ratelimit.limit(getKey(`delete:${user.id}`))

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const email = ctx.session.user.email

      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.id),
        with: {
          user: true,
          replies: true,
          parent: true
        }
      })

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found'
        })
      }

      // Check if the user is the owner of the comment
      if (comment.user.email !== email) {
        throw new TRPCError({
          code: 'UNAUTHORIZED'
        })
      }

      // If the comment has replies, just mark it as deleted.
      // And keep the replies.
      if (comment.replies.length > 0) {
        await ctx.db.update(comments).set({ isDeleted: true }).where(eq(comments.id, input.id))

        return
      }

      // Otherwise, delete the comment
      await ctx.db.delete(comments).where(eq(comments.id, input.id))

      // Case: deleting a reply
      if (comment.parentId) {
        const parentComment = await ctx.db.query.comments.findFirst({
          where: and(eq(comments.id, comment.parentId), eq(comments.isDeleted, true)),
          with: {
            replies: true
          }
        })

        // If the parent comment (which is marked as deleted) has no replies, delete it also.
        if (parentComment?.replies.length === 0) {
          await ctx.db.delete(comments).where(eq(comments.id, comment.parentId))
        }
      }
    })
})

export type GetInfiniteCommentsInput = RouterInputs['comments']['getInfiniteComments']
export type GetInfiniteCommentsOutput = RouterOutputs['comments']['getInfiniteComments']
export type GetCommentsOutput = RouterOutputs['comments']['getComments']
