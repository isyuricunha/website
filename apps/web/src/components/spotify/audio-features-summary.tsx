"use client"

import { useState, useMemo } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { api } from '@/trpc/react'
import TimeRangeToggle from './time-range-toggle'

const Stat = ({ label, value, suffix = '' }: { label: string; value: number | null | undefined; suffix?: string }) => (
  <div className="flex flex-col p-3 rounded-lg bg-muted/50">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-lg font-semibold">{value ?? '—'}{suffix}</span>
  </div>
)

const AudioFeaturesSummary = () => {
  const t = useTranslations()
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('short_term')
  const { data, isLoading, error, refetch, isRefetching } = api.spotify.getAudioFeaturesForTopTracks.useQuery(
    { time_range: timeRange },
    { staleTime: 300000 }
  )

  const aggregates = data?.aggregates

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">{t('spotify.audio.title') || 'Audio Features'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t('spotify.audio.subtitle') || 'Averages for your top tracks'}</CardDescription>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{t('spotify.error')}</p>
        ) : !aggregates ? (
          <p className="text-sm text-muted-foreground">{t('spotify.no-data') || 'No data'}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label={t('spotify.audio.danceability') || 'Danceability'} value={aggregates.danceability} />
            <Stat label={t('spotify.audio.energy') || 'Energy'} value={aggregates.energy} />
            <Stat label={t('spotify.audio.valence') || 'Valence'} value={aggregates.valence} />
            <Stat label={t('spotify.audio.tempo') || 'Tempo'} value={aggregates.tempo} suffix=" bpm" />
            <Stat label={t('spotify.audio.acousticness') || 'Acousticness'} value={aggregates.acousticness} />
            <Stat label={t('spotify.audio.instrumentalness') || 'Instrumentalness'} value={aggregates.instrumentalness} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AudioFeaturesSummary
