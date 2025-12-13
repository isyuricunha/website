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
  const tv = (key: string, values?: Record<string, any>) => (t as any)(key, values) as string

  const viewsQuery = api.views.get.useQuery({
    slug
  })

  const likesQuery = api.likes.get.useQuery({
    slug
  })

  return (
    <Link
      href={`/blog/${slug}`}
      className='shadow-feature-card group relative overflow-hidden rounded-2xl px-1.5 py-2'
    >
      {featured && (
        <div className='absolute right-2 top-2 z-10'>
          <Badge
            variant='secondary'
            className='border-yellow-200 bg-yellow-100 px-1.5 py-0.5 text-[10px] text-yellow-800'
          >
            <Star className='mr-0.5 h-2 w-2' />
            Featured
          </Badge>
        </div>
      )}

      <BlurImage
        src={`/images/blog/${slug}/cover.png`}
        className='rounded-lg'
        width={1200}
        height={630}
        imageClassName='transition-transform group-hover:scale-105'
        alt={title}
      />

      <div className='px-2 py-2'>
        <div className='mb-1.5 flex items-center justify-between gap-1.5 text-[10px] text-zinc-500'>
          {formattedDate}
          <div className='flex gap-1.5'>
            {likesQuery.status === 'pending' ? '--' : null}
            {likesQuery.status === 'error' ? t('common.error') : null}
            {likesQuery.status === 'success' ? (
              <div>{tv('common.likes', { count: likesQuery.data.likes })}</div>
            ) : null}
            <div>&middot;</div>
            {viewsQuery.status === 'pending' ? '--' : null}
            {viewsQuery.status === 'error' ? t('common.error') : null}
            {viewsQuery.status === 'success' ? (
              <div>{tv('common.views', { count: viewsQuery.data.views })}</div>
            ) : null}
          </div>
        </div>
        <h3 className='group-hover:text-primary mb-1 text-sm font-medium transition-colors duration-200'>
          {title}
        </h3>
        <p className='text-muted-foreground line-clamp-2 text-xs'>{summary}</p>
      </div>
    </Link>
  )
}

export default PostCards
