import { TRPCError } from '@trpc/server'
import { allPosts } from 'content-collections'
import { eq, posts, sql, sum } from '@isyuricunha/db'
import { ratelimit, redis, redisKeys } from '@isyuricunha/kv'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { getIp } from '@/utils/get-ip'
import { is_bot_user_agent } from '@/lib/spam-detection'

import { createTRPCRouter, publicProcedure } from '../trpc'

const getKey = (id: string) => `views:${id}`

// Precomputed once at module load: increment runs per page view, so checking
// membership must stay O(1) instead of scanning the whole content collection.
const postSlugSet = new Set(allPosts.map((post) => post.slug))

const slugInputSchema = z.object({ slug: z.string().min(1) })

export const viewsRouter = createTRPCRouter({
  getCount: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(`getCount:${ip}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const cachedViewCount = await redis.get<number>(redisKeys.postViewCount)

    if (typeof cachedViewCount === 'number') {
      return {
        views: cachedViewCount
      }
    }

    const result = await ctx.db
      .select({
        value: sum(posts.views)
      })
      .from(posts)

    const value = result[0]?.value ? Number(result[0].value) : 0

    await redis.set(redisKeys.postViewCount, value, { ex: 60 })

    return {
      views: value
    }
  }),
  get: publicProcedure.input(slugInputSchema).query(async ({ ctx, input }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(`get:${ip}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const cachedViews = await redis.get<number>(redisKeys.postViews(input.slug))

    if (typeof cachedViews === 'number') {
      return {
        views: cachedViews
      }
    }

    const post = await ctx.db
      .select({ views: posts.views })
      .from(posts)
      .where(eq(posts.slug, input.slug))

    const views = post[0]?.views ?? 0

    await redis.set(redisKeys.postViews(input.slug), views, { ex: 60 })

    return {
      views
    }
  }),
  increment: publicProcedure.input(slugInputSchema).mutation(async ({ ctx, input }) => {
    // Crawlers and duplicated client calls (the blog header can mount twice)
    // must not inflate view counts. Checked BEFORE the rate limiter so bot
    // traffic does not burn a real visitor's quota for the same IP.
    // A missing user agent counts as noise here.
    const user_agent = ctx.headers.get('user-agent')
    if (!user_agent || is_bot_user_agent(user_agent)) {
      return
    }

    // Trust only platform headers (x-vercel-forwarded-for / cf-connecting-ip);
    // the raw x-forwarded-for is client-controlled and would let callers rotate
    // the rate-limit key to bypass it entirely.
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(`increment:${ip}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    // Only count views for slugs that actually exist in the content collection;
    // otherwise public calls would create rows for arbitrary invented slugs.
    if (!postSlugSet.has(input.slug)) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })
    }

    // One view per IP+slug per minute, which also absorbs a double mount.
    // On Vercel the platform headers are always present. Readers sharing a
    // public IP (carrier CGNAT, offices) collapse into one view per window,
    // so this metric under-reports shared-IP audiences by design: a stable
    // undercount is preferable to counting one reader many times.
    // If the upsert below throws, the key still expires on its own within
    // 60s, so a failed write cannot lock a slug out permanently.
    const dedupe_key = `views:increment:dedupe:${ip}:${input.slug}`
    const first_view_in_window = await redis.set(dedupe_key, '1', { nx: true, ex: 60 })
    if (!first_view_in_window) {
      return
    }

    const upserted = await ctx.db
      .insert(posts)
      .values({
        id: randomUUID(),
        slug: input.slug,
        views: 1
      })
      .onConflictDoUpdate({
        target: posts.slug,
        set: {
          views: sql<number>`${posts.views} + 1`
        }
      })
      .returning({ views: posts.views })

    const nextViews = upserted[0]?.views
    if (typeof nextViews === 'number') {
      await redis.set(redisKeys.postViews(input.slug), nextViews, { ex: 60 })
    }

    // The global counter caches SUM(posts.views); dropping it makes the next
    // getCount recompute from the database instead of serving a stale total.
    await redis.del(redisKeys.postViewCount)
  })
})
