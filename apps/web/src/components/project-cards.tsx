'use client'

import type { Project } from 'content-collections'

import { BlurImage, Badge, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { ExternalLink, Github, Search, SlidersHorizontal, Star, Clock, CheckCircle, Archive, Beaker } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, useMemo } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'

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
  active: { labelKey: 'projects.status.active', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
  archived: { labelKey: 'projects.status.archived', icon: Archive, color: 'bg-gray-100 text-gray-800 border-gray-200' },
  beta: { labelKey: 'projects.status.beta', icon: Beaker, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { labelKey: 'projects.status.completed', icon: CheckCircle, color: 'bg-purple-100 text-purple-800 border-purple-200' }
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
    
    projects.forEach(project => {
      if (project.category) categorySet.add(project.category)
      if (project.status) statusSet.add(project.status)
      project.techstack.forEach(tech => techStackSet.add(tech))
    })
    
    return {
      categories: Array.from(categorySet).sort(),
      statuses: Array.from(statusSet).sort(),
      techStacks: Array.from(techStackSet).sort()
    }
  }, [projects])

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = filters.search === '' || 
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesCategory = filters.category === 'all' || project.category === filters.category
      const matchesStatus = filters.status === 'all' || project.status === filters.status
      const matchesTechStack = filters.techStack === 'all' || project.techstack.includes(filters.techStack)
      
      return matchesSearch && matchesCategory && matchesStatus && matchesTechStack
    }).sort((a, b) => {
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

  const hasActiveFilters = filters.search !== '' || filters.category !== 'all' || 
                          filters.status !== 'all' || filters.techStack !== 'all'

  // Separate featured and regular projects
  const featuredProjects = useMemo(() => {
    return filteredProjects.filter(project => project.featured)
  }, [filteredProjects])

  const regularProjects = useMemo(() => {
    return filteredProjects.filter(project => !project.featured)
  }, [filteredProjects])

  return (
    <div className="space-y-8">
      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg sm:text-xl font-semibold">{t('projects.featured')}</h2>
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
      <div className="space-y-6">
        {featuredProjects.length > 0 && (
          <h2 className="text-lg sm:text-xl font-semibold">{t('projects.all')}</h2>
        )}
        
        {/* Filter Controls */}
      <div className="space-y-4">
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={t('projects.search.placeholder')}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-2xl hover:bg-muted/50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? t('projects.filters.hide') : t('projects.filters.show')}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-2xl bg-muted/20">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <Label className="text-xs sm:text-sm font-medium mb-2 block">{t('projects.filters.category')}</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('projects.filters.all-categories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('projects.filters.all-categories')}</SelectItem>
                    {categories.map(category => (
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
              <Label className="text-xs sm:text-sm font-medium mb-2 block">{t('projects.filters.status')}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.filters.all-statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projects.filters.all-statuses')}</SelectItem>
                  {statuses.map(status => {
                    const config = statusConfig[status as keyof typeof statusConfig]
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          {config && <config.icon className="h-4 w-4" />}
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
              <Label className="text-xs sm:text-sm font-medium mb-2 block">{t('projects.filters.technology')}</Label>
              <Select value={filters.techStack} onValueChange={(value) => setFilters(prev => ({ ...prev, techStack: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.filters.all-technologies')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projects.filters.all-technologies')}</SelectItem>
                  {techStacks.map(tech => (
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
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <span>
            {hasActiveFilters ? (
              <>
                {t('projects.results.found', { count: filteredProjects.length })}
              </>
            ) : (
              <>{t('projects.results.showing', { count: regularProjects.length })}</>
            )}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {t('projects.filters.clear')}
            </button>
          )}
        </div>
      </div>

        {/* Projects Grid */}
        {regularProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">{t('projects.empty.title')}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {t('projects.empty.description')}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
  const { name, description, techstack, slug, homepage, repository, status = 'active', category, featured, startDate, endDate } = props
  const statusInfo = statusConfig[status as keyof typeof statusConfig]
  const t = useTranslations()

  return (
    <EnhancedCard className="group overflow-hidden relative" gradient>
      {/* Make the whole card clickable to the in-site project page */}
      <Link
        href={`/projects/${slug}`}
        aria-label={t('projects.card.open-aria', { name })}
        className="absolute inset-0 z-[5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
      >
        <span className="sr-only">{t('projects.card.open', { name })}</span>
      </Link>
      {/* Status and Featured Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {featured && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Star className="h-3 w-3 mr-1" />
            {t('projects.card.featured')}
          </Badge>
        )}
        {statusInfo && (
          <Badge variant="secondary" className={statusInfo.color}>
            <statusInfo.icon className="h-3 w-3 mr-1" />
            {t(statusInfo.labelKey as any)}
          </Badge>
        )}
      </div>

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </EnhancedCardHeader>
      
      <EnhancedCardContent className="space-y-4">
        {/* Action buttons moved out of image; always visible and readable */}
        {(homepage || repository || props.github) && (
          <div className="relative z-20 -mt-2 flex items-center justify-start gap-2">
            {(repository || props.github) && (
              <Link
                href={repository || props.github}
                target="_blank"
                rel="noopener noreferrer"
                title={t('projects.card.github.title')}
                aria-label={t('projects.card.github.aria')}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-muted px-2 md:px-3 text-foreground border border-border shadow-sm transition-all hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="h-4 w-4" />
                <span className="hidden md:inline-block text-xs font-medium overflow-hidden md:max-w-0 md:opacity-0 md:group-hover:max-w-[64px] md:group-hover:opacity-100 md:transition-all">
                  {t('sitemap.labels.github')}
                </span>
              </Link>
            )}
            {homepage && (
              <Link
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                title={t('projects.card.live.title')}
                aria-label={t('projects.card.live.aria')}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-2 md:px-3 text-primary-foreground border border-primary/60 shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden md:inline-block text-xs font-medium overflow-hidden md:max-w-0 md:opacity-0 md:group-hover:max-w-[40px] md:group-hover:opacity-100 md:transition-all">
                  {t('sitemap.labels.live-demo')}
                </span>
              </Link>
            )}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className='text-base sm:text-lg font-semibold transition-colors group-hover:text-primary'>
              {name}
            </h3>
            {category && (
              <Badge variant="outline" className="text-xs shrink-0">
                {category}
              </Badge>
            )}
          </div>
          
          <p className='text-xs sm:text-sm text-muted-foreground line-clamp-2'>
            {description}
          </p>

          {/* Project Timeline */}
          {(startDate || endDate) && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
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
              className='inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20'
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
