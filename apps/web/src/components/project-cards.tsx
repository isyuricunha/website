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
import { SiGithub } from '@icons-pack/react-simple-icons'
import {
  ExternalLink,
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
    color: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]'
  },
  archived: {
    labelKey: 'projects.status.archived',
    icon: Archive,
    color: 'bg-muted/40 text-muted-foreground border-border'
  },
  beta: {
    labelKey: 'projects.status.beta',
    icon: Beaker,
    color: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]'
  },
  completed: {
    labelKey: 'projects.status.completed',
    icon: CheckCircle,
    color: 'bg-[var(--accent-dim)] text-accent-earth-text border-[var(--accent-border)]'
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
      categories: Array.from(categorySet).toSorted(),
      statuses: Array.from(statusSet).toSorted(),
      techStacks: Array.from(techStackSet).toSorted()
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
      .toSorted((a, b) => {
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
            <Star className='text-accent-earth-text h-5 w-5' />
            <h2 className='text-lg font-medium sm:text-xl'>{t('projects.featured')}</h2>
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
          <h2 className='text-lg font-medium sm:text-xl'>{t('projects.all')}</h2>
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
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
            </div>

            <button
              type='button'
              onClick={() => setShowFilters(!showFilters)}
              className='hover:bg-bg-hover flex items-center gap-2 rounded-md border border-[var(--border-subtle)] px-4 py-2 transition-colors'
            >
              <SlidersHorizontal className='h-4 w-4' />
              {showFilters ? t('projects.filters.hide') : t('projects.filters.show')}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className='bg-bg-surface grid grid-cols-1 gap-4 rounded-lg border border-[var(--border-subtle)] p-4 md:grid-cols-3'>
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
                className='text-accent-earth-text hover:text-accent-earth-hover transition-colors'
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
            <h3 className='mb-2 text-base font-medium sm:text-lg'>{t('projects.empty.title')}</h3>
            <p className='text-muted-foreground mb-4 text-xs sm:text-sm'>
              {t('projects.empty.description')}
            </p>
            {hasActiveFilters && (
              <button
                type='button'
                onClick={clearFilters}
                className='border-accent-earth-hover bg-accent-earth text-text-inverse hover:bg-accent-earth-hover inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors'
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
    status,
    category,
    featured,
    startDate,
    endDate
  } = props
  const statusInfo = statusConfig[status]
  const t = useTranslations()

  return (
    <EnhancedCard className='group relative overflow-hidden' accentLine>
      {/* Make the whole card clickable to the in-site project page */}
      <Link
        href={`/projects/${slug}`}
        aria-label={t('projects.card.open-aria', { name })}
        className='focus-visible:ring-ring absolute inset-0 z-[5] rounded-lg focus-visible:ring-2 focus-visible:outline-none'
      >
        <span className='sr-only'>{t('projects.card.open', { name })}</span>
      </Link>
      {/* Status and Featured Badges */}
      <div className='absolute top-3 left-3 z-10 flex gap-2'>
        {featured && (
          <Badge
            variant='secondary'
            className='text-accent-earth-text border-[var(--accent-border)] bg-[var(--accent-dim)]'
          >
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
            imageClassName='brightness-[0.78] saturate-[0.85] transition-transform duration-500 group-hover:scale-[1.03]'
            alt={name}
            className='aspect-video w-full object-cover'
          />
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
                className='bg-bg-hover text-foreground hover:bg-bg-active focus-visible:ring-ring relative z-10 inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-subtle)] px-2 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none md:px-3'
                onClick={(e) => e.stopPropagation()}
              >
                <SiGithub className='h-4 w-4' />
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
                className='border-accent-earth-hover bg-accent-earth text-text-inverse hover:bg-accent-earth-hover focus-visible:ring-ring relative z-10 inline-flex h-9 items-center gap-2 rounded-md border px-2 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none md:px-3'
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
            <h3 className='group-hover:text-accent-earth-text text-base font-medium transition-colors sm:text-lg'>
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
              className='text-accent-earth-text hover:bg-bg-hover inline-flex items-center rounded-sm bg-[var(--accent-dim)] px-2 py-1 text-xs font-medium transition-colors'
            >
              {label}
            </span>
          ))}
          {techstack.length > 4 && (
            <span className='bg-bg-hover text-muted-foreground inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-medium'>
              +{techstack.length - 4}
            </span>
          )}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}

export default ProjectCards
