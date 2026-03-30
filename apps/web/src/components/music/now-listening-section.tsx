'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import { PlayIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { api } from '@/trpc/react'

import Link from '../link'
import MusicImage from './music-image'

const NowListeningSection = () => {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: currentTrack,
    refetch,
    isLoading,
    error
  } = api.lastfm.getCurrentlyPlaying.useQuery(undefined, {
    refetchInterval: 60_000, // Refresh every 60 seconds
    staleTime: 30_000 // Consider data stale after 30 seconds
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  // Auto-refresh when component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 60_000)

    return () => clearInterval(interval)
  }, [refetch])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.now-listening.title')}</CardTitle>
          <CardDescription>{t('spotify.now-listening.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-4'>
            <div className='bg-muted h-16 w-16 animate-pulse rounded-lg' />
            <div className='space-y-2'>
              <div className='bg-muted h-4 w-48 animate-pulse rounded' />
              <div className='bg-muted h-3 w-32 animate-pulse rounded' />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.now-listening.title')}</CardTitle>
          <CardDescription>{t('spotify.now-listening.subtitle')}</CardDescription>
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

  if (!currentTrack) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.now-listening.title')}</CardTitle>
          <CardDescription>{t('spotify.now-listening.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground'>{t('spotify.now-listening.not-playing')}</p>
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
              {t('spotify.now-listening.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.now-listening.subtitle')}
            </CardDescription>
          </div>
          <button
            type='button'
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='text-muted-foreground hover:text-foreground text-xs disabled:opacity-50 sm:text-sm'
          >
            {t('spotify.refresh')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href={currentTrack.songUrl}
          className='hover:bg-muted/50 group flex items-center space-x-4 rounded-lg p-4 transition-colors'
        >
          <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg'>
            <MusicImage
              src={currentTrack.albumImage}
              alt={`${currentTrack.album} album cover`}
              fallbackIcon={<PlayIcon className='text-muted-foreground h-6 w-6' />}
              width={64}
              height={64}
              sizes='64px'
            />
            {currentTrack.isPlaying && (
              <div className='bg-background/20 absolute inset-0 flex items-center justify-center'>
                <div className='flex space-x-1'>
                  <div className='bg-foreground/80 h-1 w-1 animate-pulse rounded-full'></div>
                  <div className='animation-delay-150 bg-foreground/80 h-1 w-1 animate-pulse rounded-full'></div>
                  <div className='animation-delay-300 bg-foreground/80 h-1 w-1 animate-pulse rounded-full'></div>
                </div>
              </div>
            )}
          </div>

          <div className='min-w-0 flex-1'>
            <h3 className='group-hover:text-primary truncate text-sm font-medium sm:text-base'>
              {currentTrack.name}
            </h3>
            <p className='text-muted-foreground truncate text-xs sm:text-sm'>
              {currentTrack.artist} {t('spotify.now-listening.by')} {currentTrack.album}
            </p>
          </div>

          <div className='flex-shrink-0'>
            <svg
              stroke='currentColor'
              fill='currentColor'
              strokeWidth='0'
              viewBox='0 0 496 512'
              height='20'
              width='20'
              xmlns='http://www.w3.org/2000/svg'
              aria-label='Last.fm'
              className='text-primary'
            >
              <path d='M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm49.1 346.7c-15.8 4.3-33-3.6-32.9-20.9 0-38.3 43-44.5 43.1-80.1.1-16.1-9.9-25.1-23.7-25.1-13.4 0-21.5 8.1-30.8 19.3L231.7 266.6 216.9 247.5c-9.1-13.2-19.1-17.5-31.5-17.5-16.1 0-27.1 11-27.1 27.2s12.5 27.3 27 27.3c10.3 0 17.6-4.5 24.1-12.2l14.9 18.7c-13.3 11-23.7 17.5-41.9 17.5-31.2 0-51.4-24.3-51.4-53.7s19.8-54 53.6-54c20.3 0 33 9.4 46.5 24.1l11.4 12.8 11.4-12.8c12.2-13.6 27.3-24.1 48.6-24.1 32 0 49.3 22 49.3 48.1.1 44.9-50.3 54.4-50.1 82.2 0 18.3 18.9 22.3 33.3 17.6l2.1 15.1z' />
            </svg>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

export default NowListeningSection
