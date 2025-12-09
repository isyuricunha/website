'use client'

import { useLocale, useTranslations } from '@tszhong0411/i18n/client'
import { BlurImage, buttonVariants } from '@tszhong0411/ui'
import { cn } from '@tszhong0411/utils'
import { allProjects, type Project } from 'content-collections'
import { ArrowUpRightIcon, LightbulbIcon } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

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

type CardProps = {
  project: Project
}

const SelectedProjects = () => {
  const projectsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(projectsRef, { once: true, margin: '-100px' })
  const t = useTranslations()
  const locale = useLocale()
  const filteredProjects = allProjects.filter(
    (project) => project.selected && project.locale === locale
  )

  return (
    <motion.div
      initial='initial'
      animate={isInView ? 'animate' : 'initial'}
      variants={variants}
      ref={projectsRef}
      transition={{
        duration: 0.5
      }}
      className='relative my-8 sm:my-10 lg:my-12'
    >
      <motion.h2
        className='text-center text-lg sm:text-xl lg:text-2xl font-medium px-4'
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
        {t('homepage.selectedProjects.title')}
      </motion.h2>
      <motion.div
        className='mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-2 px-4'
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
        {filteredProjects.map((project) => (
          <Card key={project.slug} project={project} />
        ))}
      </motion.div>
      <div className='my-8 flex items-center justify-center px-4'>
        <Link
          href='/projects'
          className={cn(
            buttonVariants({
              variant: 'outline'
            }),
            'rounded-full min-h-[36px] px-4 py-2 text-xs sm:text-sm'
          )}
        >
          {t('homepage.selectedProjects.more')}
        </Link>
      </div>
    </motion.div>
  )
}

const Card = (props: CardProps) => {
  const { project } = props
  const { slug, name, description } = project
  const t = useTranslations()

  return (
    <Link
      key={slug}
      href={`/projects/${slug}`}
      className='shadow-feature-card group relative rounded-2xl p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    >
      <div className='flex items-center justify-between p-2'>
        <div className='flex items-center gap-1.5'>
          <LightbulbIcon className='size-3' />
          <h2 className='text-[10px] sm:text-xs'>{t('homepage.selectedProjects.card')}</h2>
        </div>
        <ArrowUpRightIcon className='size-3 opacity-0 transition-opacity group-hover:opacity-100' />
      </div>
      <div className='relative overflow-hidden rounded-lg ring-1 ring-border shadow-sm w-full aspect-[16/9]'>
        <BlurImage
          width={1280}
          height={832}
          src={`/images/projects/${slug}/cover.png`}
          alt={description}
          className='absolute inset-0 h-full w-full object-cover'
        />
      </div>
      <div className='mt-3 px-2 pb-2'>
        <h3 className='text-sm sm:text-base font-semibold truncate text-foreground'>
          {name}
        </h3>
        <p
          className='text-xs sm:text-sm text-muted-foreground'
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '60px'
          }}
        >
          {description}
        </p>
      </div>
    </Link>
  )
}

export default SelectedProjects
