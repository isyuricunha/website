'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
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

    // Calculate total listening time (estimated from recent tracks)
    const totalMinutes = recentTracks.reduce((acc, track) => acc + (track.duration || 180000), 0) / 60000
    const totalHours = Math.round(totalMinutes / 60)

    // Extract top genres from artists
    const genreCount: Record<string, number> = {}
    topArtists.forEach(artist => {
      if (artist.genres) {
        artist.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1
        })
      }
    })

    const topGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre)

    // Calculate average track popularity
    const avgPopularity = Math.round(
      topTracks.reduce((acc, track) => acc + (track.popularity || 0), 0) / topTracks.length
    )

    // Calculate diversity score (unique artists in top tracks)
    const uniqueArtists = new Set(topTracks.map(track => track.artist)).size
    const diversityScore = Math.round((uniqueArtists / topTracks.length) * 100)

    return {
      totalHours,
      topGenres,
      avgPopularity,
      diversityScore,
      totalTracks: topTracks.length,
      totalArtists: topArtists.length
    }
  }, [topTracks, topArtists, recentTracks])

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            {t('spotify.stats.title')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.stats.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='text-center space-y-2'>
                <div className='h-8 w-8 mx-auto animate-pulse rounded-full bg-muted' />
                <div className='h-4 w-16 mx-auto animate-pulse rounded bg-muted' />
                <div className='h-3 w-12 mx-auto animate-pulse rounded bg-muted' />
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
            <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              {t('spotify.stats.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.stats.subtitle')}
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
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {/* Total Listening Time */}
          <div className='text-center space-y-2'>
            <div className='mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
              <Clock className='h-6 w-6 text-primary' />
            </div>
            <div>
              <p className='text-lg sm:text-xl font-bold'>{stats.totalHours}h</p>
              <p className='text-xs sm:text-sm text-muted-foreground'>{t('spotify.stats.labels.total-hours')}</p>
            </div>
          </div>

          {/* Track Diversity */}
          <div className='text-center space-y-2'>
            <div className='mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center'>
              <TrendingUp className='h-6 w-6 text-green-500' />
            </div>
            <div>
              <p className='text-lg sm:text-xl font-bold'>{stats.diversityScore}%</p>
              <p className='text-xs sm:text-sm text-muted-foreground'>{t('spotify.stats.labels.diversity')}</p>
            </div>
          </div>

          {/* Average Popularity */}
          <div className='text-center space-y-2'>
            <div className='mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center'>
              <Headphones className='h-6 w-6 text-yellow-500' />
            </div>
            <div>
              <p className='text-lg sm:text-xl font-bold'>{stats.avgPopularity}%</p>
              <p className='text-xs sm:text-sm text-muted-foreground'>{t('spotify.stats.labels.avg-popularity')}</p>
            </div>
          </div>

          {/* Total Artists */}
          <div className='text-center space-y-2'>
            <div className='mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center'>
              <Music className='h-6 w-6 text-purple-500' />
            </div>
            <div>
              <p className='text-lg sm:text-xl font-bold'>{stats.totalArtists}</p>
              <p className='text-xs sm:text-sm text-muted-foreground'>{t('spotify.stats.labels.top-artists')}</p>
            </div>
          </div>
        </div>

        {/* Top Genres */}
        {stats.topGenres.length > 0 && (
          <div className='mt-6 pt-6 border-t'>
            <h4 className='text-sm sm:text-base font-semibold mb-3 flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              {t('spotify.stats.labels.top-genres')}
            </h4>
            <div className='flex flex-wrap gap-2'>
              {stats.topGenres.map((genre, index) => (
                <span
                  key={genre}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
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
