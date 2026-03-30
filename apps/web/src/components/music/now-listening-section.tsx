'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import { Music, PlayIcon } from 'lucide-react'
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
            <div className='relative flex h-6 w-6 items-center justify-center'>
              {currentTrack.isPlaying ? (
                <div className='flex items-end gap-[3px] h-4'>
                  <div className='w-[4px] bg-primary animate-music-bar-1 opacity-80' />
                  <div className='w-[4px] bg-primary animate-music-bar-2 opacity-80' />
                  <div className='w-[4px] bg-primary animate-music-bar-3 opacity-80' />
                </div>
              ) : (
                <Music className='h-5 w-5 text-muted-foreground opacity-50' />
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

export default NowListeningSection
