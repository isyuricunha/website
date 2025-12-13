'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import { PlayIcon } from 'lucide-react'
import { useState } from 'react'

import { api } from '@/trpc/react'
import TimeRangeToggle from './time-range-toggle'
import { exportJson, exportTopTracksCsv } from '@/utils/exporters/spotify'

import Link from '../link'
import SpotifyImage from './spotify-image'

const TopSongsSection = () => {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>(
    'short_term'
  )

  const {
    data: tracks,
    refetch,
    isLoading,
    error
  } = api.spotify.getTopTracksByRange.useQuery({ time_range: timeRange }, { staleTime: 300_000 })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60_000)
    const seconds = Math.floor((ms % 60_000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleExportCsv = () => {
    if (tracks && tracks.length > 0) exportTopTracksCsv(tracks)
  }

  const handleExportJson = () => {
    if (tracks) exportJson('top-tracks.json', tracks)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.top-songs.title')}</CardTitle>
          <CardDescription>{t('spotify.top-songs.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <div className='bg-muted h-12 w-12 animate-pulse rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <div className='bg-muted h-4 w-48 animate-pulse rounded' />
                  <div className='bg-muted h-3 w-32 animate-pulse rounded' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.top-songs.title')}</CardTitle>
          <CardDescription>{t('spotify.top-songs.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground'>{t('spotify.error')}</p>
            <button
              type='button'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='text-muted-foreground hover:text-foreground text-sm disabled:opacity-50'
            >
              {t('spotify.refresh')}
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!tracks || tracks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.top-songs.title')}</CardTitle>
          <CardDescription>{t('spotify.top-songs.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground'>{t('spotify.top-songs.no-data')}</p>
            <button
              type='button'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='text-muted-foreground hover:text-foreground text-sm disabled:opacity-50'
            >
              {t('spotify.refresh')}
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        {/* Title and subtitle */}
        <div>
          <CardTitle className='text-base sm:text-lg'>{t('spotify.top-songs.title')}</CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.top-songs.subtitle')}
          </CardDescription>
        </div>
        {/* Controls row beneath title, wraps on small screens */}
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          <button
            type='button'
            onClick={handleExportCsv}
            className='text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-2 py-1 text-xs transition-colors'
            title={t('spotify.export.csv')}
          >
            CSV
          </button>
          <button
            type='button'
            onClick={handleExportJson}
            className='text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-2 py-1 text-xs transition-colors'
            title={t('spotify.export.json')}
          >
            JSON
          </button>
          <button
            type='button'
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='text-muted-foreground hover:text-foreground text-sm disabled:opacity-50'
          >
            {t('spotify.refresh')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {tracks.map((track: any, index: number) => (
            <Link
              key={track.id}
              href={track.url}
              className='hover:bg-muted/50 group flex items-center space-x-4 rounded-lg p-2 transition-colors'
            >
              <div className='bg-muted text-muted-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-sm font-medium'>
                {index + 1}
              </div>

              <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg'>
                <SpotifyImage
                  src={track.albumImage}
                  alt={`${track.album} album cover`}
                  fallbackIcon={<PlayIcon className='text-muted-foreground h-4 w-4' />}
                  width={48}
                  height={48}
                  sizes='48px'
                />
              </div>

              <div className='min-w-0 flex-1'>
                <h3 className='group-hover:text-primary truncate text-sm font-medium sm:text-base'>
                  {track.name}
                </h3>
                <p className='text-muted-foreground truncate text-xs sm:text-sm'>
                  {track.artist} • {track.album}
                </p>
              </div>

              <div className='flex-shrink-0 text-right'>
                <p className='text-muted-foreground text-xs sm:text-sm'>
                  {formatDuration(track.duration)}
                </p>
                <p className='text-muted-foreground text-[10px] sm:text-xs'>
                  {track.popularity}% {t('spotify.listeners')}
                </p>
              </div>

              <div className='flex-shrink-0'>
                <svg
                  stroke='currentColor'
                  fill='#1ed760'
                  strokeWidth='0'
                  viewBox='0 0 496 512'
                  height='16'
                  width='16'
                  xmlns='http://www.w3.org/2000/svg'
                  aria-label='Spotify'
                >
                  <path d='M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z' />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopSongsSection
