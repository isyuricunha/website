'use client'

import type { Post } from 'content-collections'

import { useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage, Badge } from '@isyuricunha/ui'
import { Star } from 'lucide-react'

import { useFormattedDate } from '@/hooks/use-formatted-date'
import { api } from '@/trpc/react'

import Link from './link'

type PostCardsProps = {
  posts: Post[]
}

type PostCardProps = Post

const PostCards = (props: PostCardsProps) => {
  const { posts } = props

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {posts.map((post) => (
        <PostCard key={post.slug} {...post} />
      ))}
    </div>
  )
}

const PostCard = (props: PostCardProps) => {
  const { slug, title, summary, date, featured } = props
  const formattedDate = useFormattedDate(date)
  const t = useTranslations()

  const viewsQuery = api.views.get.useQuery({
    slug
  })

  const likesQuery = api.likes.get.useQuery({
    slug
  })

  return (
    <Link
      href={`/blog/${slug}`}
      className='group bg-bg-surface shadow-feature-card hover:bg-bg-hover relative overflow-hidden rounded-lg border border-[var(--border-subtle)] transition-colors'
    >
      {featured && (
        <div className='absolute top-2 right-2 z-10'>
          <Badge
            variant='secondary'
            className='text-accent-earth-text border-[var(--accent-border)] bg-[var(--accent-dim)] px-1.5 py-0.5 text-[10px]'
          >
            <Star className='mr-0.5 h-2 w-2' />
            {t('component.filtered-posts.featured')}
          </Badge>
        </div>
      )}

      <BlurImage
        src={`/images/blog/${slug}/cover.png`}
        className='aspect-[16/9] w-full overflow-hidden'
        width={1200}
        height={630}
        imageClassName='object-cover brightness-[0.78] saturate-[0.85] transition-transform group-hover:scale-[1.03]'
        alt={title}
      />

      <div className='p-4'>
        <div className='text-text-tertiary mb-2 flex items-center justify-between gap-1.5 font-mono text-[10px]'>
          {formattedDate}
          <div className='flex gap-1.5'>
            {likesQuery.status === 'pending' ? '--' : null}
            {likesQuery.status === 'error' ? t('common.error') : null}
            {likesQuery.status === 'success' ? (
              <div>{t('common.likes', { count: likesQuery.data.likes })}</div>
            ) : null}
            <div>&middot;</div>
            {viewsQuery.status === 'pending' ? '--' : null}
            {viewsQuery.status === 'error' ? t('common.error') : null}
            {viewsQuery.status === 'success' ? (
              <div>{t('common.views', { count: viewsQuery.data.views })}</div>
            ) : null}
          </div>
        </div>
        <h3 className='group-hover:text-accent-earth-text mb-1 text-sm font-medium transition-colors duration-150'>
          {title}
        </h3>
        <p className='text-muted-foreground line-clamp-2 text-xs'>{summary}</p>
      </div>
    </Link>
  )
}

export default PostCards
