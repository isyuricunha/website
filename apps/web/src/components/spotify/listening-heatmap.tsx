"use client"

import { useMemo, Fragment } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { api } from '@/trpc/react'

// Short day labels; keep concise for compact layout
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const cellColors = (v: number, max: number) => {
  // Opacity-based scale on a single hue looks cleaner and more consistent
  const ratio = max === 0 ? 0 : v / max
  if (ratio === 0) return 'bg-muted/40'
  if (ratio < 0.25) return 'bg-emerald-500/25'
  if (ratio < 0.5) return 'bg-emerald-500/45'
  if (ratio < 0.75) return 'bg-emerald-500/65'
  return 'bg-emerald-500/85'
}

const ListeningHeatmap = () => {
  const t = useTranslations()
  const { data: tracks, isLoading, error, refetch, isRefetching } = api.spotify.getRecentlyPlayed.useQuery(
    undefined,
    { staleTime: 300000 }
  )

  const { grid, max } = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0)) as number[][]
    for (const tr of tracks ?? []) {
      const d = new Date(tr.playedAt)
      const day = d.getDay()
      const hour = d.getHours()
      grid[day][hour] += 1
    }
    const max = grid.reduce((m, row) => Math.max(m, ...row), 0)
    return { grid, max }
  }, [tracks])

  return (
    <Card>
      <CardHeader>
        {/* Title and subtitle */}
        <div>
          <CardTitle className="text-base sm:text-lg">{t('spotify.heatmap.title') || 'Listening Heatmap'}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t('spotify.heatmap.subtitle') || 'Hourly activity by day (recent plays)'}</CardDescription>
        </div>
        {/* Controls row beneath title, wraps on small screens */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
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
          // Compact, aesthetically improved grid: small rounded cells, subtle border, hover feedback,
          // selective hour labels to reduce clutter, and a tiny legend for context.
          <div className="space-y-3 overflow-x-auto">
            <div>
              {/* 32px day label column + 24 fixed-width columns */}
              <div className="grid grid-cols-[32px_repeat(24,12px)] gap-0.5">
                {/* Hour labels row */}
                <div />
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="flex items-center justify-center">
                    {/* Show major labels at 0,6,12,18; small ticks otherwise */}
                    {([0, 6, 12, 18] as number[]).includes(h) ? (
                      <span className="text-[9px] leading-none text-muted-foreground">{h}</span>
                    ) : (
                      <span className="block h-[6px] w-px bg-muted-foreground/30" />
                    )}
                  </div>
                ))}

                {/* Day rows */}
                {grid.map((row, dayIdx) => (
                  <Fragment key={`row-${dayIdx}`}>
                    <div key={`d-${dayIdx}`} className="text-[10px] text-muted-foreground pt-0.5">{days[dayIdx]}</div>
                    {row.map((v, h) => (
                      <div
                        key={`${dayIdx}-${h}`}
                        className={`h-3 w-3 rounded-[3px] ${cellColors(v, max)} ring-1 ring-black/5 dark:ring-white/5 transition-transform duration-150 hover:scale-110`}
                        title={`${days[dayIdx]} ${String(h).padStart(2, '0')}:00 — ${v}`}
                      />
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Legend: communicates scale without taking much space */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{t('spotify.heatmap.legend.low') || 'Low'}</span>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-[3px] ${['bg-muted/40','bg-emerald-500/25','bg-emerald-500/45','bg-emerald-500/65','bg-emerald-500/85'][i]} ring-1 ring-black/5 dark:ring-white/5`}
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
