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
  }),

  // Rolling stats for a range. The documented `last_year` range matches the
  // recap page's rolling 12-month window (verified against the current API
  // docs; the older `last_12_months` range no longer exists).
  getStats: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    const { success } = await ratelimit.limit(getKey(`${ip}:stats`))

    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

    try {
      const res = await fetch('https://api.wakatime.com/api/v1/users/current/stats/last_year', {
        headers: {
          Authorization: `Basic ${Buffer.from(env.WAKATIME_API_KEY).toString('base64')}`
        },
        signal: AbortSignal.timeout(10_000)
      })

      if (!res.ok) {
        return null
      }

      const { data } = await res.json()

      return {
        isUpToDate: Boolean(data.is_up_to_date),
        range: (data.range as string | undefined) ?? null,
        totalSeconds:
          (data.total_seconds_including_other_language as number | undefined) ??
          (data.total_seconds as number | undefined) ??
          0,
        humanReadableTotal:
          (data.human_readable_total_including_other_language as string | undefined) ??
          (data.human_readable_total as string | undefined) ??
          null,
        dailyAverageSeconds:
          (data.daily_average_including_other_language as number | undefined) ??
          (data.daily_average as number | undefined) ??
          0,
        humanReadableDailyAverage:
          (data.human_readable_daily_average_including_other_language as string | undefined) ??
          (data.human_readable_daily_average as string | undefined) ??
          null,
        languages: ((data.languages ?? []) as Array<Record<string, unknown>>)
          .slice(0, 5)
          .map((language) => ({
            name: language.name as string,
            percent: language.percent as number,
            text: language.text as string
          })),
        projects: ((data.projects ?? []) as Array<Record<string, unknown>>)
          .slice(0, 5)
          .map((project) => ({
            name: project.name as string,
            percent: project.percent as number,
            text: project.text as string
          }))
      }
    } catch {
      return null
    }
  })
})
