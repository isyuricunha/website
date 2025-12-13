'use client'

import { useState } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
          <Stat label={t('spotify.audio.danceability') || 'Danceability'} value={null} />
          <Stat label={t('spotify.audio.energy') || 'Energy'} value={null} />
          <Stat label={t('spotify.audio.valence') || 'Valence'} value={null} />
          <Stat label={t('spotify.audio.tempo') || 'Tempo'} value={null} suffix=' bpm' />
          <Stat label={t('spotify.audio.acousticness') || 'Acousticness'} value={null} />
          <Stat label={t('spotify.audio.instrumentalness') || 'Instrumentalness'} value={null} />
        </div>
      </CardContent>
    </Card>
  )
}

export default AudioFeaturesSummary
