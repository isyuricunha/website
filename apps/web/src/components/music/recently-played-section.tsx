'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import { PlayIcon, ClockIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

import { api } from '@/trpc/react'
import { exportJson, exportRecentlyPlayedCsv } from '@/utils/exporters/music'

import Link from '../link'
import MusicImage from './music-image'

const RecentlyPlayedSection = () => {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    data: tracks,
    refetch,
    isLoading,
    error
  } = api.lastfm.getRecentlyPlayed.useQuery(undefined, {
    staleTime: 300_000 // 5 minutes
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleExportCsv = () => {
    if (tracks && tracks.length > 0) exportRecentlyPlayedCsv(tracks)
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
                <div className='bg-muted h-12 w-12 animate-pulse rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <div className='bg-muted h-4 w-48 animate-pulse rounded' />
                  <div className='bg-muted h-3 w-32 animate-pulse rounded' />
                </div>
                <div className='bg-muted h-3 w-16 animate-pulse rounded' />
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
          <CardTitle>{t('spotify.recently-played.title')}</CardTitle>
          <CardDescription>{t('spotify.recently-played.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground'>{t('spotify.recently-played.no-data')}</p>
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
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base sm:text-lg'>
              {t('spotify.recently-played.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.recently-played.subtitle')}
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {tracks.map((track: any) => (
            <Link
              key={`${track.id}-${track.playedAt}`}
              href={track.url}
              className='hover:bg-muted/50 group flex items-center space-x-4 rounded-lg p-2 transition-colors'
            >
              <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg'>
                <MusicImage
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

              <div className='flex flex-shrink-0 items-center space-x-2 text-right'>
                <ClockIcon className='text-muted-foreground h-4 w-4' />
                <p className='text-muted-foreground text-xs sm:text-sm'>
                  {isMounted ? formatTimeAgo(track.playedAt) : '...'}
                </p>
              </div>

              <div className='flex-shrink-0'>
                <svg
                  stroke='currentColor'
                  fill='currentColor'
                  strokeWidth='0'
                  viewBox='0 0 496 512'
                  height='16'
                  width='16'
                  xmlns='http://www.w3.org/2000/svg'
                  aria-label='Last.fm'
                  className='text-primary'
                >
                  <path d='M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm49.1 346.7c-15.8 4.3-33-3.6-32.9-20.9 0-38.3 43-44.5 43.1-80.1.1-16.1-9.9-25.1-23.7-25.1-13.4 0-21.5 8.1-30.8 19.3L231.7 266.6 216.9 247.5c-9.1-13.2-19.1-17.5-31.5-17.5-16.1 0-27.1 11-27.1 27.2s12.5 27.3 27 27.3c10.3 0 17.6-4.5 24.1-12.2l14.9 18.7c-13.3 11-23.7 17.5-41.9 17.5-31.2 0-51.4-24.3-51.4-53.7s19.8-54 53.6-54c20.3 0 33 9.4 46.5 24.1l11.4 12.8 11.4-12.8c12.2-13.6 27.3-24.1 48.6-24.1 32 0 49.3 22 49.3 48.1.1 44.9-50.3 54.4-50.1 82.2 0 18.3 18.9 22.3 33.3 17.6l2.1 15.1z' />
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
