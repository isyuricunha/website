'use client'

import { useMemo } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import { api } from '@/trpc/react'

// Day keys for i18n lookups (Sun..Sat)
const dayKeys: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat'
]

const cellColors = (v: number, max: number) => {
  // Opacity-based single hue (orange) for a cleaner look
  const ratio = max === 0 ? 0 : v / max
  if (ratio === 0) return 'bg-muted/40'
  if (ratio < 0.25) return 'bg-primary/10'
  if (ratio < 0.5) return 'bg-primary/20'
  if (ratio < 0.75) return 'bg-primary/30'
  return 'bg-primary/40'
}

const ListeningHeatmap = () => {
  const t = useTranslations()
  const td = (key: string) => (t as any)(key) as string
  const {
    data: tracks,
    isLoading,
    error,
    refetch,
    isRefetching
  } = api.spotify.getRecentlyPlayed.useQuery(undefined, { staleTime: 300_000 })

  // Aggregate plays per weekday (0=Sun..6=Sat) for a simpler, compact heatmap
  const { byDay, max } = useMemo(() => {
    const byDay = Array.from({ length: 7 }).fill(0) as number[]
    for (const tr of tracks ?? []) {
      const d = new Date(tr.playedAt)
      const idx = d.getDay()
      if (typeof byDay[idx] === 'number') {
        byDay[idx] = (byDay[idx] ?? 0) + 1
      }
    }
    const max = byDay.reduce((m, v) => Math.max(m, v), 0)
    return { byDay, max }
  }, [tracks])

  return (
    <Card>
      <CardHeader>
        {/* Title and subtitle */}
        <div>
          <CardTitle className='text-base sm:text-lg'>
            {t('spotify.heatmap.title') || 'Listening Heatmap'}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.heatmap.subtitle') || 'Hourly activity by day (recent plays)'}
          </CardDescription>
        </div>
        {/* Controls row beneath title, wraps on small screens; extra spacing for clarity */}
        <div className='mt-6 flex flex-wrap items-center gap-5 sm:gap-7'>
          <button
            type='button'
            onClick={() => refetch()}
            disabled={isRefetching}
            className='text-muted-foreground hover:text-foreground text-sm disabled:opacity-50'
          >
            {t('spotify.refresh')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 7 }).map((_, r) => (
              <div key={r} className='bg-muted h-5 w-full animate-pulse rounded' />
            ))}
          </div>
        ) : error ? (
          <p className='text-muted-foreground text-sm'>{t('spotify.error')}</p>
        ) : tracks?.length ? (
          // Per-day compact heatmap: horizontal row of 7 cells with labels below
          <div className='space-y-6'>
            {/* Cells + labels aligned per column with a subtle background track */}
            <div className='relative grid w-full grid-cols-7 gap-3 sm:gap-4'>
              {/* background track (height adapts roughly to cell size) */}
              <div
                aria-hidden
                className='bg-muted/25 pointer-events-none absolute inset-x-0 top-[38%] -z-10 h-9 -translate-y-1/2 rounded-md sm:top-[40%] sm:h-11'
              />
              {byDay.map((v, dayIdx) => {
                const dayKey = dayKeys[dayIdx] ?? 'sun'

                return (
                  <div key={`col-${dayIdx}`} className='flex flex-col items-center gap-2'>
                    <div
                      className={`ring-border/50 aspect-square w-full rounded-md ${cellColors(v, max)} hover:ring-primary/30 ring-1 transition duration-150 hover:scale-[1.04] hover:ring-4`}
                      title={`${td(`spotify.heatmap.days.${dayKey}`) || dayKey.toUpperCase()} — ${v}`}
                    />
                    <div className='text-muted-foreground text-center text-[11px] leading-none'>
                      {td(`spotify.heatmap.days.${dayKey}`) || dayKey.slice(0, 3).toUpperCase()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend: communicates scale without taking much space */}
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-[10px]'>
                {t('spotify.heatmap.legend.low') || 'Low'}
              </span>
              <div className='flex items-center gap-0.5'>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`ring-border/50 h-3 w-3 rounded-[3px] ${['bg-muted/40', 'bg-primary/10', 'bg-primary/20', 'bg-primary/30', 'bg-primary/40'][i]} ring-1`}
                  />
                ))}
              </div>
              <span className='text-muted-foreground text-[10px]'>
                {t('spotify.heatmap.legend.high') || 'High'}
              </span>
            </div>
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>{t('spotify.no-data') || 'No data'}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default ListeningHeatmap
