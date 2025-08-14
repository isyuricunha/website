'use client'

import type { Post } from 'content-collections'

import { BlurImage, Badge } from '@tszhong0411/ui'

import Link from './link'
import { useFormattedDate } from '@/hooks/use-formatted-date'
import { api } from '@/trpc/react'
import { useTranslations } from '@tszhong0411/i18n/client'

type FeaturedPostCardProps = Post

const FeaturedPostCard = (props: FeaturedPostCardProps) => {
  const { slug, title, summary, date } = props
  const formattedDate = useFormattedDate(date)
  const t = useTranslations()

  const viewsQuery = api.views.get.useQuery({ slug })
  const likesQuery = api.likes.get.useQuery({ slug })

  return (
    <Link
      href={`/blog/${slug}`}
      className='group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md'
    >
      <div className='grid grid-cols-1 gap-0 md:grid-cols-2'>
        <div className='relative'>
          <BlurImage
            src={`/images/blog/${slug}/cover.png`}
            className='h-full w-full object-cover'
            width={1200}
            height={630}
            imageClassName='transition-transform duration-300 group-hover:scale-[1.02]'
            alt={title}
          />
          <Badge className='absolute left-4 top-4'>{t('component.featured-post-card.featured')}</Badge>
        </div>
        <div className='p-6 md:p-8'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span>{formattedDate}</span>
            <span>•</span>
            {likesQuery.status === 'success' ? (
              <span>{t('common.likes', { count: likesQuery.data.likes })}</span>
            ) : (
              <span className='inline-block h-3.5 w-10 animate-pulse rounded bg-muted' />
            )}
            <span>•</span>
            {viewsQuery.status === 'success' ? (
              <span>{t('common.views', { count: viewsQuery.data.views })}</span>
            ) : (
              <span className='inline-block h-3.5 w-10 animate-pulse rounded bg-muted' />
            )}
          </div>
          <h3 className='mt-3 text-2xl font-semibold md:text-3xl'>{title}</h3>
          <p className='text-muted-foreground mt-3 text-base md:text-lg'>
            {summary}
          </p>
          <div className='mt-6 text-primary'>
            {t('component.featured-post-card.read-more')} →
          </div>
        </div>
      </div>
    </Link>
  )
}

export default FeaturedPostCard
