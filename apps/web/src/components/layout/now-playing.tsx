'use client'

import { useTranslations } from '@isyuricunha/i18n/client'

import { Music } from 'lucide-react'
import { api } from '@/trpc/react'

import Link from '../link'

const NowPlaying = () => {
  const { status, data } = api.lastfm.get.useQuery(undefined, {
    staleTime: 1000 * 60
  })
  const t = useTranslations()

  const isPlaying = status === 'success' && data.isPlaying && data.songUrl
  const notListening = status === 'success' && (!data.isPlaying || !data.songUrl)

  return (
    <div className='flex items-center gap-4'>
      <div className='relative flex h-5 w-5 items-center justify-center'>
        {isPlaying ? (
          <div className='flex items-end gap-[2px] h-3'>
            <div className='w-[3px] bg-primary animate-music-bar-1 opacity-80' />
            <div className='w-[3px] bg-primary animate-music-bar-2 opacity-80' />
            <div className='w-[3px] bg-primary animate-music-bar-3 opacity-80' />
          </div>
        ) : (
          <Music className='h-4 w-4 text-muted-foreground opacity-50' />
        )}
      </div>

      <div className='inline-flex w-full items-center justify-center gap-1 text-sm md:justify-start'>
        <p>
          {status === 'pending' ? t('layout.now-playing.loading') : null}
          {status === 'error' ? t('layout.now-playing.error') : null}
          {isPlaying ? (
            <Link href={data.songUrl}>
              {data.name} - {data.artist}
            </Link>
          ) : null}
          {notListening ? t('layout.now-playing.not-listening') : null}
        </p>
      </div>
    </div>
  )
}

export default NowPlaying
