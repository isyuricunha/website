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
    <Link href={`/blog/${slug}`} className='shadow-feature-card group rounded-xl px-2 py-4 relative overflow-hidden'>
      {featured && (
        <div className='absolute top-3 right-3 z-10'>
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            <Star className='h-3 w-3 mr-1' />
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
      
      <div className='flex items-center justify-between gap-2 px-2 pt-4 text-sm text-muted-foreground'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            {formattedDate}
          </div>
          {readingTime && (
            <div className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              {readingTime} min read
            </div>
          )}
        </div>
        
        <div className='flex gap-2'>
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
      
      <div className='flex flex-col px-2 py-4'>
        <div className='flex items-start justify-between gap-2 mb-2'>
          <h3 className='text-2xl font-semibold group-hover:text-primary transition-colors'>{title}</h3>
          {category && (
            <Badge variant='outline' className='text-xs shrink-0'>
              {category}
            </Badge>
          )}
        </div>
        
        <p className='text-muted-foreground mt-2 line-clamp-2'>{summary}</p>
        
        {tags && tags.length > 0 && (
          <div className='flex flex-wrap gap-1 mt-3'>
            {tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant='secondary' className='text-xs'>
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant='secondary' className='text-xs'>
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default PostCards
