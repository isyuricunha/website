'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { PlayIcon, ClockIcon } from 'lucide-react'
import { useState } from 'react'

import { api } from '@/trpc/react'
import { exportJson, exportRecentlyPlayedCsv } from '@/utils/exporters/spotify'

import Link from '../link'
import SpotifyImage from './spotify-image'

const RecentlyPlayedSection = () => {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: tracks, refetch, isLoading, error } = api.spotify.getRecentlyPlayed.useQuery(
    undefined,
    {
      staleTime: 300000 // 5 minutes
    }
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleExportCsv = () => {
    if (tracks && tracks.length) exportRecentlyPlayedCsv(tracks as any)
  }

  const handleExportJson = () => {
    if (tracks) exportJson('recently-played.json', tracks)
  }

  const formatTimeAgo = (playedAt: string) => {
    const now = new Date()
    const played = new Date(playedAt)
    const diffInMinutes = Math.floor((now.getTime() - played.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return played.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.recently-played.title')}</CardTitle>
          <CardDescription>{t('spotify.recently-played.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <div className='h-12 w-12 animate-pulse rounded-lg bg-muted' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-48 animate-pulse rounded bg-muted' />
                  <div className='h-3 w-32 animate-pulse rounded bg-muted' />
                </div>
                <div className='h-3 w-16 animate-pulse rounded bg-muted' />
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
          <CardTitle>{t('spotify.recently-played.title')}</CardTitle>
          <CardDescription>{t('spotify.recently-played.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground'>{t('spotify.error')}</p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='text-sm text-muted-foreground hover:text-foreground disabled:opacity-50'
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
          <CardTitle>{t('spotify.recently-played.title')}</CardTitle>
          <CardDescription>{t('spotify.recently-played.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground'>{t('spotify.recently-played.no-data')}</p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='text-sm text-muted-foreground hover:text-foreground disabled:opacity-50'
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
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base sm:text-lg'>{t('spotify.recently-played.title')}</CardTitle>
            <CardDescription className='text-xs sm:text-sm'>{t('spotify.recently-played.subtitle')}</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleExportCsv}
              className='px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              title={t('spotify.export.csv')}
            >
              CSV
            </button>
            <button
              onClick={handleExportJson}
              className='px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              title={t('spotify.export.json')}
            >
              JSON
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='text-sm text-muted-foreground hover:text-foreground disabled:opacity-50'
            >
              {t('spotify.refresh')}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {tracks.map((track) => (
            <Link
              key={`${track.id}-${track.playedAt}`}
              href={track.url}
              className='group flex items-center space-x-4 rounded-lg p-2 transition-colors hover:bg-muted/50'
            >
              <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg'>
                <SpotifyImage
                  src={track.albumImage}
                  alt={`${track.album} album cover`}
                  fallbackIcon={<PlayIcon className='h-4 w-4 text-muted-foreground' />}
                  width={48}
                  height={48}
                  sizes='48px'
                />
              </div>

              <div className='min-w-0 flex-1'>
                <h3 className='truncate text-sm sm:text-base font-medium group-hover:text-primary'>
                  {track.name}
                </h3>
                <p className='truncate text-xs sm:text-sm text-muted-foreground'>
                  {track.artist} • {track.album}
                </p>
              </div>

              <div className='flex flex-shrink-0 items-center space-x-2 text-right'>
                <ClockIcon className='h-4 w-4 text-muted-foreground' />
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {formatTimeAgo(track.playedAt)}
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

export default RecentlyPlayedSection
