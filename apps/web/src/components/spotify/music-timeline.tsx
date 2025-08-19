'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Clock, Calendar, TrendingUp, Music } from 'lucide-react'
import { useState, useMemo } from 'react'

import { api } from '@/trpc/react'
import Link from '../link'
import SpotifyImage from './spotify-image'

const MusicTimeline = () => {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: recentTracks } = api.spotify.getRecentlyPlayed.useQuery()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setIsRefreshing(false)
  }

  // Group tracks by time periods
  const timelineData = useMemo(() => {
    if (!recentTracks) return []

    const now = new Date()
    const groups: { [key: string]: any[] } = {
      'last-hour': [],
      'today': [],
      'yesterday': [],
      'this-week': [],
      'earlier': []
    }

    recentTracks.forEach(track => {
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

  if (!recentTracks || recentTracks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            {t('spotify.timeline.title')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.timeline.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <Music className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <p className='text-sm text-muted-foreground'>{t('spotify.timeline.empty')}</p>
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
            <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              {t('spotify.timeline.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.timeline.subtitle')}
            </CardDescription>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='text-xs sm:text-sm text-muted-foreground hover:text-foreground disabled:opacity-50'
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
              <div className='flex items-center gap-2 mb-4'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-primary/10'>
                  {period === 'last-hour' ? (
                    <Clock className='h-4 w-4 text-primary' />
                  ) : (
                    <Calendar className='h-4 w-4 text-primary' />
                  )}
                </div>
                <h3 className='text-sm sm:text-base font-semibold'>{t(`spotify.timeline.periods.${period}`)}</h3>
                <span className='text-xs sm:text-sm text-muted-foreground'>
                  {t('spotify.timeline.count', { count: tracks.length, label: t(`spotify.timeline.labels.${tracks.length === 1 ? 'track' : 'tracks'}`) })}
                </span>
              </div>

              {/* Timeline Items */}
              <div className='ml-4 border-l-2 border-muted pl-6 space-y-4'>
                {tracks.slice(0, 5).map((track, index) => (
                  <div key={`${track.id}-${track.playedAt}`} className='relative'>
                    {/* Timeline Dot */}
                    <div className='absolute -left-[1.75rem] top-2 w-3 h-3 rounded-full bg-primary border-2 border-background' />
                    
                    {/* Track Item */}
                    <Link
                      href={track.url}
                      className='group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors'
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
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-xs sm:text-sm font-medium truncate group-hover:text-primary'>
                          {track.name}
                        </h4>
                        <p className='text-[10px] sm:text-xs text-muted-foreground truncate'>
                          {track.artist} • {track.album}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-[10px] sm:text-xs text-muted-foreground'>
                          {formatTime(track.playedAt)}
                        </p>
                        <p className='text-[10px] sm:text-xs text-muted-foreground'>
                          {formatDate(track.playedAt)}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
                
                {/* Show more indicator */}
                {tracks.length > 5 && (
                  <div className='relative'>
                    <div className='absolute -left-[1.75rem] top-2 w-3 h-3 rounded-full bg-muted border-2 border-background' />
                    <div className='p-3 text-center'>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
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
        <div className='mt-6 pt-6 border-t'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
                <span className='text-xs sm:text-sm text-muted-foreground'>{t('spotify.timeline.labels.total-tracks')}</span>
              </div>
              <p className='text-lg sm:text-xl font-bold'>{recentTracks.length}</p>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2 mb-1'>
                <Music className='h-4 w-4 text-muted-foreground' />
                <span className='text-xs sm:text-sm text-muted-foreground'>{t('spotify.timeline.labels.unique-artists')}</span>
              </div>
              <p className='text-lg sm:text-xl font-bold'>
                {new Set(recentTracks.map(track => track.artist)).size}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MusicTimeline
