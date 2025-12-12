'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Share2, Twitter, Facebook, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

import { api } from '@/trpc/react'
import Link from '../link'
import SocialShare from '../social-share'
import SpotifyImage from './spotify-image'

const SocialSharing = () => {
  const t = useTranslations()
  const [copiedTrack, setCopiedTrack] = useState<string | null>(null)

  const { data: currentTrack } = api.spotify.getCurrentlyPlaying.useQuery()
  const { data: topTracks } = api.spotify.getTopTracks.useQuery()

  const shareTrack = async (track: any, platform: 'twitter' | 'facebook' | 'copy') => {
    const shareText = t('spotify.social.share-text', { name: track.name, artist: track.artist })
    const shareUrl: string = track.url || track.songUrl

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        )
        break
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          '_blank'
        )
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
          setCopiedTrack(shareUrl)
          setTimeout(() => setCopiedTrack(null), 2000)
        } catch (error) {
          console.error('Failed to copy to clipboard:', error)
        }
        break
    }
  }

  const featuredTracks = topTracks?.slice(0, 3) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
          <Share2 className='h-5 w-5' />
          {t('spotify.social.title')}
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          {t('spotify.social.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Currently Playing */}
        {currentTrack && (
          <div>
            <h4 className='text-sm sm:text-base font-semibold mb-3'>{t('spotify.social.now-playing')}</h4>
            <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
              <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg'>
                <SpotifyImage
                  src={currentTrack.albumImage}
                  alt={`${currentTrack.album} album cover`}
                  width={48}
                  height={48}
                  sizes='48px'
                />
              </div>
              <div className='flex-1 min-w-0'>
                <h5 className='text-sm sm:text-base font-medium truncate'>{currentTrack.name}</h5>
                <p className='text-xs sm:text-sm text-muted-foreground truncate'>{currentTrack.artist}</p>
              </div>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => shareTrack(currentTrack, 'twitter')}
                  className='p-2 hover:bg-muted rounded-lg transition-colors'
                  title={t('spotify.social.buttons.twitter')}
                >
                  <Twitter className='h-4 w-4' />
                </button>
                <button
                  onClick={() => shareTrack(currentTrack, 'facebook')}
                  className='p-2 hover:bg-muted rounded-lg transition-colors'
                  title={t('spotify.social.buttons.facebook')}
                >
                  <Facebook className='h-4 w-4' />
                </button>
                <button
                  onClick={() => shareTrack(currentTrack, 'copy')}
                  className='p-2 hover:bg-muted rounded-lg transition-colors'
                  title={t('spotify.social.buttons.copy')}
                >
                  {copiedTrack === currentTrack.songUrl ? (
                    <span className='text-xs text-green-500'>✓</span>
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Tracks */}
        {featuredTracks.length > 0 && (
          <div>
            <h4 className='text-sm sm:text-base font-semibold mb-3'>{t('spotify.social.top-tracks')}</h4>
            <div className='space-y-3'>
              {featuredTracks.map((track: any, index: number) => (
                <div key={track.url ?? track.id ?? index} className='flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors'>
                  <div className='flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium'>
                    {index + 1}
                  </div>
                  <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg'>
                    <SpotifyImage
                      src={track.albumImage}
                      alt={`${track.album} album cover`}
                      width={40}
                      height={40}
                      sizes='40px'
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h5 className='text-xs sm:text-sm font-medium truncate'>{track.name}</h5>
                    <p className='text-[10px] sm:text-xs text-muted-foreground truncate'>{track.artist}</p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={() => shareTrack(track, 'twitter')}
                      className='p-1.5 hover:bg-muted rounded-lg transition-colors'
                      title={t('spotify.social.buttons.twitter')}
                    >
                      <Twitter className='h-3 w-3' />
                    </button>
                    <button
                      onClick={() => shareTrack(track, 'facebook')}
                      className='p-1.5 hover:bg-muted rounded-lg transition-colors'
                      title={t('spotify.social.buttons.facebook')}
                    >
                      <Facebook className='h-3 w-3' />
                    </button>
                    <button
                      onClick={() => shareTrack(track, 'copy')}
                      className='p-1.5 hover:bg-muted rounded-lg transition-colors'
                      title={t('spotify.social.buttons.copy')}
                    >
                      {copiedTrack === track.url ? (
                        <span className='text-xs text-green-500'>✓</span>
                      ) : (
                        <Copy className='h-3 w-3' />
                      )}
                    </button>
                    <Link
                      href={track.url}
                      className='p-1.5 hover:bg-muted rounded-lg transition-colors'
                      title={t('spotify.social.buttons.open')}
                    >
                      <ExternalLink className='h-3 w-3' />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Profile */}
        <div className='pt-4 border-t'>
          <h4 className='text-sm sm:text-base font-semibold mb-3'>{t('spotify.social.profile.title')}</h4>
          <div className='flex justify-center'>
            <SocialShare
              title={t('spotify.social.profile.share-title')}
              url="/spotify"
              description={t('spotify.social.profile.share-description')}
              hashtags={['music', 'spotify', 'nowplaying']}
              className='w-full'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SocialSharing
