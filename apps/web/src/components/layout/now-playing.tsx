'use client'

import { useTranslations } from '@isyuricunha/i18n/client'

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
      <svg
        stroke='currentColor'
        fill='currentColor'
        strokeWidth='0'
        viewBox='0 0 496 512'
        height='20'
        width='20'
        xmlns='http://www.w3.org/2000/svg'
        aria-label='Last.fm'
        className='text-primary'
      >
        <path d='M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm49.1 346.7c-15.8 4.3-33-3.6-32.9-20.9 0-38.3 43-44.5 43.1-80.1.1-16.1-9.9-25.1-23.7-25.1-13.4 0-21.5 8.1-30.8 19.3L231.7 266.6 216.9 247.5c-9.1-13.2-19.1-17.5-31.5-17.5-16.1 0-27.1 11-27.1 27.2s12.5 27.3 27 27.3c10.3 0 17.6-4.5 24.1-12.2l14.9 18.7c-13.3 11-23.7 17.5-41.9 17.5-31.2 0-51.4-24.3-51.4-53.7s19.8-54 53.6-54c20.3 0 33 9.4 46.5 24.1l11.4 12.8 11.4-12.8c12.2-13.6 27.3-24.1 48.6-24.1 32 0 49.3 22 49.3 48.1.1 44.9-50.3 54.4-50.1 82.2 0 18.3 18.9 22.3 33.3 17.6l2.1 15.1z' />
      </svg>

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
