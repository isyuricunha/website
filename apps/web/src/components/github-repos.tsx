'use client'
import * as React from 'react'
import { Star, GitFork, ExternalLink } from 'lucide-react'
import { Badge } from '@isyuricunha/ui'
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
  return (
    <Link
      href={repo.url}
      className='hover:border-primary/20 dark:hover:border-primary/20 group relative overflow-hidden rounded-lg border border-gray-200 p-3 transition-all hover:shadow-md dark:border-zinc-700'
    >
      {/* External link indicator */}
      <div className='absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100'>
        <ExternalLink className='text-muted-foreground h-4 w-4' />
      </div>

      <div className='space-y-2'>
        <div className='space-y-1'>
          <h3 className='group-hover:text-primary line-clamp-1 pr-8 text-sm font-medium transition-colors'>
            {repo.name}
          </h3>
          {repo.description && (
            <p className='text-muted-foreground line-clamp-2 text-xs'>{repo.description}</p>
          )}
        </div>

        {/* GitHub Stats */}
        <div className='text-muted-foreground flex items-center gap-3 text-xs'>
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
            <Badge variant='secondary' className='px-2 py-0.5 text-xs'>
              {repo.language}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

export default GithubRepos
