'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import { BarChart3, Clock, Music, TrendingUp, Headphones, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'

import { api } from '@/trpc/react'

const MusicStatsSection = () => {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: topArtists } = api.spotify.getTopArtists.useQuery()
  const { data: topTracks } = api.spotify.getTopTracks.useQuery()
  const { data: recentTracks } = api.spotify.getRecentlyPlayed.useQuery()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Refresh would be handled by parent component
    setIsRefreshing(false)
  }

  // Calculate listening statistics
  const stats = useMemo(() => {
    if (!topTracks || !topArtists || !recentTracks) return null

    const totalTracks = topTracks.length

    // Calculate total listening time (estimated from recent tracks)
    const totalMinutes =
      recentTracks.reduce((acc: number, track: any) => acc + (track.duration || 180_000), 0) /
      60_000
    const totalHours = Math.round(totalMinutes / 60)

    // Extract top genres from artists
    const genreCount: Record<string, number> = {}
    topArtists.forEach((artist: any) => {
      if (artist.genres) {
        artist.genres.forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1
        })
      }
    })

    const topGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre)

    // Calculate average track popularity
    const avgPopularity =
      totalTracks === 0
        ? 0
        : Math.round(
            topTracks.reduce((acc: number, track: any) => acc + (track.popularity || 0), 0) /
              totalTracks
          )

    // Calculate diversity score (unique artists in top tracks)
    const uniqueArtists =
      totalTracks === 0 ? 0 : new Set(topTracks.map((track: any) => track.artist)).size
    const diversityScore = totalTracks === 0 ? 0 : Math.round((uniqueArtists / totalTracks) * 100)

    return {
      totalHours,
      topGenres,
      avgPopularity,
      diversityScore,
      totalTracks,
      totalArtists: topArtists.length
    }
  }, [topTracks, topArtists, recentTracks])

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <BarChart3 className='h-5 w-5' />
            {t('spotify.stats.title')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.stats.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='space-y-2 text-center'>
                <div className='bg-muted mx-auto h-8 w-8 animate-pulse rounded-full' />
                <div className='bg-muted mx-auto h-4 w-16 animate-pulse rounded' />
                <div className='bg-muted mx-auto h-3 w-12 animate-pulse rounded' />
              </div>
            ))}
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
              <BarChart3 className='h-5 w-5' />
              {t('spotify.stats.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.stats.subtitle')}
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
        <div className='grid grid-cols-2 gap-6 md:grid-cols-4'>
          {/* Total Listening Time */}
          <div className='space-y-2 text-center'>
            <div className='bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
              <Clock className='text-primary h-6 w-6' />
            </div>
            <div>
              <p className='text-lg font-bold sm:text-xl'>{stats.totalHours}h</p>
              <p className='text-muted-foreground text-xs sm:text-sm'>
                {t('spotify.stats.labels.total-hours')}
              </p>
            </div>
          </div>

          {/* Track Diversity */}
          <div className='space-y-2 text-center'>
            <div className='bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
              <TrendingUp className='text-primary h-6 w-6' />
            </div>
            <div>
              <p className='text-lg font-bold sm:text-xl'>{stats.diversityScore}%</p>
              <p className='text-muted-foreground text-xs sm:text-sm'>
                {t('spotify.stats.labels.diversity')}
              </p>
            </div>
          </div>

          {/* Average Popularity */}
          <div className='space-y-2 text-center'>
            <div className='bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
              <Headphones className='text-primary h-6 w-6' />
            </div>
            <div>
              <p className='text-lg font-bold sm:text-xl'>{stats.avgPopularity}%</p>
              <p className='text-muted-foreground text-xs sm:text-sm'>
                {t('spotify.stats.labels.avg-popularity')}
              </p>
            </div>
          </div>

          {/* Total Artists */}
          <div className='space-y-2 text-center'>
            <div className='bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
              <Music className='text-primary h-6 w-6' />
            </div>
            <div>
              <p className='text-lg font-bold sm:text-xl'>{stats.totalArtists}</p>
              <p className='text-muted-foreground text-xs sm:text-sm'>
                {t('spotify.stats.labels.top-artists')}
              </p>
            </div>
          </div>
        </div>

        {/* Top Genres */}
        {stats.topGenres.length > 0 && (
          <div className='mt-6 border-t pt-6'>
            <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold sm:text-base'>
              <Calendar className='h-4 w-4' />
              {t('spotify.stats.labels.top-genres')}
            </h4>
            <div className='flex flex-wrap gap-2'>
              {stats.topGenres.map((genre, index) => (
                <span
                  key={genre}
                  className={`rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${
                    index === 0
                      ? 'bg-primary text-primary-foreground'
                      : index === 1
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  #{index + 1} {genre}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MusicStatsSection
