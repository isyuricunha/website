'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Brain, Zap, Heart, Volume2, Star, TrendingUp } from 'lucide-react'
import { useState, useMemo } from 'react'

import { api } from '@/trpc/react'

const MusicTasteAnalysis = () => {
  const t = useTranslations()
  const td = (key: string) => (t as any)(key) as string
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: topArtists } = api.spotify.getTopArtists.useQuery()
  const { data: topTracks } = api.spotify.getTopTracks.useQuery()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setIsRefreshing(false)
  }

  // Analyze music taste patterns
  const analysis = useMemo(() => {
    if (!topTracks || !topArtists) return null

    // Energy analysis based on track popularity and artist diversity
    const avgPopularity =
      topTracks.reduce((acc: number, track: any) => acc + (track.popularity || 0), 0) /
      topTracks.length
    const energyLevel = avgPopularity > 70 ? 'high' : avgPopularity > 40 ? 'medium' : 'low'

    // Genre diversity analysis
    const allGenres = topArtists.flatMap((artist: any) => artist.genres || [])
    const uniqueGenres = new Set(allGenres)
    const diversityLevel =
      uniqueGenres.size > 15 ? 'eclectic' : uniqueGenres.size > 8 ? 'diverse' : 'focused'

    // Mainstream vs underground analysis
    const mainstreamScore = avgPopularity
    const tasteProfile =
      mainstreamScore > 65 ? 'mainstream' : mainstreamScore > 35 ? 'balanced' : 'underground'

    // Artist loyalty analysis
    const artistCounts = topArtists.length
    const loyaltyLevel =
      artistCounts < 15 ? 'loyal' : artistCounts < 25 ? 'exploratory' : 'adventurous'

    // Generate insights
    const insights = []

    if (energyLevel === 'high') {
      insights.push(t('spotify.taste.insights.energy.high'))
    } else if (energyLevel === 'low') {
      insights.push(t('spotify.taste.insights.energy.low'))
    }

    if (diversityLevel === 'eclectic') {
      insights.push(t('spotify.taste.insights.diversity.eclectic'))
    } else if (diversityLevel === 'focused') {
      insights.push(t('spotify.taste.insights.diversity.focused'))
    }

    if (tasteProfile === 'underground') {
      insights.push(t('spotify.taste.insights.profile.underground'))
    } else if (tasteProfile === 'mainstream') {
      insights.push(t('spotify.taste.insights.profile.mainstream'))
    }

    return {
      energyLevel,
      diversityLevel,
      tasteProfile,
      loyaltyLevel,
      mainstreamScore: Math.round(mainstreamScore),
      genreCount: uniqueGenres.size,
      insights
    }
  }, [topTracks, topArtists, t])

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <Brain className='h-5 w-5' />
            {t('spotify.taste.title')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.taste.loading')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='bg-muted h-4 w-full animate-pulse rounded' />
            <div className='bg-muted h-4 w-3/4 animate-pulse rounded' />
            <div className='bg-muted h-4 w-1/2 animate-pulse rounded' />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-500 bg-red-500/10'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'low':
        return 'text-blue-500 bg-blue-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getDiversityColor = (level: string) => {
    switch (level) {
      case 'eclectic':
        return 'text-purple-500 bg-purple-500/10'
      case 'diverse':
        return 'text-green-500 bg-green-500/10'
      case 'focused':
        return 'text-orange-500 bg-orange-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getTasteColor = (profile: string) => {
    switch (profile) {
      case 'mainstream':
        return 'text-pink-500 bg-pink-500/10'
      case 'balanced':
        return 'text-indigo-500 bg-indigo-500/10'
      case 'underground':
        return 'text-emerald-500 bg-emerald-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Brain className='h-5 w-5' />
              {t('spotify.taste.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.taste.subtitle')}
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
      <CardContent className='space-y-6'>
        {/* Taste Profile Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className={`rounded-lg p-4 ${getEnergyColor(analysis.energyLevel)}`}>
            <div className='mb-2 flex items-center gap-2'>
              <Zap className='h-4 w-4' />
              <span className='text-xs font-medium sm:text-sm'>
                {t('spotify.taste.labels.energy')}
              </span>
            </div>
            <p className='text-sm font-bold capitalize sm:text-base'>
              {td(`spotify.taste.energy-levels.${analysis.energyLevel}`)}
            </p>
          </div>

          <div className={`rounded-lg p-4 ${getDiversityColor(analysis.diversityLevel)}`}>
            <div className='mb-2 flex items-center gap-2'>
              <Heart className='h-4 w-4' />
              <span className='text-xs font-medium sm:text-sm'>
                {t('spotify.taste.labels.diversity')}
              </span>
            </div>
            <p className='text-sm font-bold capitalize sm:text-base'>
              {td(`spotify.taste.diversity-levels.${analysis.diversityLevel}`)}
            </p>
          </div>

          <div className={`rounded-lg p-4 ${getTasteColor(analysis.tasteProfile)}`}>
            <div className='mb-2 flex items-center gap-2'>
              <Star className='h-4 w-4' />
              <span className='text-xs font-medium sm:text-sm'>
                {t('spotify.taste.labels.profile')}
              </span>
            </div>
            <p className='text-sm font-bold capitalize sm:text-base'>
              {td(`spotify.taste.taste-profiles.${analysis.tasteProfile}`)}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className='grid grid-cols-2 gap-4 border-t pt-4'>
          <div className='text-center'>
            <div className='mb-1 flex items-center justify-center gap-2'>
              <Volume2 className='text-muted-foreground h-4 w-4' />
              <span className='text-muted-foreground text-xs sm:text-sm'>
                {t('spotify.taste.metrics.mainstream-score')}
              </span>
            </div>
            <p className='text-lg font-bold sm:text-xl'>{analysis.mainstreamScore}%</p>
          </div>
          <div className='text-center'>
            <div className='mb-1 flex items-center justify-center gap-2'>
              <TrendingUp className='text-muted-foreground h-4 w-4' />
              <span className='text-muted-foreground text-xs sm:text-sm'>
                {t('spotify.taste.metrics.genres-explored')}
              </span>
            </div>
            <p className='text-lg font-bold sm:text-xl'>{analysis.genreCount}</p>
          </div>
        </div>

        {/* Insights */}
        <div className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold sm:text-base'>
            {t('spotify.taste.insights.title')}
          </h4>
          <div className='space-y-2'>
            {analysis.insights.map((insight, index) => (
              <div key={index} className='bg-muted/50 flex items-start gap-2 rounded-lg p-3'>
                <Brain className='text-primary mt-0.5 h-4 w-4 flex-shrink-0' />
                <p className='text-muted-foreground text-xs sm:text-sm'>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MusicTasteAnalysis
