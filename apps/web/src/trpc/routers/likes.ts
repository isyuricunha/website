import { TRPCError } from '@trpc/server'
import { eq, likesSessions, lte, posts, sql, sum } from '@isyuricunha/db'
import { env } from '@isyuricunha/env'
import { ratelimit, redis, redisKeys } from '@isyuricunha/kv'
import { sha512 } from 'js-sha512'
import { z } from 'zod'

import { getIp } from '@/utils/get-ip'

import { createTRPCRouter, publicProcedure } from '../trpc'

const getSessionId = (slug: string, ip: string): string => {
  const currentUserId = sha512(ip + env.IP_ADDRESS_SALT)

  return `${slug}___${currentUserId}`
}

const getKey = (id: string) => `likes:${id}`

const likesSlugSchema = z.object({
  slug: z.string().min(1)
})

const likesPatchSchema = z.object({
  slug: z.string().min(1),
  value: z.number().int().positive().min(1).max(3)
})

export const likesRouter = createTRPCRouter({
  getCount: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(`getCount:${ip}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const cachedLikeCount = await redis.get<number>(redisKeys.postLikeCount)

    if (typeof cachedLikeCount === 'number') {
      return {
        likes: cachedLikeCount
      }
    }

    // Aggregate over posts directly: it is a small table and avoids the
    // cartesian blowup of aggregating likesSessions against it (the previous
    // form multiplied the total by the number of posts).
    const result = await ctx.db
      .select({
        value: sum(posts.likes)
      })
      .from(posts)

    const likes = result[0]?.value ? Number(result[0].value) : 0

    await redis.set(redisKeys.postLikeCount, likes, { ex: 60 })

    return {
      likes
    }
  }),
  get: publicProcedure.input(likesSlugSchema).query(async ({ ctx, input }) => {
    const ip = getIp(ctx.headers)
    const sessionId = getSessionId(input.slug, ip)

    const { success } = await ratelimit.limit(getKey(`get:${sessionId}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const cachedLikes = await redis.get<number>(redisKeys.postLikes(input.slug))
    const cachedCurrentUserLikes = await redis.get<number>(
      redisKeys.currentUserLikes(input.slug, sessionId)
    )

    if (typeof cachedLikes === 'number' && typeof cachedCurrentUserLikes === 'number') {
      return {
        likes: cachedLikes,
        currentUserLikes: cachedCurrentUserLikes
      }
    }

    const [post, user] = await Promise.all([
      ctx.db
        .select({
          likes: posts.likes
        })
        .from(posts)
        .where(eq(posts.slug, input.slug)),
      ctx.db
        .select({
          likes: likesSessions.likes
        })
        .from(likesSessions)
        .where(eq(likesSessions.id, sessionId))
    ])

    await redis.set(redisKeys.postLikes(input.slug), post[0]?.likes ?? 0, { ex: 60 })
    await redis.set(redisKeys.currentUserLikes(input.slug, sessionId), user[0]?.likes ?? 0, {
      ex: 60
    })

    return {
      likes: post[0]?.likes ?? 0,
      currentUserLikes: user[0]?.likes ?? 0
    }
  }),
  patch: publicProcedure.input(likesPatchSchema).mutation(async ({ ctx, input }) => {
    const ip = getIp(ctx.headers)
    const sessionId = getSessionId(input.slug, ip)

    const { success } = await ratelimit.limit(getKey(`patch:${sessionId}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    // The 3-like cap is enforced inside the upsert (setWhere) so concurrent
    // requests cannot both pass a read-then-write check; the transaction keeps
    // posts.likes and likesSessions.likes consistent under the same commit.
    const result = await ctx.db.transaction(async (tx) => {
      const upserted = await tx
        .insert(likesSessions)
        .values({
          id: sessionId,
          likes: input.value
        })
        .onConflictDoUpdate({
          target: likesSessions.id,
          set: {
            likes: sql<number>`${likesSessions.likes} + ${input.value}`
          },
          setWhere: lte(likesSessions.likes, 3 - input.value)
        })
        .returning({ likes: likesSessions.likes })

      const currentUserLikes = upserted[0]?.likes
      if (typeof currentUserLikes !== 'number') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only like a post 3 times'
        })
      }

      const updated = await tx
        .update(posts)
        .set({
          likes: sql<number>`${posts.likes} + ${input.value}`
        })
        .where(eq(posts.slug, input.slug))
        .returning({ likes: posts.likes })

      const postLikes = updated[0]?.likes
      if (typeof postLikes !== 'number') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })
      }

      return { postLikes, currentUserLikes }
    })

    await redis.set(redisKeys.postLikes(input.slug), result.postLikes, { ex: 60 })
    await redis.set(redisKeys.currentUserLikes(input.slug, sessionId), result.currentUserLikes, {
      ex: 60
    })

    // Drop the cached site-wide total so the next getCount recomputes it.
    await redis.del(redisKeys.postLikeCount)
  })
})
