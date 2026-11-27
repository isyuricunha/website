import { and, eq, rates } from '@isyuricunha/db'
import { ratelimit } from '@isyuricunha/kv'
import { z } from 'zod'

import { enforceRateLimit } from '../rate-limit'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const getKey = (id: string) => `rates:${id}`

const rateSetSchema = z.object({
  id: z.string(),
  like: z.boolean().nullable()
})

export const ratesRouter = createTRPCRouter({
  set: protectedProcedure.input(rateSetSchema).mutation(async ({ ctx, input }) => {
    const user = ctx.session.user

    await enforceRateLimit(ratelimit, getKey(`set:${user.id}`))

    if (input.like === null) {
      await ctx.db
        .delete(rates)
        .where(and(eq(rates.commentId, input.id), eq(rates.userId, user.id)))

      return
    }

    await ctx.db
      .insert(rates)
      .values({
        commentId: input.id,
        userId: user.id,
        like: input.like
      })
      .onConflictDoUpdate({
        target: [rates.userId, rates.commentId],
        set: {
          like: input.like
        }
      })
  })
})
