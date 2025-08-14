'use client'

import type { Project } from 'content-collections'

import { BlurImage } from '@tszhong0411/ui'
import { ExternalLink, Github } from 'lucide-react'
import { motion } from 'motion/react'

import Link from './link'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from './ui/enhanced-card'

type ProjectCardProps = Project
type ProjectCardsProps = {
  projects: Project[]
}

const ProjectCards = (props: ProjectCardsProps) => {
  const { projects } = props

  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {projects.map((project, index) => (
        <motion.div
          key={project.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <ProjectCard {...project} />
        </motion.div>
      ))}
    </div>
  )
}

const ProjectCard = (props: ProjectCardProps) => {
  const { name, description, techstack, slug, homepage, repository } = props

  return (
    <EnhancedCard className="group overflow-hidden" gradient>
      <EnhancedCardHeader className="p-0">
        <div className="relative overflow-hidden">
          <BlurImage
            src={`/images/projects/${slug}/cover.png`}
            width={1280}
            height={832}
            imageClassName='transition-transform duration-500 group-hover:scale-110'
            alt={name}
            className='aspect-video w-full object-cover'
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Action buttons overlay */}
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
            {repository && (
              <Link
                href={repository}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="h-4 w-4 text-white" />
              </Link>
            )}
            {homepage && (
              <Link
                href={homepage}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 text-white" />
              </Link>
            )}
          </div>
        </div>
      </EnhancedCardHeader>
      
      <EnhancedCardContent className="space-y-4">
        <div className="space-y-2">
          <Link href={`/projects/${slug}`}>
            <h3 className='text-xl font-semibold transition-colors group-hover:text-primary'>
              {name}
            </h3>
          </Link>
          <p className='text-sm text-muted-foreground line-clamp-2'>
            {description}
          </p>
        </div>
        
        <div className='flex flex-wrap gap-1.5'>
          {techstack.slice(0, 4).map((label) => (
            <span
              key={label}
              className='inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20'
            >
              {label}
            </span>
          ))}
          {techstack.length > 4 && (
            <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'>
              +{techstack.length - 4}
            </span>
          )}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}

export default ProjectCards
