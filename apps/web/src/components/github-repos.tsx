'use client'
import React from 'react'

type Repo = {
  name: string
  description?: string | null
  stargazersCount: number
  language?: string | null
  url: string
}

type GithubReposProps = {
  repos: Repo[]
}

const GithubRepos = ({ repos }: GithubReposProps) => {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {repos.map((repo) => (
        <GithubRepoCard key={repo.name} repo={repo} />
      ))}
    </div>
  )
}

const GithubRepoCard = ({ repo }: { repo: Repo }) => {
  return (
    <a
      href={repo.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group rounded-xl border border-gray-200 px-2 py-4 transition-shadow hover:shadow-lg dark:border-zinc-700'
    >
      {/* Se futuramente tiver uma imagem para o repositório, pode inserir aqui um componente similar ao BlurImage */}
      <div className='flex-1 px-2 py-4'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>{repo.name}</h2>
          {repo.description && <p className='text-muted-foreground'>{repo.description}</p>}
        </div>
        <div className='mt-4 flex flex-wrap gap-2'>
          {repo.language && (
            <span className='rounded-full border bg-zinc-50 px-3 py-2 text-xs leading-4 dark:bg-zinc-900'>
              {repo.language}
            </span>
          )}
          <span className='rounded-full border bg-zinc-50 px-3 py-2 text-xs leading-4 dark:bg-zinc-900'>
            ⭐ {repo.stargazersCount}
          </span>
        </div>
      </div>
    </a>
  )
}

export default GithubRepos
