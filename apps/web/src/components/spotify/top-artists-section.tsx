'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
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
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>(
    'short_term'
  )
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    data: artists,
    refetch,
    isLoading,
    error
  } = api.spotify.getTopArtistsByRange.useQuery({ time_range: timeRange }, { staleTime: 300_000 })

  type Artist = NonNullable<typeof artists>[number]

  // Shuffle artists when requested
  const displayedArtists = useMemo(() => {
    if (!artists) return []
    if (isShuffled && isMounted) {
      return [...artists].sort(() => Math.random() - 0.5)
    }
    return artists
  }, [artists, isShuffled, isMounted])

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
                <div className='bg-muted h-16 w-16 animate-pulse rounded-full' />
                <div className='bg-muted h-4 w-20 animate-pulse rounded' />
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
        {/* Title and subtitle */}
        <div>
          <CardTitle className='text-base sm:text-lg'>{t('spotify.top-artists.title')}</CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            {t('spotify.top-artists.subtitle')}
          </CardDescription>
        </div>
        {/* Controls row beneath title, wraps on small screens */}
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          {/* View mode toggle: list vs grid */}
          <div className='bg-muted inline-flex items-center gap-1 rounded-md p-1 text-xs'>
            <button
              type='button'
              onClick={() => setViewMode('list')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={t('spotify.top-artists.tooltips.view-list')}
              aria-label={t('spotify.top-artists.tooltips.view-list')}
              aria-pressed={viewMode === 'list'}
            >
              <List className='h-4 w-4' />
            </button>
            <button
              type='button'
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow'
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
            type='button'
            onClick={() => setIsShuffled(!isShuffled)}
            className={`rounded-md p-1.5 transition-colors ${
              isShuffled
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title={
              isShuffled
                ? t('spotify.top-artists.tooltips.shuffle-on')
                : t('spotify.top-artists.tooltips.shuffle-off')
            }
          >
            <Shuffle className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={handleExportCsv}
            className='text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-2 py-1 text-xs transition-colors'
            title={t('spotify.export.csv') || 'Export CSV'}
          >
            CSV
          </button>
          <button
            type='button'
            onClick={handleExportJson}
            className='text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-2 py-1 text-xs transition-colors'
            title={t('spotify.export.json') || 'Export JSON'}
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
      </CardHeader>
      <CardContent>
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {displayedArtists.map((artist: Artist) => (
              <Link
                key={artist.id}
                href={artist.url}
                className='hover:bg-muted/50 group flex min-w-0 flex-col items-center space-y-2 rounded-lg p-2 transition-colors'
              >
                <div className='relative h-16 w-16 overflow-hidden rounded-full'>
                  <SpotifyImage
                    src={artist.image}
                    alt={`${artist.name} artist photo`}
                    fallbackIcon={<UserIcon className='text-muted-foreground h-6 w-6' />}
                    width={64}
                    height={64}
                    sizes='64px'
                  />
                </div>
                <div className='w-full min-w-0 text-center'>
                  <h3 className='group-hover:text-primary w-full truncate text-xs font-medium sm:text-sm'>
                    {artist.name}
                  </h3>
                  {artist.genres && artist.genres.length > 0 && (
                    <p className='text-muted-foreground w-full truncate text-[10px] sm:text-xs'>
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
                className='hover:bg-muted/50 group flex items-center gap-4 rounded-lg p-3 transition-colors'
              >
                <div className='flex min-w-0 flex-1 items-center gap-4'>
                  <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-full'>
                    <SpotifyImage
                      src={artist.image}
                      alt={`${artist.name} artist photo`}
                      fallbackIcon={<UserIcon className='text-muted-foreground h-4 w-4' />}
                      width={48}
                      height={48}
                      sizes='48px'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h3 className='group-hover:text-primary truncate text-sm font-medium'>
                      {artist.name}
                    </h3>
                    {artist.genres && artist.genres.length > 0 && (
                      <p className='text-muted-foreground truncate text-xs'>
                        {artist.genres.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className='shrink-0 text-right'>
                    <p className='text-muted-foreground text-xs'>
                      {isMounted ? artist.followers.toLocaleString() : artist.followers}{' '}
                      {t('spotify.followers')}
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
