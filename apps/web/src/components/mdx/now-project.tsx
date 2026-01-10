import type { ReactNode } from 'react'

import { Badge } from '@isyuricunha/ui'
import { getLocale, getTranslations } from '@isyuricunha/i18n/server'
import { Clock, ExternalLink, Github, Globe, Tag } from 'lucide-react'

import Link from '../link'

type GithubRepo = {
  full_name: string
  html_url: string
  description: string | null
  pushed_at: string
  default_branch: string
  homepage?: string | null
  stargazers_count: number
}

type GithubRelease = {
  tag_name: string
  html_url: string
}

type NowProjectProps = {
  repo: string
  name?: string
  website?: string
  children?: ReactNode
}

const get_github_headers = () => {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28'
  }

  const token = process.env.GITHUB_TOKEN
  if (token) headers.authorization = `Bearer ${token}`

  return headers
}

const fetch_repo = async (repo: string): Promise<GithubRepo | null> => {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: get_github_headers(),
      next: { revalidate: 60 * 60 }
    })

    if (!res.ok) return null

    return (await res.json()) as GithubRepo
  } catch {
    return null
  }
}

const fetch_latest_release = async (repo: string): Promise<GithubRelease | null> => {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: get_github_headers(),
      next: { revalidate: 60 * 60 }
    })

    if (!res.ok) return null

    return (await res.json()) as GithubRelease
  } catch {
    return null
  }
}

const format_date = (iso: string, locale: string) => {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(date)
}

const NowProject = async (props: NowProjectProps) => {
  const { repo, name, website, children } = props

  const t = await getTranslations('component.now-project')
  const locale = await getLocale()

  const [repoData, latestRelease] = await Promise.all([
    fetch_repo(repo),
    fetch_latest_release(repo)
  ])

  const displayName = name ?? repoData?.full_name ?? repo
  const githubUrl = repoData?.html_url ?? `https://github.com/${repo}`
  const updatedLabel = repoData?.pushed_at ? format_date(repoData.pushed_at, locale) : null
  const repoWebsite = website ?? repoData?.homepage ?? null
  const commitsUrl = repoData?.default_branch
    ? `${githubUrl}/commits/${repoData.default_branch}`
    : `${githubUrl}/commits`

  return (
    <div className='not-prose my-4 rounded-lg border p-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <Link href={githubUrl} className='flex items-center gap-2 font-semibold no-underline'>
              <Github className='h-4 w-4' />
              <span className='truncate'>{displayName}</span>
              <ExternalLink className='text-muted-foreground h-3.5 w-3.5' />
            </Link>
          </div>

          {children ? <div className='text-muted-foreground mt-2 text-sm'>{children}</div> : null}
        </div>

        <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
          {repoWebsite ? (
            <Link href={repoWebsite} className='no-underline'>
              <Badge variant='secondary' className='gap-1'>
                <Globe className='h-3 w-3' />
                {t('website')}
              </Badge>
            </Link>
          ) : null}

          {latestRelease?.tag_name ? (
            <Link href={latestRelease.html_url} className='no-underline'>
              <Badge variant='secondary' className='gap-1'>
                <Tag className='h-3 w-3' />
                {t('release')}: {latestRelease.tag_name}
              </Badge>
            </Link>
          ) : null}

          {updatedLabel ? (
            <Link href={commitsUrl} className='no-underline'>
              <Badge variant='secondary' className='gap-1'>
                <Clock className='h-3 w-3' />
                {t('updated')}: {updatedLabel}
              </Badge>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default NowProject
