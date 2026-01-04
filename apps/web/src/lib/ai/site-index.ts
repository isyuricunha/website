import { i18n } from '@isyuricunha/i18n/config'
import { allPages, allPosts, allProjects } from 'content-collections'

import { getLocalizedPath } from '@/utils/get-localized-path'

type SiteEntryType = 'post' | 'project' | 'page'

type SiteEntry = {
  type: SiteEntryType
  title: string
  description: string
  href: string
  slug: string
  locale: string
}

type PageContext = {
  type: SiteEntryType
  title: string
  description: string
  href: string
  contentExcerpt: string
}

type Citation = {
  id: string
  title: string
  href: string
  excerpt?: string
  type: SiteEntryType
}

const strip_locale_prefix = (path: string): string => {
  const locale_pattern = new RegExp(`^/(${i18n.locales.join('|')})(/|$)`, 'i')
  return path.replace(locale_pattern, '/').replace(/\/+/g, '/')
}

const tokenize = (value: string): string[] => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

export const build_site_index = (locale: string): SiteEntry[] => {
  const entries: SiteEntry[] = []

  for (const post of allPosts) {
    if (post.locale !== locale) continue
    entries.push({
      type: 'post',
      title: post.title,
      description: post.summary,
      href: getLocalizedPath({ slug: `/blog/${post.slug}`, locale }),
      slug: post.slug,
      locale
    })
  }

  for (const project of allProjects) {
    if (project.locale !== locale) continue
    entries.push({
      type: 'project',
      title: project.name,
      description: project.description,
      href: getLocalizedPath({ slug: `/projects/${project.slug}`, locale }),
      slug: project.slug,
      locale
    })
  }

  for (const page of allPages) {
    if (page.locale !== locale) continue
    entries.push({
      type: 'page',
      title: page._meta?.path?.split(/[/\\]/).at(-1) ?? page.slug,
      description: page.slug,
      href: getLocalizedPath({ slug: `/${page.slug}`, locale }),
      slug: page.slug,
      locale
    })
  }

  const unique_by_href = Array.from(new Map(entries.map((e) => [e.href, e])).values())
  return unique_by_href
}

export const get_page_context = (page_path: string, locale: string): PageContext | null => {
  const normalized = strip_locale_prefix(page_path || '')

  const blog_match = /^\/blog\/([^/]+)$/.exec(normalized)
  if (blog_match?.[1]) {
    const slug = blog_match[1]
    const post = allPosts.find((p) => p.slug === slug && p.locale === locale)
    if (!post) return null
    return {
      type: 'post',
      title: post.title,
      description: post.summary,
      href: getLocalizedPath({ slug: `/blog/${post.slug}`, locale }),
      contentExcerpt: post.content.slice(0, 1200)
    }
  }

  const project_match = /^\/projects\/([^/]+)$/.exec(normalized)
  if (project_match?.[1]) {
    const slug = project_match[1]
    const project = allProjects.find((p) => p.slug === slug && p.locale === locale)
    if (!project) return null
    return {
      type: 'project',
      title: project.name,
      description: project.description,
      href: getLocalizedPath({ slug: `/projects/${project.slug}`, locale }),
      contentExcerpt: project.content.slice(0, 1200)
    }
  }

  const page_match = /^\/([^/]+)$/.exec(normalized)
  if (page_match?.[1]) {
    const slug = page_match[1]
    const page = allPages.find((p) => p.slug === slug && p.locale === locale)
    if (!page) return null
    return {
      type: 'page',
      title: slug,
      description: slug,
      href: getLocalizedPath({ slug: `/${page.slug}`, locale }),
      contentExcerpt: page.content.slice(0, 1200)
    }
  }

  return null
}

export const find_citations = (params: {
  message: string
  locale: string
  page_path?: string
  limit?: number
}): Citation[] => {
  const { message, locale, page_path, limit = 5 } = params
  const tokens = tokenize(message)
  const index = build_site_index(locale)

  const scored = index
    .map((entry) => {
      const haystack_title = entry.title.toLowerCase()
      const haystack_desc = entry.description.toLowerCase()
      const haystack_slug = entry.slug.toLowerCase()

      let score = 0
      for (const token of tokens) {
        if (haystack_title.includes(token)) score += 3
        if (haystack_desc.includes(token)) score += 2
        if (haystack_slug.includes(token)) score += 1
      }

      return { entry, score }
    })
    .filter((r) => r.score > 0)
    .toSorted((a, b) => b.score - a.score)

  const citations: Citation[] = []

  const page_ctx = page_path ? get_page_context(page_path, locale) : null
  if (page_ctx) {
    citations.push({
      id: 'page',
      title: page_ctx.title,
      href: page_ctx.href,
      excerpt: page_ctx.description,
      type: page_ctx.type
    })
  }

  for (const item of scored.slice(0, Math.max(0, limit - citations.length))) {
    citations.push({
      id: `${item.entry.type}:${item.entry.slug}`,
      title: item.entry.title,
      href: item.entry.href,
      excerpt: item.entry.description,
      type: item.entry.type
    })
  }

  return citations.slice(0, limit)
}

export const build_navigation_answer = (params: {
  query: string
  locale: string
  limit?: number
}): { message: string; citations: Citation[] } => {
  const { query, locale, limit = 5 } = params

  const citations = find_citations({ message: query, locale, limit })

  if (citations.length === 0) {
    const message = locale.startsWith('pt')
      ? 'Não encontrei nada muito próximo. Você pode tentar buscar por outra palavra-chave (ex.: "blog", "projetos", "sobre").'
      : 'I could not find a close match. Try different keywords (e.g., "blog", "projects", "about").'

    return { message, citations: [] }
  }

  const intro = locale.startsWith('pt')
    ? 'Encontrei estas páginas que podem ajudar:'
    : 'Here are some pages that may help:'

  const lines = citations.map((c) => `- ${c.title}: ${c.href}`)

  return {
    message: [intro, '', ...lines].join('\n'),
    citations
  }
}
