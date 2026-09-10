'use client'

import { useLocale, useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardHeader, CardTitle } from '@isyuricunha/ui'
import { BookOpenIcon, EyeIcon, HeartIcon } from 'lucide-react'

import { api } from '@/trpc/react'
import { getLocalizedPath } from '@/utils/get-localized-path'

import Link from '../link'

const RecapContent = () => {
  const t = useTranslations()
  const locale = useLocale()

  const { data: summary } = api.recap.summary.useQuery(undefined, { staleTime: 300_000 })
  const {
    data: topViewed,
    isLoading: viewedLoading,
    error: viewedError
  } = api.recap.topViewed.useQuery({ locale, limit: 5 }, { staleTime: 300_000 })
  const {
    data: topLiked,
    isLoading: likedLoading,
    error: likedError
  } = api.recap.topLiked.useQuery({ locale, limit: 5 }, { staleTime: 300_000 })

  const renderPostList = (
    isLoading: boolean,
    error: unknown,
    data:
      | Array<{
          slug: string
          locale: string
          title: string
          views?: number
          likes?: number
        }>
      | undefined,
    metric: 'views' | 'likes'
  ) => {
    if (isLoading) {
      return <p className='text-text-secondary text-sm'>{t('recap.loading')}</p>
    }

    if (error || !data || data.length === 0) {
      return <p className='text-text-secondary text-sm'>{t('recap.no-data')}</p>
    }

    // next-intl's Link re-prefixes hrefs with the current locale, so same-locale
    // links pass an unprefixed path. Posts that only exist in another locale use
    // a plain localized URL instead of forcing a client-side locale switch.
    const renderTitle = (post: { slug: string; locale: string; title: string }) => {
      const className = 'min-w-0 flex-1 truncate text-sm hover:underline'

      if (post.locale === locale) {
        return (
          <Link href={`/blog/${post.slug}`} className={className}>
            {post.title}
          </Link>
        )
      }

      return (
        <a
          href={getLocalizedPath({ slug: `/blog/${post.slug}`, locale: post.locale })}
          className={className}
        >
          {post.title}
        </a>
      )
    }

    return (
      <ol className='space-y-3'>
        {data.map((post) => (
          <li key={post.slug} className='flex min-w-0 items-baseline justify-between gap-4'>
            {renderTitle(post)}
            <span className='text-text-secondary shrink-0 text-xs tabular-nums'>
              {metric === 'views'
                ? `${(post.views ?? 0).toLocaleString()} ${t('recap.content.views')}`
                : `${(post.likes ?? 0).toLocaleString()} ${t('recap.content.likes')}`}
            </span>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div className='space-y-8'>
      <div className='grid gap-8 sm:grid-cols-2'>
        <div>
          <p className='text-4xl font-medium tracking-tighter'>
            {summary ? summary.postsLastTwelveMonths.toLocaleString() : '—'}
          </p>
          <p className='text-text-secondary text-sm'>{t('recap.content.published-last-year')}</p>
        </div>
        <div>
          <p className='text-4xl font-medium tracking-tighter'>
            {summary ? summary.totalPosts.toLocaleString() : '—'}
          </p>
          <p className='text-text-secondary text-sm'>{t('recap.content.total-posts')}</p>
        </div>
      </div>

      <div className='grid min-w-0 gap-8 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex flex-wrap items-center gap-2'>
              <EyeIcon className='size-4' />
              {t('recap.content.most-read')}
              <span className='text-text-secondary text-sm font-normal'>{t('recap.all-time')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderPostList(viewedLoading, viewedError, topViewed, 'views')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex flex-wrap items-center gap-2'>
              <HeartIcon className='size-4' />
              {t('recap.content.most-liked')}
              <span className='text-text-secondary text-sm font-normal'>{t('recap.all-time')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>{renderPostList(likedLoading, likedError, topLiked, 'likes')}</CardContent>
        </Card>
      </div>

      <p className='text-text-secondary flex items-center gap-2 text-xs'>
        <BookOpenIcon className='size-3.5' />
        {t('recap.content.total-posts')}: {summary ? summary.totalPosts.toLocaleString() : '—'}
      </p>
    </div>
  )
}

export default RecapContent
