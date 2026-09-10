'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardHeader, CardTitle } from '@isyuricunha/ui'
import { MusicIcon, UserIcon } from 'lucide-react'

import { api } from '@/trpc/react'

import Link from '../link'
import MusicImage from '../music/music-image'

const RecapListening = () => {
  const t = useTranslations()
  const {
    data: artists,
    isLoading: artistsLoading,
    error: artistsError
  } = api.lastfm.getTopArtistsByRange.useQuery({ time_range: 'year_term' }, { staleTime: 300_000 })
  const {
    data: tracks,
    isLoading: tracksLoading,
    error: tracksError
  } = api.lastfm.getTopTracksByRange.useQuery({ time_range: 'year_term' }, { staleTime: 300_000 })

  const renderState = (
    isLoading: boolean,
    error: unknown,
    data: unknown[] | undefined
  ): React.ReactNode => {
    if (isLoading) {
      return <p className='text-text-secondary text-sm'>{t('recap.loading')}</p>
    }

    if (error || !data || data.length === 0) {
      return <p className='text-text-secondary text-sm'>{t('recap.no-data')}</p>
    }

    return null
  }

  return (
    <div className='grid min-w-0 gap-8 lg:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex flex-wrap items-center gap-2'>
            <UserIcon className='size-4' />
            {t('recap.listening.top-artists')}
            <span className='text-text-secondary text-sm font-normal'>{t('recap.period')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderState(artistsLoading, artistsError, artists) ?? (
            <ul className='space-y-4'>
              {artists!.map((artist) => (
                <li key={artist.id} className='flex min-w-0 items-center gap-4'>
                  <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-md'>
                    <MusicImage
                      src={artist.image}
                      alt={`${artist.name} artist photo`}
                      fallbackIcon={<UserIcon className='text-text-secondary size-5' />}
                      width={48}
                      height={48}
                      sizes='48px'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Link href={artist.url} className='block truncate text-sm hover:underline'>
                      {artist.name}
                    </Link>
                    <p className='text-text-secondary text-xs tabular-nums'>
                      {artist.followers.toLocaleString()} {t('recap.listening.plays')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex flex-wrap items-center gap-2'>
            <MusicIcon className='size-4' />
            {t('recap.listening.top-tracks')}
            <span className='text-text-secondary text-sm font-normal'>{t('recap.period')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderState(tracksLoading, tracksError, tracks) ?? (
            <ul className='space-y-4'>
              {tracks!.map((track) => (
                <li key={track.id} className='flex min-w-0 items-center gap-4'>
                  <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-md'>
                    <MusicImage
                      src={track.albumImage}
                      alt={`${track.name} — ${track.artist}`}
                      fallbackIcon={<MusicIcon className='text-text-secondary size-5' />}
                      width={48}
                      height={48}
                      sizes='48px'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Link href={track.url} className='block truncate text-sm hover:underline'>
                      {track.name}
                    </Link>
                    <p className='text-text-secondary truncate text-xs'>
                      {track.artist} · {track.popularity.toLocaleString()}{' '}
                      {t('recap.listening.plays')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RecapListening
