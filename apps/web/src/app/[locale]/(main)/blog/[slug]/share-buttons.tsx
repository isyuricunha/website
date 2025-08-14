'use client'

import { cn } from '@tszhong0411/utils'
import { CheckIcon, LinkIcon, Share2Icon, TwitterIcon } from 'lucide-react'
import { useState } from 'react'

import Link from '@/components/link'
import { useTranslations } from '@tszhong0411/i18n/client'

type ShareButtonsProps = {
  url: string
  title: string
  className?: string
}

const ShareButtons = (props: ShareButtonsProps) => {
  const { url, title, className } = props
  const [copied, setCopied] = useState(false)
  const t = useTranslations()

  const twitterHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  const linkedinHref = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (_) {}
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <button
        type='button'
        onClick={onCopy}
        aria-label={t('component.share-buttons.copy-link-aria')}
        className='inline-flex items-center gap-2 rounded-md border px-3 py-1.5 hover:bg-muted transition-colors'
      >
        {copied ? <CheckIcon className='size-4' /> : <LinkIcon className='size-4' />}
        {copied ? t('component.share-buttons.copied') : t('component.share-buttons.copy')}
      </button>
      <Link
        href={twitterHref}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={t('component.share-buttons.share-on-x')}
        className='inline-flex items-center gap-2 rounded-md border px-3 py-1.5 hover:bg-muted transition-colors'
      >
        <TwitterIcon className='size-4' /> {t('component.share-buttons.share-on-x')}
      </Link>
      <Link
        href={linkedinHref}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={t('component.share-buttons.share-on-linkedin')}
        className='inline-flex items-center gap-2 rounded-md border px-3 py-1.5 hover:bg-muted transition-colors'
      >
        <Share2Icon className='size-4' /> {t('component.share-buttons.share-on-linkedin')}
      </Link>
    </div>
  )
}

export default ShareButtons


