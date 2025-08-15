'use client'
import React from 'react'
import { Star, GitFork, AlertCircle, ExternalLink } from 'lucide-react'
import { Badge } from '@tszhong0411/ui'
import Link from './link'

type Repo = {
  name: string
  description?: string | null
  stargazersCount: number
  forksCount?: number
  openIssuesCount?: number
  language?: string | null
  url: string
  updatedAt?: string
}

type GithubReposProps = {
  repos: Repo[]
}

const GithubRepos = ({ repos }: GithubReposProps) => {
  return (
    <div className='grid gap-3 md:grid-cols-3 lg:grid-cols-4'>
      {repos.map((repo) => (
        <GithubRepoCard key={repo.name} repo={repo} />
      ))}
    </div>
  )
}

const GithubRepoCard = ({ repo }: { repo: Repo }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  return (
    <Link
      href={repo.url}
      className='group rounded-lg border border-gray-200 p-3 transition-all hover:shadow-md hover:border-primary/20 dark:border-zinc-700 dark:hover:border-primary/20 relative overflow-hidden'
    >
      {/* External link indicator */}
      <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'>
        <ExternalLink className='h-4 w-4 text-muted-foreground' />
      </div>
      
      <div className='space-y-2'>
        <div className='space-y-1'>
          <h3 className='text-sm font-medium group-hover:text-primary transition-colors pr-8 line-clamp-1'>
            {repo.name}
          </h3>
          {repo.description && (
            <p className='text-xs text-muted-foreground line-clamp-2'>
              {repo.description}
            </p>
          )}
        </div>
        
        {/* GitHub Stats */}
        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Star className='h-3 w-3 text-yellow-500' />
            <span>{repo.stargazersCount}</span>
          </div>
          {repo.forksCount !== undefined && (
            <div className='flex items-center gap-1'>
              <GitFork className='h-3 w-3' />
              <span>{repo.forksCount}</span>
            </div>
          )}
        </div>
        
        {/* Language */}
        <div className='flex items-center justify-between'>
          {repo.language && (
            <Badge variant='secondary' className='text-xs px-2 py-0.5'>
              {repo.language}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

export default GithubRepos
