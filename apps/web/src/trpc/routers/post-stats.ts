import { inArray, posts } from '@isyuricunha/db'
import { ratelimit } from '@isyuricunha/kv'
import { allPosts } from 'content-collections'
import { z } from 'zod'

import { getIp } from '@/utils/get-ip'

import { enforceRateLimit } from '../rate-limit'
import { createTRPCRouter, publicProcedure } from '../trpc'

const knownSlugs = new Set(allPosts.map((post) => post.slug))
const slugSchema = z.string().min(1).max(160)
const batchInputSchema = z.object({ slugs: z.array(slugSchema).max(32) })

export const postStatsRouter = createTRPCRouter({
  // One read for all visible cards instead of two procedures per card.
  // Only public, aggregate counts are returned. User-specific likes remain
  // on the existing likes.get endpoint used by the interactive post view.
  getBatch: publicProcedure.input(batchInputSchema).query(async ({ ctx, input }) => {
    await enforceRateLimit(ratelimit, `post-stats:batch:${getIp(ctx.headers)}`)

    const uniqueSlugs = new Set(input.slugs)
    const slugs: string[] = []
    for (const slug of uniqueSlugs) {
      if (knownSlugs.has(slug)) slugs.push(slug)
    }
    const counts: Record<string, { views: number; likes: number }> = {}
    for (const slug of slugs) counts[slug] = { views: 0, likes: 0 }
    if (slugs.length === 0) return counts

    const rows = await ctx.db
      .select({ slug: posts.slug, views: posts.views, likes: posts.likes })
      .from(posts)
      .where(inArray(posts.slug, slugs))

    for (const row of rows) {
      counts[row.slug] = { views: row.views ?? 0, likes: row.likes ?? 0 }
    }
    return counts
  })
})
