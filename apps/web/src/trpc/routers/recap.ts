import { allPosts } from 'content-collections'
import { TRPCError } from '@trpc/server'
import { desc, gt, posts } from '@isyuricunha/db'
import { ratelimit } from '@isyuricunha/kv'
import { z } from 'zod'

import { getIp } from '@/utils/get-ip'

import { createTRPCRouter, publicProcedure } from '../trpc'

const getKey = (id: string) => `recap:${id}`

const MILLIS_PER_DAY = 24 * 60 * 60 * 1000
const ROLLING_WINDOW_DAYS = 365

const topInputSchema = z.object({
  locale: z.string().min(1).default('en'),
  limit: z.number().int().min(1).max(10).default(5)
})

type PostDocument = {
  slug: string
  locale: string
  title: string
  date: string
}

/**
 * Resolves the best document for a stats row: prefer the requested locale,
 * then the default locale, then any existing translation. Views and likes
 * are tracked per slug in the database, so a slug is the join key between
 * stats rows and content documents.
 */
const pickDocument = (slug: string, locale: string): PostDocument | null => {
  const candidates = allPosts.filter((post) => post.slug === slug)

  if (candidates.length === 0) return null

  return (
    candidates.find((post) => post.locale === locale) ??
    candidates.find((post) => post.locale === 'en') ??
    candidates[0] ??
    null
  )
}

export const recapRouter = createTRPCRouter({
  /**
   * Distinct post counts. Posts exist as one document per translation, so
   * counts must dedupe by slug instead of by document.
   */
  summary: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(`summary:${ip}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const publishedAtBySlug = new Map<string, number>()

    for (const post of allPosts) {
      const time = new Date(post.date).getTime()
      if (Number.isNaN(time)) continue
      if (!publishedAtBySlug.has(post.slug)) publishedAtBySlug.set(post.slug, time)
    }

    const windowStart = Date.now() - ROLLING_WINDOW_DAYS * MILLIS_PER_DAY
    let postsLastTwelveMonths = 0

    for (const time of publishedAtBySlug.values()) {
      if (time >= windowStart) postsLastTwelveMonths += 1
    }

    return {
      totalPosts: publishedAtBySlug.size,
      postsLastTwelveMonths
    }
  }),

  topViewed: publicProcedure.input(topInputSchema).query(async ({ ctx, input }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(`topViewed:${ip}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const rows = await ctx.db
      .select({
        slug: posts.slug,
        views: posts.views
      })
      .from(posts)
      .where(gt(posts.views, 0))
      .orderBy(desc(posts.views))
      .limit(input.limit)

    return rows.flatMap((row) => {
      const document = pickDocument(row.slug, input.locale)
      if (!document) return []

      return [
        {
          slug: document.slug,
          locale: document.locale,
          title: document.title,
          views: row.views
        }
      ]
    })
  }),

  topLiked: publicProcedure.input(topInputSchema).query(async ({ ctx, input }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(`topLiked:${ip}`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    const rows = await ctx.db
      .select({
        slug: posts.slug,
        likes: posts.likes
      })
      .from(posts)
      .where(gt(posts.likes, 0))
      .orderBy(desc(posts.likes))
      .limit(input.limit)

    return rows.flatMap((row) => {
      const document = pickDocument(row.slug, input.locale)
      if (!document) return []

      return [
        {
          slug: document.slug,
          locale: document.locale,
          title: document.title,
          likes: row.likes
        }
      ]
    })
  })
})
