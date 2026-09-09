import { TRPCError } from '@trpc/server'
import { env } from '@isyuricunha/env'
import { ratelimit } from '@isyuricunha/kv'

import { getIp } from '@/utils/get-ip'

import { createTRPCRouter, publicProcedure } from '../trpc'

const getKey = (id: string) => `wakatime:${id}`

export const wakatimeRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)

    const { success } = await ratelimit.limit(getKey(ip))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    // Same resilience contract as the lastfm/github routers: bounded request
    // and graceful degradation instead of an unhandled 500.
    try {
      const res = await fetch('https://wakatime.com/api/v1/users/current/all_time_since_today', {
        headers: {
          Authorization: `Basic ${Buffer.from(env.WAKATIME_API_KEY).toString('base64')}`
        },
        signal: AbortSignal.timeout(10_000)
      })

      if (!res.ok) {
        return { seconds: 0 }
      }

      const {
        data: { total_seconds }
      } = await res.json()

      return {
        seconds: total_seconds as number
      }
    } catch {
      return { seconds: 0 }
    }
  })
})
