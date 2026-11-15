import { getPage } from '#lib/content.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { GITHUB_USERNAME } from '#lib/constants.ts'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

// The now page stays on demand: the NowProject slots resolve live GitHub data
// per request with a one-hour cache, matching the Next.js revalidate window.
export const prerender = false

type GithubRepo = {
  full_name: string
  html_url: string
  description: string | null
  pushed_at: string
  homepage?: string | null
  stargazers_count: number
}

type GithubRelease = {
  tag_name: string
  html_url: string
}

const CACHE_TTL_MS = 60 * 60 * 1000
const repoCache = new Map<
  string,
  { at: number; repo: GithubRepo | null; release: GithubRelease | null }
>()

async function fetchJson(url: string): Promise<unknown | null> {
  const headers: Record<string, string> = { accept: 'application/vnd.github+json' }

  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const response = await fetch(url, { headers })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function resolveRepo(
  repo: string
): Promise<{ repo: GithubRepo | null; release: GithubRelease | null }> {
  const cached = repoCache.get(repo)

  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { repo: cached.repo, release: cached.release }
  }

  const [repoData, releaseData] = await Promise.all([
    fetchJson(`https://api.github.com/repos/${repo}`),
    fetchJson(`https://api.github.com/repos/${repo}/releases/latest`)
  ])

  const resolved = {
    repo: (repoData as GithubRepo | null) ?? null,
    release: (releaseData as GithubRelease | null) ?? null
  }

  repoCache.set(repo, { at: Date.now(), ...resolved })

  return resolved
}

const SLOT_PATTERN =
  /<div data-mdx-now-project="([^"]*)" data-name="([^"]*)" data-website="([^"]*)"><\/div>/g

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char
  )
}

async function renderNowProjectHtml(
  repoName: string,
  fallbackName: string,
  website: string,
  locale: string
): Promise<string> {
  const { repo, release } = await resolveRepo(repoName)
  const displayName = repo?.full_name?.split('/')[1] ?? fallbackName ?? repoName
  const url = repo?.html_url ?? `https://github.com/${repoName}`
  const pushed = repo?.pushed_at ? new Date(repo.pushed_at).toLocaleDateString(locale) : ''
  const stars = repo?.stargazers_count ?? 0
  const releaseTag = release?.tag_name

  const websiteLink = website
    ? ` <a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(website.replace(/^https?:\/\//, ''))}</a>`
    : ''

  // The card is a div (an <a> inside an <a> is invalid HTML and breaks the
  // card layout); the title and the website link carry the navigation.
  return `<div class="bg-bg-surface shadow-feature-card relative mb-4 flex flex-col gap-2 rounded-lg border border-[var(--border-subtle)] p-4 transition-colors"><div class="flex items-center justify-between gap-2"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-base font-medium">${escapeHtml(displayName)}</a><div class="text-muted-foreground text-xs">${escapeHtml(`★ ${stars}`)}</div></div>${repo?.description ? `<div class="text-muted-foreground text-sm">${escapeHtml(repo.description)}</div>` : ''}<div class="text-muted-foreground flex items-center gap-3 text-xs">${releaseTag ? `<span>${escapeHtml(releaseTag)}</span>` : ''}${pushed ? `<span>${escapeHtml(pushed)}</span>` : ''}${websiteLink}</div></div>`
}

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const page = getPage(locale, 'now')

  if (!page) {
    error(404, 'Page not found')
  }

  const t = await getServerTranslator(locale)
  const head = buildSeoHead({
    slug: '/now',
    locale,
    title: t('now.title'),
    description: t('now.description')
  })

  // Replace build-time NowProject slots with live GitHub data.
  const matches = [...page.html.matchAll(SLOT_PATTERN)]
  const resolved = await Promise.all(
    matches.map(async ([slot, repo, name, website]) => {
      const html = await renderNowProjectHtml(repo, name, website, locale)
      return [slot, html] as const
    })
  )

  let html = page.html
  for (const [slot, replacement] of resolved) {
    html = html.replace(slot, replacement)
  }

  return { ...head, html, owner: GITHUB_USERNAME }
}
