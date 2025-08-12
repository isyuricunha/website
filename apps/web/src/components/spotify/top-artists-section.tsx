'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { UserIcon } from 'lucide-react'
import { useState } from 'react'

import { api } from '@/trpc/react'

import Link from '../link'
import SpotifyImage from './spotify-image'

const TopArtistsSection = () => {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: artists, refetch, isLoading, error } = api.spotify.getTopArtists.useQuery(
    undefined,
    {
      staleTime: 300000 // 5 minutes
    }
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
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
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>{t('spotify.top-artists.title')}</CardTitle>
            <CardDescription>{t('spotify.top-artists.subtitle')}</CardDescription>
          </div>
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
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={artist.url}
              className='group flex flex-col items-center space-y-2 rounded-lg p-2 transition-colors hover:bg-muted/50'
            >
              <div className='relative h-16 w-16 overflow-hidden rounded-full'>
                <SpotifyImage
                  src={artist.image}
                  alt={`${artist.name} artist photo`}
                  fallbackIcon={<UserIcon className='h-6 w-6 text-muted-foreground' />}
                  className='h-full w-full'
                  sizes='64px'
                />
              </div>
              <div className='text-center'>
                <h3 className='truncate text-sm font-medium group-hover:text-primary'>
                  {artist.name}
                </h3>
                {artist.genres && artist.genres.length > 0 && (
                  <p className='truncate text-xs text-muted-foreground'>
                    {artist.genres.slice(0, 2).join(', ')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopArtistsSection
