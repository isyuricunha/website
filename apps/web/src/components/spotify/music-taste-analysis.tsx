'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Brain, Zap, Heart, Volume2, Star, TrendingUp } from 'lucide-react'
import { useState, useMemo } from 'react'

import { api } from '@/trpc/react'

const MusicTasteAnalysis = () => {
  const t = useTranslations()
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
    const avgPopularity = topTracks.reduce((acc, track) => acc + (track.popularity || 0), 0) / topTracks.length
    const energyLevel = avgPopularity > 70 ? 'high' : avgPopularity > 40 ? 'medium' : 'low'

    // Genre diversity analysis
    const allGenres = topArtists.flatMap(artist => artist.genres || [])
    const uniqueGenres = new Set(allGenres)
    const diversityLevel = uniqueGenres.size > 15 ? 'eclectic' : uniqueGenres.size > 8 ? 'diverse' : 'focused'

    // Mainstream vs underground analysis
    const mainstreamScore = avgPopularity
    const tasteProfile = mainstreamScore > 65 ? 'mainstream' : mainstreamScore > 35 ? 'balanced' : 'underground'

    // Artist loyalty analysis
    const artistCounts = topArtists.length
    const loyaltyLevel = artistCounts < 15 ? 'loyal' : artistCounts < 25 ? 'exploratory' : 'adventurous'

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
  }, [topTracks, topArtists])

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
            <Brain className='h-5 w-5' />
            {t('spotify.taste.title')}
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.taste.loading')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='h-4 w-full animate-pulse rounded bg-muted' />
            <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
            <div className='h-4 w-1/2 animate-pulse rounded bg-muted' />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'low': return 'text-blue-500 bg-blue-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getDiversityColor = (level: string) => {
    switch (level) {
      case 'eclectic': return 'text-purple-500 bg-purple-500/10'
      case 'diverse': return 'text-green-500 bg-green-500/10'
      case 'focused': return 'text-orange-500 bg-orange-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getTasteColor = (profile: string) => {
    switch (profile) {
      case 'mainstream': return 'text-pink-500 bg-pink-500/10'
      case 'balanced': return 'text-indigo-500 bg-indigo-500/10'
      case 'underground': return 'text-emerald-500 bg-emerald-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
              <Brain className='h-5 w-5' />
              {t('spotify.taste.title')}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {t('spotify.taste.subtitle')}
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
      <CardContent className='space-y-6'>
        {/* Taste Profile Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className={`p-4 rounded-lg ${getEnergyColor(analysis.energyLevel)}`}>
            <div className='flex items-center gap-2 mb-2'>
              <Zap className='h-4 w-4' />
              <span className='text-xs sm:text-sm font-medium'>{t('spotify.taste.labels.energy')}</span>
            </div>
            <p className='text-sm sm:text-base font-bold capitalize'>{t(`spotify.taste.energy-levels.${analysis.energyLevel}`)}</p>
          </div>

          <div className={`p-4 rounded-lg ${getDiversityColor(analysis.diversityLevel)}`}>
            <div className='flex items-center gap-2 mb-2'>
              <Heart className='h-4 w-4' />
              <span className='text-xs sm:text-sm font-medium'>{t('spotify.taste.labels.diversity')}</span>
            </div>
            <p className='text-sm sm:text-base font-bold capitalize'>{t(`spotify.taste.diversity-levels.${analysis.diversityLevel}`)}</p>
          </div>

          <div className={`p-4 rounded-lg ${getTasteColor(analysis.tasteProfile)}`}>
            <div className='flex items-center gap-2 mb-2'>
              <Star className='h-4 w-4' />
              <span className='text-xs sm:text-sm font-medium'>{t('spotify.taste.labels.profile')}</span>
            </div>
            <p className='text-sm sm:text-base font-bold capitalize'>{t(`spotify.taste.taste-profiles.${analysis.tasteProfile}`)}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2 mb-1'>
              <Volume2 className='h-4 w-4 text-muted-foreground' />
              <span className='text-xs sm:text-sm text-muted-foreground'>{t('spotify.taste.metrics.mainstream-score')}</span>
            </div>
            <p className='text-lg sm:text-xl font-bold'>{analysis.mainstreamScore}%</p>
          </div>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2 mb-1'>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
              <span className='text-xs sm:text-sm text-muted-foreground'>{t('spotify.taste.metrics.genres-explored')}</span>
            </div>
            <p className='text-lg sm:text-xl font-bold'>{analysis.genreCount}</p>
          </div>
        </div>

        {/* Insights */}
        <div className='pt-4 border-t'>
          <h4 className='text-sm sm:text-base font-semibold mb-3'>{t('spotify.taste.insights.title')}</h4>
          <div className='space-y-2'>
            {analysis.insights.map((insight, index) => (
              <div key={index} className='flex items-start gap-2 p-3 rounded-lg bg-muted/50'>
                <Brain className='h-4 w-4 mt-0.5 text-primary flex-shrink-0' />
                <p className='text-xs sm:text-sm text-muted-foreground'>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MusicTasteAnalysis
