'use client'

import { useState } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'

import { api } from '@/trpc/react'

import TimeRangeToggle from './time-range-toggle'

const Stat = ({
  label,
  value,
  suffix = ''
}: {
  label: string
  value: number | null | undefined
  suffix?: string
}) => (
  <div className='bg-muted/50 flex flex-col rounded-lg p-3'>
    <span className='text-muted-foreground text-xs'>{label}</span>
    <span className='text-lg font-semibold'>
      {value ?? '—'}
      {suffix}
    </span>
  </div>
)

const AudioFeaturesSummary = () => {
  const t = useTranslations()
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>(
    'short_term'
  )

  const {
    data: summary,
    isLoading,
    error,
    refetch,
    isRefetching
  } = api.spotify.getAudioFeaturesSummaryByRange.useQuery(
    { time_range: timeRange },
    {
      staleTime: 300_000
    }
  )

  const fmtPercent = (v: number | null | undefined) => {
    if (typeof v !== 'number') return null
    return Math.round(v * 100)
  }

  const fmtTempo = (v: number | null | undefined) => {
    if (typeof v !== 'number') return null
    return Math.round(v)
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base sm:text-lg'>
              {t('spotify.audio.title') || 'Audio Features'}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.audio.subtitle') || 'Averages for your top tracks'}
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
            <button
              type='button'
              onClick={() => refetch()}
              disabled={isRefetching}
              className='text-muted-foreground hover:text-foreground text-xs disabled:opacity-50 sm:text-sm'
            >
              {t('spotify.refresh')}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='bg-muted/30 h-[62px] animate-pulse rounded-lg' />
            ))}
          </div>
        ) : error ? (
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-sm'>{t('spotify.error')}</p>
            <button
              type='button'
              onClick={() => refetch()}
              disabled={isRefetching}
              className='text-muted-foreground hover:text-foreground text-sm disabled:opacity-50'
            >
              {t('spotify.refresh')}
            </button>
          </div>
        ) : !summary || summary.sampleSize === 0 ? (
          <p className='text-muted-foreground text-sm'>{t('spotify.no-data')}</p>
        ) : (
          <div className='space-y-3'>
            <p className='text-muted-foreground text-xs'>{`n=${summary.sampleSize}`}</p>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              <Stat
                label={t('spotify.audio.danceability') || 'Danceability'}
                value={fmtPercent(summary.danceability)}
                suffix='%'
              />
              <Stat
                label={t('spotify.audio.energy') || 'Energy'}
                value={fmtPercent(summary.energy)}
                suffix='%'
              />
              <Stat
                label={t('spotify.audio.valence') || 'Valence'}
                value={fmtPercent(summary.valence)}
                suffix='%'
              />
              <Stat
                label={t('spotify.audio.tempo') || 'Tempo'}
                value={fmtTempo(summary.tempo)}
                suffix=' bpm'
              />
              <Stat
                label={t('spotify.audio.acousticness') || 'Acousticness'}
                value={fmtPercent(summary.acousticness)}
                suffix='%'
              />
              <Stat
                label={t('spotify.audio.instrumentalness') || 'Instrumentalness'}
                value={fmtPercent(summary.instrumentalness)}
                suffix='%'
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AudioFeaturesSummary
