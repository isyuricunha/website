'use client'

import type { Post } from 'content-collections'

import { useTranslations } from '@tszhong0411/i18n/client'
import { BlurImage, Badge } from '@tszhong0411/ui'
import { Clock, Calendar, Star } from 'lucide-react'

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
  const { slug, title, summary, date, readingTime, category, tags, featured } = props
  const formattedDate = useFormattedDate(date)
  const t = useTranslations()

  const viewsQuery = api.views.get.useQuery({
    slug
  })

  const likesQuery = api.likes.get.useQuery({
    slug
  })

  return (
    <Link href={`/blog/${slug}`} className='shadow-feature-card group rounded-2xl px-1.5 py-2 relative overflow-hidden'>
      {featured && (
        <div className='absolute top-2 right-2 z-10'>
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px] px-1.5 py-0.5'>
            <Star className='h-2 w-2 mr-0.5' />
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
        <div className='flex items-center justify-between gap-1.5 text-[10px] text-zinc-500 mb-1.5'>
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
        <h3 className='text-sm font-medium mb-1 group-hover:text-primary transition-colors duration-200'>{title}</h3>
        <p className='text-muted-foreground text-xs line-clamp-2'>{summary}</p>
      </div>
    </Link>
  )
}

export default PostCards
