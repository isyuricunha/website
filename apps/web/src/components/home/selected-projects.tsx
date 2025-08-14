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
      className='relative my-12 sm:my-16 lg:my-24'
    >
      <motion.h2
        className='text-center text-2xl sm:text-3xl lg:text-4xl font-semibold px-4'
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
            'rounded-xl min-h-[44px] px-6 py-3 text-sm sm:text-base'
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
      className='shadow-feature-card group relative rounded-xl p-2 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    >
      <div className='flex items-center justify-between p-3 sm:p-4'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <LightbulbIcon className='size-4 sm:size-[18px]' />
          <h2 className='text-sm sm:text-base'>{t('homepage.selectedProjects.card')}</h2>
        </div>
        <ArrowUpRightIcon className='size-4 sm:size-[18px] opacity-0 transition-opacity group-hover:opacity-100' />
      </div>
      <BlurImage
        width={1280}
        height={832}
        src={`/images/projects/${slug}/cover.png`}
        alt={description}
        className='rounded-lg w-full h-auto'
      />
      <div className='absolute bottom-4 sm:bottom-6 left-4 sm:left-7 flex flex-col transition-[left] ease-out group-hover:left-[20px] sm:group-hover:left-[30px] max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3.5rem)]'>
        <h3 className='text-lg sm:text-xl lg:text-2xl font-semibold text-white truncate'>{name}</h3>
        <p className='dark:text-muted-foreground mt-1 sm:mt-2 text-zinc-100 text-sm sm:text-base line-clamp-2'>{description}</p>
      </div>
    </Link>
  )
}

export default SelectedProjects
