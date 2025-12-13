'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import { api } from '@/trpc/react'
import TimeRangeToggle from './time-range-toggle'

const Bar = ({ label, value, max }: { label: string; value: number; max: number }) => (
  <div className='flex items-center gap-3'>
    <div className='text-muted-foreground w-28 truncate text-xs' title={label}>
      {label}
    </div>
    <div className='bg-muted h-2 flex-1 overflow-hidden rounded'>
      <div
        className='bg-primary h-full'
        style={{ width: `${(value / Math.max(max, 1)) * 100}%` }}
      />
    </div>
    <div className='text-muted-foreground w-8 text-right text-xs'>{value}</div>
  </div>
)

const GenreDistribution = () => {
  const t = useTranslations()
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>(
    'short_term'
  )
  const {
    data: artists,
    isLoading,
    error,
    refetch,
    isRefetching
  } = api.spotify.getTopArtistsByRange.useQuery({ time_range: timeRange }, { staleTime: 300_000 })

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
        {/* Title and subtitle */}
        <div>
          <CardTitle className='text-base sm:text-lg'>
            {t('spotify.genre.title') || 'Genre Distribution'}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.genre.subtitle') || 'Top genres from your top artists'}
          </CardDescription>
        </div>
        {/* Controls row beneath title, wraps on small screens */}
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
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
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='bg-muted h-4 animate-pulse rounded' />
            ))}
          </div>
        ) : error ? (
          <p className='text-muted-foreground text-sm'>{t('spotify.error')}</p>
        ) : topGenres.length === 0 ? (
          <p className='text-muted-foreground text-sm'>{t('spotify.no-data') || 'No data'}</p>
        ) : (
          <div className='space-y-2'>
            {topGenres.map((g) => (
              <Bar key={g.genre} label={g.genre} value={g.count} max={maxCount} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GenreDistribution
