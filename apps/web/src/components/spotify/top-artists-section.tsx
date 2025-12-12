'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { UserIcon, Grid3X3, List, Shuffle } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

import { api } from '@/trpc/react'
import TimeRangeToggle from './time-range-toggle'
import { exportJson, exportTopArtistsCsv } from '@/utils/exporters/spotify'

import Link from '../link'
import SpotifyImage from './spotify-image'

const TopArtistsSection = () => {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isShuffled, setIsShuffled] = useState(true)
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('short_term')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: artists, refetch, isLoading, error } = api.spotify.getTopArtistsByRange.useQuery(
    { time_range: timeRange },
    { staleTime: 300_000 }
  )

  type Artist = NonNullable<typeof artists>[number]

  // Shuffle artists when requested
  const displayedArtists = useMemo(() => {
    if (!artists) return []
    if (isShuffled) {
      return [...artists].sort(() => Math.random() - 0.5)
    }
    return artists
  }, [artists, isShuffled])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleExportCsv = () => {
    if (artists && artists.length > 0) exportTopArtistsCsv(artists)
  }

  const handleExportJson = () => {
    if (artists) exportJson('top-artists.json', artists)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.top-artists.title')}</CardTitle>
          <CardDescription>{t('spotify.top-artists.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className='flex flex-col items-center space-y-2'>
                <div className='h-16 w-16 animate-pulse rounded-full bg-muted' />
                <div className='h-4 w-20 animate-pulse rounded bg-muted' />
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
          <CardTitle>{t('spotify.top-artists.title')}</CardTitle>
          <CardDescription>{t('spotify.top-artists.subtitle')}</CardDescription>
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

  if (!artists || artists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('spotify.top-artists.title')}</CardTitle>
          <CardDescription>{t('spotify.top-artists.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground'>{t('spotify.top-artists.no-data')}</p>
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
        {/* Title and subtitle */}
        <div>
          <CardTitle className='text-base sm:text-lg'>{t('spotify.top-artists.title')}</CardTitle>
          <CardDescription className='text-xs sm:text-sm'>{t('spotify.top-artists.subtitle')}</CardDescription>
        </div>
        {/* Controls row beneath title, wraps on small screens */}
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          {/* View mode toggle: list vs grid */}
          <div className='inline-flex items-center gap-1 rounded-md bg-muted p-1 text-xs'>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
              title={t('spotify.top-artists.tooltips.view-list')}
              aria-label={t('spotify.top-artists.tooltips.view-list')}
              aria-pressed={viewMode === 'list'}
            >
              <List className='h-4 w-4' />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
              title={t('spotify.top-artists.tooltips.view-grid')}
              aria-label={t('spotify.top-artists.tooltips.view-grid')}
              aria-pressed={viewMode === 'grid'}
            >
              <Grid3X3 className='h-4 w-4' />
            </button>
          </div>
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-1.5 rounded-md transition-colors ${isShuffled
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            title={isShuffled ? t('spotify.top-artists.tooltips.shuffle-on') : t('spotify.top-artists.tooltips.shuffle-off')}
          >
            <Shuffle className='h-4 w-4' />
          </button>
          <button
            onClick={handleExportCsv}
            className='px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
            title={t('spotify.export.csv') || 'Export CSV'}
          >
            CSV
          </button>
          <button
            onClick={handleExportJson}
            className='px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
            title={t('spotify.export.json') || 'Export JSON'}
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
      </CardHeader>
      <CardContent>
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {displayedArtists.map((artist: Artist) => (
              <Link
                key={artist.id}
                href={artist.url}
                className='group flex flex-col items-center space-y-2 rounded-lg p-2 transition-colors hover:bg-muted/50 min-w-0'
              >
                <div className='relative h-16 w-16 overflow-hidden rounded-full'>
                  <SpotifyImage
                    src={artist.image}
                    alt={`${artist.name} artist photo`}
                    fallbackIcon={<UserIcon className='h-6 w-6 text-muted-foreground' />}
                    width={64}
                    height={64}
                    sizes='64px'
                  />
                </div>
                <div className='text-center w-full min-w-0'>
                  <h3 className='truncate text-xs sm:text-sm font-medium group-hover:text-primary w-full'>
                    {artist.name}
                  </h3>
                  {artist.genres && artist.genres.length > 0 && (
                    <p className='truncate text-[10px] sm:text-xs text-muted-foreground w-full'>
                      {artist.genres.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className='space-y-3'>
            {displayedArtists.map((artist: Artist) => (
              <Link
                key={artist.id}
                href={artist.url}
                className='group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50'
              >
                <div className='flex items-center gap-4 flex-1 min-w-0'>
                  <div className='relative h-12 w-12 overflow-hidden rounded-full flex-shrink-0'>
                    <SpotifyImage
                      src={artist.image}
                      alt={`${artist.name} artist photo`}
                      fallbackIcon={<UserIcon className='h-4 w-4 text-muted-foreground' />}
                      width={48}
                      height={48}
                      sizes='48px'
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='truncate text-sm font-medium group-hover:text-primary'>
                      {artist.name}
                    </h3>
                    {artist.genres && artist.genres.length > 0 && (
                      <p className='truncate text-xs text-muted-foreground'>
                        {artist.genres.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className='text-right flex-shrink-0'>
                    <p className='text-xs text-muted-foreground'>
                      {isMounted ? artist.followers.toLocaleString() : artist.followers} {t('spotify.followers')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TopArtistsSection
