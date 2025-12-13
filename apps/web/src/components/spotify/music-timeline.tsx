'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Clock, Calendar, TrendingUp, Music } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

import { api } from '@/trpc/react'
import Link from '../link'
import SpotifyImage from './spotify-image'

const MusicTimeline = () => {
  const t = useTranslations()
  const td = (key: string, values?: Record<string, any>) => (t as any)(key, values) as string
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    data: recentTracks,
    refetch,
    isLoading,
    error
  } = api.spotify.getRecentlyPlayed.useQuery(undefined, {
    staleTime: 300_000 // 5 minutes
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  type RecentTrack = NonNullable<typeof recentTracks>[number]
  type Period = 'last-hour' | 'today' | 'yesterday' | 'this-week' | 'earlier'

  // Group tracks by time periods
  const timelineData = useMemo(() => {
    if (!recentTracks) return []

    const now = new Date()
    const groups: Record<Period, RecentTrack[]> = {
      'last-hour': [],
      today: [],
      yesterday: [],
      'this-week': [],
      earlier: []
    }

    recentTracks.forEach((track: RecentTrack) => {
      const playedAt = new Date(track.playedAt)
      const diffInHours = (now.getTime() - playedAt.getTime()) / (1000 * 60 * 60)
      const diffInDays = diffInHours / 24

      if (diffInHours < 1) {
        groups['last-hour'].push(track)
      } else if (diffInDays < 1) {
        groups['today'].push(track)
      } else if (diffInDays < 2) {
        groups['yesterday'].push(track)
      } else if (diffInDays < 7) {
        groups['this-week'].push(track)
      } else {
        groups['earlier'].push(track)
      }
    })

    return Object.entries(groups)
      .filter(([, tracks]) => tracks.length > 0)
      .map(([period, tracks]) => ({ period, tracks }))
  }, [recentTracks])

  const formatTime = (playedAt: string) => {
    const date = new Date(playedAt)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (playedAt: string) => {
    const date = new Date(playedAt)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <Clock className='h-5 w-5' />
            {t('spotify.timeline.title')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.timeline.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='space-y-3'>
                <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                <div className='ml-4 space-y-3'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-muted h-10 w-10 animate-pulse rounded-lg' />
                    <div className='flex-1 space-y-2'>
                      <div className='bg-muted h-3 w-40 animate-pulse rounded' />
                      <div className='bg-muted h-3 w-24 animate-pulse rounded' />
                    </div>
                  </div>
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
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <Clock className='h-5 w-5' />
            {t('spotify.timeline.title')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.timeline.subtitle')}
          </CardDescription>
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

  if (!recentTracks || recentTracks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <Clock className='h-5 w-5' />
            {t('spotify.timeline.title')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.timeline.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center'>
            <Music className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-sm'>{t('spotify.timeline.empty')}</p>
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
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Clock className='h-5 w-5' />
              {t('spotify.timeline.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.timeline.subtitle')}
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
        <div className='space-y-6'>
          {timelineData.map(({ period, tracks }) => (
            <div key={period} className='relative'>
              {/* Timeline Header */}
              <div className='mb-4 flex items-center gap-2'>
                <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full'>
                  {period === 'last-hour' ? (
                    <Clock className='text-primary h-4 w-4' />
                  ) : (
                    <Calendar className='text-primary h-4 w-4' />
                  )}
                </div>
                <h3 className='text-sm font-semibold sm:text-base'>
                  {td(`spotify.timeline.periods.${period}`)}
                </h3>
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  {td('spotify.timeline.count', {
                    count: tracks.length,
                    label: td(`spotify.timeline.labels.${tracks.length === 1 ? 'track' : 'tracks'}`)
                  })}
                </span>
              </div>

              {/* Timeline Items */}
              <div className='border-muted ml-4 space-y-4 border-l-2 pl-6'>
                {tracks.slice(0, 5).map((track) => (
                  <div key={`${track.id}-${track.playedAt}`} className='relative'>
                    {/* Timeline Dot */}
                    <div className='bg-primary border-background absolute -left-[1.75rem] top-2 h-3 w-3 rounded-full border-2' />

                    {/* Track Item */}
                    <Link
                      href={track.url}
                      className='hover:bg-muted/50 group flex items-center gap-3 rounded-lg p-3 transition-colors'
                    >
                      <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg'>
                        <SpotifyImage
                          src={track.albumImage}
                          alt={`${track.album} album cover`}
                          width={40}
                          height={40}
                          sizes='40px'
                        />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h4 className='group-hover:text-primary truncate text-xs font-medium sm:text-sm'>
                          {track.name}
                        </h4>
                        <p className='text-muted-foreground truncate text-[10px] sm:text-xs'>
                          {track.artist} • {track.album}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-muted-foreground text-[10px] sm:text-xs'>
                          {isMounted ? formatTime(track.playedAt) : '...'}
                        </p>
                        <p className='text-muted-foreground text-[10px] sm:text-xs'>
                          {isMounted ? formatDate(track.playedAt) : '...'}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}

                {/* Show more indicator */}
                {tracks.length > 5 && (
                  <div className='relative'>
                    <div className='bg-muted border-background absolute -left-[1.75rem] top-2 h-3 w-3 rounded-full border-2' />
                    <div className='p-3 text-center'>
                      <p className='text-muted-foreground text-xs sm:text-sm'>
                        {t('spotify.timeline.more-tracks', { count: tracks.length - 5 })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Stats */}
        <div className='mt-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <div className='mb-1 flex items-center justify-center gap-2'>
                <TrendingUp className='text-muted-foreground h-4 w-4' />
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  {t('spotify.timeline.labels.total-tracks')}
                </span>
              </div>
              <p className='text-lg font-bold sm:text-xl'>{recentTracks.length}</p>
            </div>
            <div className='text-center'>
              <div className='mb-1 flex items-center justify-center gap-2'>
                <Music className='text-muted-foreground h-4 w-4' />
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  {t('spotify.timeline.labels.unique-artists')}
                </span>
              </div>
              <p className='text-lg font-bold sm:text-xl'>
                {new Set(recentTracks.map((track: any) => track.artist)).size}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MusicTimeline
