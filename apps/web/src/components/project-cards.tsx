'use client'

import type { Project } from 'content-collections'

import {
  BlurImage,
  Badge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@isyuricunha/ui'
import {
  ExternalLink,
  Github,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  CheckCircle,
  Archive,
  Beaker
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState, useMemo } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'

import Link from './link'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from './ui/enhanced-card'

type ProjectCardProps = Project
type ProjectCardsProps = {
  projects: Project[]
}

type FilterOptions = {
  search: string
  category: string
  status: string
  techStack: string
}

const statusConfig = {
  active: {
    labelKey: 'projects.status.active',
    icon: CheckCircle,
    color: 'bg-primary/10 text-primary border-primary/20'
  },
  archived: {
    labelKey: 'projects.status.archived',
    icon: Archive,
    color: 'bg-muted/40 text-muted-foreground border-border'
  },
  beta: {
    labelKey: 'projects.status.beta',
    icon: Beaker,
    color: 'bg-primary/10 text-primary border-primary/20'
  },
  completed: {
    labelKey: 'projects.status.completed',
    icon: CheckCircle,
    color: 'bg-primary/10 text-primary border-primary/20'
  }
} as const

const ProjectCards = (props: ProjectCardsProps) => {
  const { projects } = props
  const t = useTranslations()
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    status: 'all',
    techStack: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Extract unique values for filters
  const { categories, statuses, techStacks } = useMemo(() => {
    const categorySet = new Set<string>()
    const statusSet = new Set<string>()
    const techStackSet = new Set<string>()

    projects.forEach((project) => {
      if (project.category) categorySet.add(project.category)
      if (project.status) statusSet.add(project.status)
      project.techstack.forEach((tech) => techStackSet.add(tech))
    })

    return {
      categories: Array.from(categorySet).sort(),
      statuses: Array.from(statusSet).sort(),
      techStacks: Array.from(techStackSet).sort()
    }
  }, [projects])

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const matchesSearch =
          filters.search === '' ||
          project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          project.description.toLowerCase().includes(filters.search.toLowerCase())

        const matchesCategory = filters.category === 'all' || project.category === filters.category
        const matchesStatus = filters.status === 'all' || project.status === filters.status
        const matchesTechStack =
          filters.techStack === 'all' || project.techstack.includes(filters.techStack)

        return matchesSearch && matchesCategory && matchesStatus && matchesTechStack
      })
      .sort((a, b) => {
        // Sort featured projects first, then by status priority
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1

        const statusPriority = { active: 0, beta: 1, completed: 2, archived: 3 }
        const aStatus = statusPriority[a.status || 'active'] || 0
        const bStatus = statusPriority[b.status || 'active'] || 0

        return aStatus - bStatus
      })
  }, [projects, filters])

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'all',
      techStack: 'all'
    })
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.techStack !== 'all'

  // Separate featured and regular projects
  const featuredProjects = useMemo(() => {
    return filteredProjects.filter((project) => project.featured)
  }, [filteredProjects])

  const regularProjects = useMemo(() => {
    return filteredProjects.filter((project) => !project.featured)
  }, [filteredProjects])

  return (
    <div className='space-y-8'>
      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <div className='space-y-6'>
          <div className='flex items-center gap-2'>
            <Star className='text-primary h-5 w-5' />
            <h2 className='text-lg font-semibold sm:text-xl'>{t('projects.featured')}</h2>
          </div>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {featuredProjects.map((project, index) => (
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
        </div>
      )}

      {/* All Projects Section */}
      <div className='space-y-6'>
        {featuredProjects.length > 0 && (
          <h2 className='text-lg font-semibold sm:text-xl'>{t('projects.all')}</h2>
        )}

        {/* Filter Controls */}
        <div className='space-y-4'>
          {/* Search and Filter Toggle */}
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Input
                type='text'
                placeholder={t('projects.search.placeholder')}
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className='pl-10'
              />
              <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform' />
            </div>

            <button
              type='button'
              onClick={() => setShowFilters(!showFilters)}
              className='hover:bg-muted/50 flex items-center gap-2 rounded-2xl border px-4 py-2 transition-colors'
            >
              <SlidersHorizontal className='h-4 w-4' />
              {showFilters ? t('projects.filters.hide') : t('projects.filters.show')}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className='bg-muted/20 grid grid-cols-1 gap-4 rounded-2xl border p-4 md:grid-cols-3'>
              {/* Category Filter */}
              {categories.length > 0 && (
                <div>
                  <Label className='mb-2 block text-xs font-medium sm:text-sm'>
                    {t('projects.filters.category')}
                  </Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('projects.filters.all-categories')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>{t('projects.filters.all-categories')}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <Label className='mb-2 block text-xs font-medium sm:text-sm'>
                  {t('projects.filters.status')}
                </Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('projects.filters.all-statuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>{t('projects.filters.all-statuses')}</SelectItem>
                    {statuses.map((status) => {
                      const config = statusConfig[status as keyof typeof statusConfig]
                      return (
                        <SelectItem key={status} value={status}>
                          <div className='flex items-center gap-2'>
                            {config && <config.icon className='h-4 w-4' />}
                            {config ? t(config.labelKey as any) : status}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Tech Stack Filter */}
              <div>
                <Label className='mb-2 block text-xs font-medium sm:text-sm'>
                  {t('projects.filters.technology')}
                </Label>
                <Select
                  value={filters.techStack}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, techStack: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('projects.filters.all-technologies')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>{t('projects.filters.all-technologies')}</SelectItem>
                    {techStacks.map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className='text-muted-foreground flex items-center justify-between text-xs sm:text-sm'>
            <span>
              {hasActiveFilters ? (
                <>{t('projects.results.found', { count: filteredProjects.length })}</>
              ) : (
                <>{t('projects.results.showing', { count: regularProjects.length })}</>
              )}
            </span>
            {hasActiveFilters && (
              <button
                type='button'
                onClick={clearFilters}
                className='text-primary hover:text-primary/80 transition-colors'
              >
                {t('projects.filters.clear')}
              </button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {regularProjects.length === 0 ? (
          <div className='py-12 text-center'>
            <div className='mb-4 text-6xl'>🔍</div>
            <h3 className='mb-2 text-base font-semibold sm:text-lg'>{t('projects.empty.title')}</h3>
            <p className='text-muted-foreground mb-4 text-xs sm:text-sm'>
              {t('projects.empty.description')}
            </p>
            {hasActiveFilters && (
              <button
                type='button'
                onClick={clearFilters}
                className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-colors'
              >
                {t('projects.empty.show-all')}
              </button>
            )}
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {regularProjects.map((project, index) => (
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
        )}
      </div>
    </div>
  )
}

const ProjectCard = (props: ProjectCardProps) => {
  const {
    name,
    description,
    techstack,
    slug,
    homepage,
    repository,
    status = 'active',
    category,
    featured,
    startDate,
    endDate
  } = props
  const statusInfo = statusConfig[status]
  const t = useTranslations()

  return (
    <EnhancedCard className='group relative overflow-hidden' gradient>
      {/* Make the whole card clickable to the in-site project page */}
      <Link
        href={`/projects/${slug}`}
        aria-label={t('projects.card.open-aria', { name })}
        className='focus-visible:ring-primary/60 absolute inset-0 z-[5] rounded-2xl focus-visible:outline-none focus-visible:ring-2'
      >
        <span className='sr-only'>{t('projects.card.open', { name })}</span>
      </Link>
      {/* Status and Featured Badges */}
      <div className='absolute left-3 top-3 z-10 flex gap-2'>
        {featured && (
          <Badge variant='secondary' className='bg-primary/10 text-primary border-primary/20'>
            <Star className='mr-1 h-3 w-3' />
            {t('projects.card.featured')}
          </Badge>
        )}
        {statusInfo && (
          <Badge variant='secondary' className={statusInfo.color}>
            <statusInfo.icon className='mr-1 h-3 w-3' />
            {t(statusInfo.labelKey as any)}
          </Badge>
        )}
      </div>

      <EnhancedCardHeader className='p-0'>
        <div className='relative overflow-hidden'>
          <BlurImage
            src={`/images/projects/${slug}/cover.png`}
            width={1280}
            height={832}
            imageClassName='transition-transform duration-500 group-hover:scale-110'
            alt={name}
            className='aspect-video w-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        </div>
      </EnhancedCardHeader>

      <EnhancedCardContent className='space-y-4'>
        {/* Action buttons moved out of image; always visible and readable */}
        {(homepage || repository || props.github) && (
          <div className='relative z-20 -mt-2 flex items-center justify-start gap-2'>
            {(repository || props.github) && (
              <Link
                href={repository || props.github}
                target='_blank'
                rel='noopener noreferrer'
                title={t('projects.card.github.title')}
                aria-label={t('projects.card.github.aria')}
                className='bg-muted text-foreground border-border hover:bg-muted/70 focus-visible:ring-primary/60 inline-flex h-9 items-center gap-2 rounded-full border px-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 md:px-3'
                onClick={(e) => e.stopPropagation()}
              >
                <Github className='h-4 w-4' />
                <span className='hidden overflow-hidden text-xs font-medium md:inline-block md:max-w-0 md:opacity-0 md:transition-all md:group-hover:max-w-[64px] md:group-hover:opacity-100'>
                  {t('sitemap.labels.github')}
                </span>
              </Link>
            )}
            {homepage && (
              <Link
                href={homepage}
                target='_blank'
                rel='noopener noreferrer'
                title={t('projects.card.live.title')}
                aria-label={t('projects.card.live.aria')}
                className='bg-primary text-primary-foreground border-primary/60 hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex h-9 items-center gap-2 rounded-full border px-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 md:px-3'
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className='h-4 w-4' />
                <span className='hidden overflow-hidden text-xs font-medium md:inline-block md:max-w-0 md:opacity-0 md:transition-all md:group-hover:max-w-[40px] md:group-hover:opacity-100'>
                  {t('sitemap.labels.live-demo')}
                </span>
              </Link>
            )}
          </div>
        )}
        <div className='space-y-2'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='group-hover:text-primary text-base font-semibold transition-colors sm:text-lg'>
              {name}
            </h3>
            {category && (
              <Badge variant='outline' className='shrink-0 text-xs'>
                {category}
              </Badge>
            )}
          </div>

          <p className='text-muted-foreground line-clamp-2 text-xs sm:text-sm'>{description}</p>

          {/* Project Timeline */}
          {(startDate || endDate) && (
            <div className='text-muted-foreground flex items-center gap-2 text-xs sm:text-sm'>
              <Clock className='h-3 w-3' />
              {startDate && (
                <span className='text-xs'>
                  {t('projects.card.started-label')} {new Date(startDate).getFullYear()}
                  {endDate && ` - ${new Date(endDate).getFullYear()}`}
                </span>
              )}
            </div>
          )}
        </div>

        <div className='flex flex-wrap gap-1.5'>
          {techstack.slice(0, 4).map((label) => (
            <span
              key={label}
              className='bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition-colors'
            >
              {label}
            </span>
          ))}
          {techstack.length > 4 && (
            <span className='bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium'>
              +{techstack.length - 4}
            </span>
          )}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}

export default ProjectCards
