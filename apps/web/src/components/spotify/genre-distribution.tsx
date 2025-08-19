"use client"

import { useState, useMemo } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { api } from '@/trpc/react'
import TimeRangeToggle from './time-range-toggle'

const Bar = ({ label, value, max }: { label: string; value: number; max: number }) => (
  <div className="flex items-center gap-3">
    <div className="w-28 truncate text-xs text-muted-foreground" title={label}>{label}</div>
    <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
      <div className="h-full bg-primary" style={{ width: `${(value / Math.max(max, 1)) * 100}%` }} />
    </div>
    <div className="w-8 text-right text-xs text-muted-foreground">{value}</div>
  </div>
)

const GenreDistribution = () => {
  const t = useTranslations()
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('short_term')
  const { data: artists, isLoading, error, refetch, isRefetching } = api.spotify.getTopArtistsByRange.useQuery(
    { time_range: timeRange },
    { staleTime: 300000 }
  )

  const topGenres = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of artists ?? []) {
      for (const g of a.genres ?? []) map.set(g, (map.get(g) ?? 0) + 1)
    }
    const arr = Array.from(map.entries()).map(([genre, count]) => ({ genre, count }))
    arr.sort((a, b) => b.count - a.count)
    return arr.slice(0, 12)
  }, [artists])

  const maxCount = topGenres[0]?.count ?? 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">{t('spotify.genre.title') || 'Genre Distribution'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t('spotify.genre.subtitle') || 'Top genres from your top artists'}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
            <button onClick={() => refetch()} disabled={isRefetching} className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
              {t('spotify.refresh')}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{t('spotify.error')}</p>
        ) : !topGenres.length ? (
          <p className="text-sm text-muted-foreground">{t('spotify.no-data') || 'No data'}</p>
        ) : (
          <div className="space-y-2">
            {topGenres.map((g) => (
              <Bar key={g.genre} label={g.genre} value={g.count} max={maxCount} />)
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GenreDistribution
