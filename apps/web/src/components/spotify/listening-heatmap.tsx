"use client"

import { useMemo } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { api } from '@/trpc/react'

// Day keys for i18n lookups (Sun..Sat)
const dayKeys: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const cellColors = (v: number, max: number) => {
  // Opacity-based single hue (orange) for a cleaner look
  const ratio = max === 0 ? 0 : v / max
  if (ratio === 0) return 'bg-muted/40'
  if (ratio < 0.25) return 'bg-orange-500/25'
  if (ratio < 0.5) return 'bg-orange-500/45'
  if (ratio < 0.75) return 'bg-orange-500/65'
  return 'bg-orange-500/85'
}

const ListeningHeatmap = () => {
  const t = useTranslations()
  const { data: tracks, isLoading, error, refetch, isRefetching } = api.spotify.getRecentlyPlayed.useQuery(
    undefined,
    { staleTime: 300000 }
  )

  // Aggregate plays per weekday (0=Sun..6=Sat) for a simpler, compact heatmap
  const { byDay, max } = useMemo(() => {
    const byDay = Array(7).fill(0) as number[]
    for (const tr of tracks ?? []) {
      const d = new Date(tr.playedAt)
      byDay[d.getDay()] += 1
    }
    const max = byDay.reduce((m, v) => Math.max(m, v), 0)
    return { byDay, max }
  }, [tracks])

  return (
    <Card>
      <CardHeader>
        {/* Title and subtitle */}
        <div>
          <CardTitle className="text-base sm:text-lg">{t('spotify.heatmap.title') || 'Listening Heatmap'}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t('spotify.heatmap.subtitle') || 'Hourly activity by day (recent plays)'}</CardDescription>
        </div>
        {/* Controls row beneath title, wraps on small screens; extra spacing for clarity */}
        <div className="mt-6 flex flex-wrap items-center gap-5 sm:gap-7">
          <button onClick={() => refetch()} disabled={isRefetching} className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
            {t('spotify.refresh')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, r) => (
              <div key={r} className="h-5 w-full rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{t('spotify.error')}</p>
        ) : !tracks?.length ? (
          <p className="text-sm text-muted-foreground">{t('spotify.no-data') || 'No data'}</p>
        ) : (
          // Per-day compact heatmap: horizontal row of 7 cells with labels below
          <div className="space-y-6">
            {/* Cells + labels aligned per column with a subtle background track */}
            <div className="relative grid w-full grid-cols-7 gap-3 sm:gap-4">
              {/* background track (height adapts roughly to cell size) */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[38%] sm:top-[40%] h-9 sm:h-11 -translate-y-1/2 rounded-md bg-muted/25 -z-10" />
              {byDay.map((v, dayIdx) => (
                <div key={`col-${dayIdx}`} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-full aspect-square rounded-md ${cellColors(v, max)} ring-1 ring-black/5 dark:ring-white/5 transition duration-150 hover:scale-[1.04] hover:shadow-[0_0_0_4px_rgba(249,115,22,0.25)]`}
                    title={`${t(`spotify.heatmap.days.${dayKeys[dayIdx]}`) || dayKeys[dayIdx].toUpperCase()} — ${v}`}
                  />
                  <div className="text-center text-[11px] leading-none text-muted-foreground">
                    {t(`spotify.heatmap.days.${dayKeys[dayIdx]}`) || dayKeys[dayIdx].slice(0, 3).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend: communicates scale without taking much space */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{t('spotify.heatmap.legend.low') || 'Low'}</span>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-[3px] ${['bg-muted/40','bg-orange-500/25','bg-orange-500/45','bg-orange-500/65','bg-orange-500/85'][i]} ring-1 ring-black/5 dark:ring-white/5`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">{t('spotify.heatmap.legend.high') || 'High'}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ListeningHeatmap
