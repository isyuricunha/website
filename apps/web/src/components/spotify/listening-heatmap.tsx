"use client"

import { useMemo, Fragment } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { api } from '@/trpc/react'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const cellColors = (v: number, max: number) => {
  const ratio = max === 0 ? 0 : v / max
  if (ratio === 0) return 'bg-muted'
  if (ratio < 0.25) return 'bg-emerald-200 dark:bg-emerald-900/50'
  if (ratio < 0.5) return 'bg-emerald-300 dark:bg-emerald-800/60'
  if (ratio < 0.75) return 'bg-emerald-400 dark:bg-emerald-700/70'
  return 'bg-emerald-500 dark:bg-emerald-600'
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
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[48px_repeat(24,1fr)] gap-1">
                <div />
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="text-center text-[10px] text-muted-foreground">{h}</div>
                ))}
                {grid.map((row, dayIdx) => (
                  <Fragment key={`row-${dayIdx}`}>
                    <div key={`d-${dayIdx}`} className="text-xs text-muted-foreground pt-1">{days[dayIdx]}</div>
                    {row.map((v, h) => (
                      <div key={`${dayIdx}-${h}`} className={`h-4 rounded ${cellColors(v, max)}`} title={`${days[dayIdx]} ${h}:00 — ${v}`} />
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ListeningHeatmap
