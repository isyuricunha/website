'use client'

import { useLocale, useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage } from '@isyuricunha/ui'
import { allPosts, type Post } from 'content-collections'
import { ArrowUpRightIcon } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

import { useFormattedDate } from '@/hooks/use-formatted-date'
import { api } from '@/trpc/react'

import Link from '../link'

const variants = {
  initial: {
    y: 0,
    opacity: 1
  },
  animate: {
    y: 0,
    opacity: 1
  }
}

type CardProps = {
  post: Post
}

const LatestArticles = () => {
  const projectsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(projectsRef, { once: true, margin: '-100px' })
  const t = useTranslations()
  const locale = useLocale()
  const filteredPosts = allPosts
    .toSorted((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .filter((post) => post.locale === locale)
    .slice(0, 2)

  const featuredPost = filteredPosts[0]
  const supportingPost = filteredPosts[1]

  if (!featuredPost) return null

  return (
    <motion.section
      initial='initial'
      animate={isInView ? 'animate' : 'initial'}
      variants={variants}
      ref={projectsRef}
      transition={{
        duration: 0.5
      }}
      className='editorial-section'
    >
      <div className='editorial-text'>
        <span className='label-mono'>{t('homepage.latest-articles.card')}</span>
        <h2>{t('homepage.latest-articles.title')}</h2>
        <p>{featuredPost.summary}</p>
        <Link href='/blog' className='cta-link'>
          {t('homepage.latest-articles.more')} →
        </Link>
      </div>

      <div className='space-y-4'>
        <ArticleCard post={featuredPost} />
        {supportingPost ? <ArticleSummary post={supportingPost} /> : null}
      </div>
    </motion.section>
  )
}

const ArticleCard = (props: CardProps) => {
  const { post } = props
  const { slug, title, summary, date } = post
  const formattedDate = useFormattedDate(date)
  const t = useTranslations()

  const viewsQuery = api.views.get.useQuery({
    slug
  })

  const likesQuery = api.likes.get.useQuery({
    slug
  })

  return (
    <Link href={`/blog/${slug}`} className='app-window group block'>
      <div className='app-window-chrome'>
        <span className='window-dot' />
        <span className='window-dot' />
        <span className='window-dot' />
        <span className='label-mono ml-2 truncate normal-case'>{formattedDate}</span>
      </div>
      <div className='bg-bg-surface relative aspect-[16/9] overflow-hidden'>
        <BlurImage
          width={1200}
          height={630}
          src={`/images/blog/${slug}/cover.png`}
          alt={title}
          className='absolute inset-0 h-full w-full object-cover'
          imageClassName='object-cover brightness-[0.75] saturate-[0.85]'
        />
      </div>
      <div className='p-5'>
        <div className='text-text-tertiary mb-3 flex items-center gap-1.5 font-mono text-[11px]'>
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
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h3 className='text-base font-medium sm:text-lg'>{title}</h3>
            <p className='mt-2 text-sm'>{summary}</p>
          </div>
          <ArrowUpRightIcon className='text-accent-earth-text mt-1 size-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100' />
        </div>
      </div>
    </Link>
  )
}

const ArticleSummary = ({ post }: CardProps) => {
  const formattedDate = useFormattedDate(post.date)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className='cursor-card shadow-feature-card block rounded-lg p-5'
    >
      <span className='label-mono'>{formattedDate}</span>
      <h3 className='mt-3 text-base font-medium'>{post.title}</h3>
      <p className='mt-2 line-clamp-2 text-sm'>{post.summary}</p>
    </Link>
  )
}

export default LatestArticles
