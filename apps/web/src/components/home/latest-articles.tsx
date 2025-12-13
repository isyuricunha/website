'use client'

import { useLocale, useTranslations } from '@tszhong0411/i18n/client'
import { BlurImage, buttonVariants } from '@tszhong0411/ui'
import { cn } from '@tszhong0411/utils'
import { allPosts, type Post } from 'content-collections'
import { ArrowUpRightIcon, PencilIcon } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

import { useFormattedDate } from '@/hooks/use-formatted-date'
import { api } from '@/trpc/react'

import Link from '../link'

const variants = {
  initial: {
    y: 40,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1
  }
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

  return (
    <motion.div
      initial='initial'
      animate={isInView ? 'animate' : 'initial'}
      variants={variants}
      ref={projectsRef}
      transition={{
        duration: 0.5
      }}
      className='my-8 sm:my-10 lg:my-12'
    >
      <motion.h2
        className='text-center text-lg font-medium sm:text-xl lg:text-2xl'
        initial={{
          y: 30,
          opacity: 0
        }}
        animate={{
          y: 0,
          opacity: 1
        }}
        transition={{
          duration: 0.3
        }}
      >
        {t('homepage.latest-articles.title')}
      </motion.h2>
      <motion.div
        className='mt-12 grid gap-4 md:grid-cols-2'
        initial={{
          y: 40,
          opacity: 0
        }}
        animate={{
          y: 0,
          opacity: 1
        }}
        transition={{
          duration: 0.3
        }}
      >
        {filteredPosts.map((post) => (
          <Card key={post.slug} post={post} />
        ))}
      </motion.div>
      <div className='my-8 flex items-center justify-center'>
        <Link
          href='/blog'
          className={cn(
            buttonVariants({
              variant: 'outline'
            }),
            'min-h-[36px] rounded-full px-4 py-2 text-xs sm:text-sm'
          )}
        >
          {t('homepage.latest-articles.more')}
        </Link>
      </div>
    </motion.div>
  )
}

type CardProps = {
  post: Post
}

const Card = (props: CardProps) => {
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
    <Link href={`/blog/${slug}`} className='shadow-feature-card group relative rounded-2xl p-1.5'>
      <div className='flex items-center justify-between p-2'>
        <div className='flex items-center gap-1.5'>
          <PencilIcon className='size-3' />
          <h2 className='text-[10px] sm:text-xs'>{t('homepage.latest-articles.card')}</h2>
        </div>
        <ArrowUpRightIcon className='size-3 opacity-0 transition-opacity group-hover:opacity-100' />
      </div>
      <BlurImage
        width={1200}
        height={630}
        src={`/images/blog/${slug}/cover.png`}
        alt={title}
        className='rounded-lg'
      />
      <div className='flex items-center justify-between gap-1.5 px-1.5 pt-2 text-[10px] text-zinc-500'>
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
      <div className='flex flex-col px-1.5 py-2 transition-transform ease-out group-hover:translate-x-0.5'>
        <h3 className='text-sm font-medium sm:text-base'>{title}</h3>
        <p className='text-muted-foreground mt-0.5 text-xs'>{summary}</p>
      </div>
    </Link>
  )
}

export default LatestArticles
