'use client'

import { useLocale, useTranslations } from '@isyuricunha/i18n/client'
import { BlurImage } from '@isyuricunha/ui'
import { allProjects, type Project } from 'content-collections'
import { ArrowUpRightIcon } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

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
  const featuredProject = filteredProjects[0]
  const supportingProjects = filteredProjects.slice(1, 3)

  if (!featuredProject) return null

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
        <span className='label-mono'>{t('homepage.selectedProjects.card')}</span>
        <h2>{t('homepage.selectedProjects.title')}</h2>
        <p>{featuredProject.description}</p>
        <Link href='/projects' className='cta-link'>
          {t('homepage.selectedProjects.more')} →
        </Link>
      </div>

      <div className='space-y-4'>
        <Card project={featuredProject} featured />
        {supportingProjects.length > 0 ? (
          <div className='card-grid'>
            {supportingProjects.map((project) => (
              <ProjectSummary key={project.slug} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </motion.section>
  )
}

const Card = (props: CardProps & { featured?: boolean }) => {
  const { project, featured } = props
  const { slug, name, description } = project

  return (
    <Link
      key={slug}
      href={`/projects/${slug}`}
      className='app-window group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
    >
      <div className='app-window-chrome'>
        <span className='window-dot' />
        <span className='window-dot' />
        <span className='window-dot' />
        <span className='label-mono ml-2 truncate normal-case'>{name}</span>
      </div>
      <div className='bg-bg-surface relative aspect-[16/9] w-full overflow-hidden'>
        <BlurImage
          width={1280}
          height={832}
          src={`/images/projects/${slug}/cover.png`}
          alt={description}
          className='absolute inset-0 h-full w-full object-cover'
          imageClassName='object-cover brightness-[0.78] saturate-[0.85]'
        />
      </div>
      <div className='flex items-start justify-between gap-4 p-5'>
        <div>
          <h3 className='text-foreground text-base font-medium sm:text-lg'>{name}</h3>
          {featured ? <p className='text-muted-foreground mt-2 text-sm'>{description}</p> : null}
        </div>
        <ArrowUpRightIcon className='text-accent-earth-text mt-1 size-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100' />
      </div>
    </Link>
  )
}

const ProjectSummary = ({ project }: CardProps) => {
  return (
    <Link href={`/projects/${project.slug}`} className='cursor-card block p-5'>
      <h3 className='text-base font-medium'>{project.name}</h3>
      <p className='mt-2 line-clamp-2 text-sm'>{project.description}</p>
    </Link>
  )
}

export default SelectedProjects
