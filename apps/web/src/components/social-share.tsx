'use client'

import { useState } from 'react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@isyuricunha/ui'

import { SiX, SiFacebook, SiReddit, SiWhatsapp } from '@icons-pack/react-simple-icons'
import { Share2, Link, Check } from 'lucide-react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

const default_hashtags: string[] = []

interface SocialShareProps {
  title: string
  url: string
  description?: string
  hashtags?: string[]
  className?: string
}

export default function SocialShare({
  title,
  url,
  description,
  hashtags = default_hashtags,
  className
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('component.social-share')

  const shareUrl = globalThis.window === undefined ? url : `${globalThis.location.origin}${url}`
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedDescription = encodeURIComponent(description || '')
  const hashtagString = hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : ''

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${hashtagString}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t('toast.copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('toast.copy-failed'))
    }
  }

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer')
  }

  // Native Web Share API support
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl
        })
      } catch {
        // User cancelled or error occurred
        logger.debug('Share cancelled')
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={`gap-2 ${className}`}
          aria-label={t('button.aria')}
          type='button'
        >
          <Share2 className='size-4' />
          {t('button.label')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        {globalThis.window !== undefined && typeof navigator.share === 'function' && (
          <DropdownMenuItem onClick={handleNativeShare} className='gap-2'>
            <Share2 className='size-4' />
            {t('native')}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => openShare('twitter')} className='gap-2'>
          <SiX className='size-4' />
          {t('platform.twitter')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openShare('facebook')} className='gap-2'>
          <SiFacebook className='size-4' />
          {t('platform.facebook')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openShare('linkedin')} className='gap-2'>
          <svg
            viewBox='0 0 24 24'
            className='size-4 fill-current'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
          </svg>
          {t('platform.linkedin')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openShare('reddit')} className='gap-2'>
          <SiReddit className='size-4' />
          {t('platform.reddit')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openShare('whatsapp')} className='gap-2'>
          <SiWhatsapp className='size-4' />
          {t('platform.whatsapp')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={copyToClipboard} className='gap-2'>
          {copied ? (
            <Check className='text-accent-earth-text size-4' />
          ) : (
            <Link className='size-4' />
          )}
          {copied ? t('copy.copied') : t('copy.label')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
