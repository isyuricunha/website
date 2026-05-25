'use client'

import NumberFlow, { continuous } from '@number-flow/react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage } from '@isyuricunha/ui'
import { useEffect, useRef } from 'react'

import ImageZoom from '@/components/image-zoom'
import Link from '@/components/link'
import SocialShare from '@/components/social-share'
import { BlogCoverImage } from '@/components/ui/optimized-image'
import { usePostContext } from '@/contexts/post'
import { useFormattedDate } from '@/hooks/use-formatted-date'
import { api } from '@/trpc/react'

const Header = () => {
  const { date, title, slug } = usePostContext()
  const formattedDate = useFormattedDate(date)
  const utils = api.useUtils()
  const t = useTranslations()

  const share_hashtags = t('blog.share.hashtags')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  const incrementMutation = api.views.increment.useMutation({
    onSettled: () => utils.views.get.invalidate()
  })

  const viewsCountQuery = api.views.get.useQuery({
    slug
  })

  const commentsCountQuery = api.comments.getTotalCommentsCount.useQuery({
    slug
  })

  const incremented = useRef(false)

  useEffect(() => {
    if (!incremented.current) {
      incrementMutation.mutate({ slug })
      incremented.current = true
    }
  }, [incrementMutation, slug])

  return (
    <div className='space-y-16 py-16'>
      <div className='space-y-12 sm:px-8'>
        <h1 className='max-w-4xl text-[clamp(32px,4vw,52px)] font-normal tracking-tighter text-balance'>
          {title}
        </h1>
        <div className='grid grid-cols-2 gap-6 border-y border-[var(--border-faint)] py-6 text-sm md:grid-cols-4'>
          <div className='space-y-1'>
            <div className='label-mono'>{t('blog.header.written-by')}</div>
            <Link href='https://github.com/isyuricunha' className='flex items-center gap-2'>
              <BlurImage
                src='/images/avatar.png'
                className='rounded-full'
                width={24}
                height={24}
                alt={t('metadata.site-title')}
              />
              {t('metadata.site-title')}
            </Link>
          </div>
          <div className='space-y-1'>
            <div className='label-mono'>{t('blog.header.published-on')}</div>
            <div>{formattedDate}</div>
          </div>
          <div className='space-y-1'>
            <div className='label-mono'>{t('blog.header.views')}</div>
            {viewsCountQuery.status === 'pending' ? '--' : null}
            {viewsCountQuery.status === 'error' ? t('common.error') : null}
            {viewsCountQuery.status === 'success' ? (
              <NumberFlow willChange plugins={[continuous]} value={viewsCountQuery.data.views} />
            ) : null}
          </div>
          <div className='space-y-1'>
            <div className='label-mono'>{t('blog.header.comments')}</div>
            {commentsCountQuery.status === 'pending' ? '--' : null}
            {commentsCountQuery.status === 'error' ? t('common.error') : null}
            {commentsCountQuery.status === 'success' ? (
              <NumberFlow
                willChange
                plugins={[continuous]}
                value={commentsCountQuery.data.comments}
              />
            ) : null}
          </div>
        </div>

        <div>
          <SocialShare
            title={title}
            url={`/blog/${slug}`}
            description={t('blog.share.description', {
              title,
              site: t('metadata.site-title')
            })}
            hashtags={share_hashtags}
          />
        </div>
      </div>
      <ImageZoom
        zoomImg={{
          src: `/images/blog/${slug}/cover.png`,
          alt: title
        }}
      >
        <BlogCoverImage slug={slug} title={title} priority />
      </ImageZoom>
    </div>
  )
}

export default Header
