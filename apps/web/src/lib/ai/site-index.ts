import { i18n } from '@isyuricunha/i18n/config'
import { allPages, allPosts, allProjects, allSnippets } from 'content-collections'

import { getLocalizedPath } from '@/utils/get-localized-path'

type SiteEntryType = 'post' | 'project' | 'page' | 'snippet'

type SiteEntry = {
  type: SiteEntryType
  title: string
  description: string
  href: string
  slug: string
  locale: string
}

function recommend_snippets(params: {
  query: string
  locale: string
  limit?: number
  excludeIds?: string[]
  excludeSlugs?: string[]
}): Citation[] {
  const { query, locale, limit = 3, excludeIds = [], excludeSlugs = [] } = params
  const tokens = tokenize(query)

  const excluded_slugs_by_id = excludeIds
    .filter((id) => id.startsWith('snippet:'))
    .map((id) => id.slice('snippet:'.length))

  const excluded_slugs_by_query = extract_snippet_slugs_from_query(query)

  const excluded_slugs = new Set(
    unique([...excludeSlugs, ...excluded_slugs_by_id, ...excluded_slugs_by_query])
  )

  const scored = allSnippets
    .filter((s) => s.locale === locale)
    .filter((s) => !excluded_slugs.has(s.slug))
    .map((snippet) => {
      const haystack_title = snippet.title.toLowerCase()
      const haystack_desc = snippet.description.toLowerCase()
      const haystack_slug = snippet.slug.toLowerCase()

      let score = 0
      for (const token of tokens) {
        if (haystack_title.includes(token)) score += 3
        if (haystack_desc.includes(token)) score += 2
        if (haystack_slug.includes(token)) score += 1
      }

      const date = new Date((snippet as unknown as { date?: string }).date ?? 0).getTime()
      return { snippet, score, date: Number.isFinite(date) ? date : 0 }
    })
    .toSorted((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.date - a.date
    })

  const matched = scored
    .filter((r) => (tokens.length === 0 ? true : r.score > 0))
    .slice(0, Math.max(0, limit))

  const picks =
    matched.length > 0
      ? matched
      : scored.toSorted((a, b) => b.date - a.date).slice(0, Math.max(0, limit))

  return picks.map(({ snippet }) => ({
    id: `snippet:${snippet.slug}`,
    title: snippet.title,
    href: getLocalizedPath({ slug: `/snippet/${snippet.slug}`, locale }),
    excerpt: snippet.description,
    type: 'snippet'
  }))
}

export const build_snippet_recommendation_answer = (params: {
  query: string
  locale: string
  limit?: number
  excludeIds?: string[]
}): RecommendationResult => {
  const { query, locale, limit = 3, excludeIds } = params
  const citations = recommend_snippets({ query, locale, limit, excludeIds })

  if (citations.length === 0) {
    const message = locale.startsWith('pt')
      ? 'Não encontrei um snippet para recomendar agora. Tente outra palavra-chave (ex.: "linux", "docker", "nextjs").'
      : 'I could not find a snippet to recommend right now. Try different keywords (e.g., "linux", "docker", "nextjs").'

    return { message, citations: [] }
  }

  const intro = locale.startsWith('pt')
    ? 'Aqui vão alguns snippets que você pode curtir:'
    : 'Here are a few snippets you might enjoy:'

  const lines = citations.map((c) => `- ${c.title}: ${c.href}`)

  return {
    message: [intro, '', ...lines].join('\n'),
    citations
  }
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

type RecommendationResult = {
  message: string
  citations: Citation[]
}

type StaticRouteEntry = {
  slug: string
  title: string
  description: string
}

const get_static_routes = (locale: string): StaticRouteEntry[] => {
  const is_pt = locale.startsWith('pt')
  return [
    {
      slug: '/blog',
      title: is_pt ? 'Blog' : 'Blog',
      description: is_pt ? 'Postagens e artigos do blog' : 'Blog posts and articles'
    },
    {
      slug: '/snippet',
      title: is_pt ? 'Snippets' : 'Snippets',
      description: is_pt
        ? 'Notas práticas e trechos de código'
        : 'Practical notes and code recipes'
    },
    {
      slug: '/projects',
      title: is_pt ? 'Projetos' : 'Projects',
      description: is_pt ? 'Projetos e repositórios' : 'Projects and repositories'
    },
    {
      slug: '/guestbook',
      title: is_pt ? 'Guestbook' : 'Guestbook',
      description: is_pt ? 'Deixe uma mensagem pública' : 'Leave a public message'
    },
    {
      slug: '/about',
      title: is_pt ? 'Sobre' : 'About',
      description: is_pt ? 'Sobre o autor e o site' : 'About the author and the site'
    },
    {
      slug: '/now',
      title: is_pt ? 'Agora' : 'Now',
      description: is_pt ? 'O que estou focando agora' : 'What I am focusing on right now'
    },
    {
      slug: '/uses',
      title: is_pt ? 'Uses' : 'Uses',
      description: is_pt ? 'Ferramentas e setup' : 'Tools and setup'
    },
    {
      slug: '/spotify',
      title: is_pt ? 'Música' : 'Music',
      description: is_pt ? 'Página do Spotify e estatísticas.' : 'Spotify page and stats.'
    }
  ]
}

function strip_locale_prefix(path: string): string {
  const locale_pattern = new RegExp(`^/(${i18n.locales.join('|')})(/|$)`, 'i')
  return path.replace(locale_pattern, '/').replace(/\/+/g, '/')
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

function extract_quoted_phrases(value: string): string[] {
  const phrases: string[] = []
  const re = /["“”']([^"“”']+)["“”']/g
  let match: RegExpExecArray | null = null
  while ((match = re.exec(value)) !== null) {
    const phrase = match[1]?.trim()
    if (phrase) phrases.push(phrase)
  }
  return phrases
}

function infer_excluded_post_slugs_from_query(params: {
  query: string
  locale: string
}): string[] {
  const { query, locale } = params
  const slugs: string[] = []

  // /blog/<slug>
  const blog_re = /\/blog\/([a-z0-9-]+)/gi
  let match: RegExpExecArray | null = null
  while ((match = blog_re.exec(query)) !== null) {
    const slug = match[1]?.trim()
    if (slug) slugs.push(slug)
  }

  // "<title>"
  const normalize = (value: string) => value.toLowerCase().trim()
  const quoted = extract_quoted_phrases(query)
  for (const phrase of quoted) {
    const needle = normalize(phrase)
    const post = allPosts.find((p) => p.locale === locale && normalize(p.title) === needle)
    if (post) slugs.push(post.slug)
  }

  return unique(slugs)
}

export const build_site_index = (locale: string): SiteEntry[] => {
  const entries: SiteEntry[] = []

  for (const route of get_static_routes(locale)) {
    entries.push({
      type: 'page',
      title: route.title,
      description: route.description,
      href: getLocalizedPath({ slug: route.slug, locale }),
      slug: route.slug.replace(/^\//, ''),
      locale
    })
  }

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

  for (const snippet of allSnippets) {
    if (snippet.locale !== locale) continue
    entries.push({
      type: 'snippet',
      title: snippet.title,
      description: snippet.description,
      href: getLocalizedPath({ slug: `/snippet/${snippet.slug}`, locale }),
      slug: snippet.slug,
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

  const snippet_match = /^\/snippet\/([^/]+)$/.exec(normalized)
  if (snippet_match?.[1]) {
    const slug = snippet_match[1]
    const snippet = allSnippets.find((s) => s.slug === slug && s.locale === locale)
    if (!snippet) return null
    return {
      type: 'snippet',
      title: snippet.title,
      description: snippet.description,
      href: getLocalizedPath({ slug: `/snippet/${snippet.slug}`, locale }),
      contentExcerpt: snippet.content.slice(0, 1200)
    }
  }

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

function extract_snippet_slugs_from_query(query: string): string[] {
  const slugs: string[] = []
  const snippet_re = /\/snippet\/([a-z0-9-]+)/gi
  let match: RegExpExecArray | null = null
  while ((match = snippet_re.exec(query)) !== null) {
    const slug = match[1]?.trim()
    if (slug) slugs.push(slug)
  }
  return unique(slugs)
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

const recommend_posts = (params: {
  query: string
  locale: string
  limit?: number
  excludeIds?: string[]
  excludeSlugs?: string[]
}): Citation[] => {
  const { query, locale, limit = 3, excludeIds = [], excludeSlugs = [] } = params
  const tokens = tokenize(query)

  const excluded_slugs_by_id = excludeIds
    .filter((id) => id.startsWith('post:'))
    .map((id) => id.slice('post:'.length))

  const inferred_excluded_slugs = infer_excluded_post_slugs_from_query({ query, locale })
  const excluded_slugs = new Set(
    unique([...excludeSlugs, ...excluded_slugs_by_id, ...inferred_excluded_slugs])
  )

  const scored = allPosts
    .filter((p) => p.locale === locale)
    .filter((p) => !excluded_slugs.has(p.slug))
    .map((post) => {
      const haystack_title = post.title.toLowerCase()
      const haystack_summary = post.summary.toLowerCase()
      const haystack_slug = post.slug.toLowerCase()

      let score = 0
      for (const token of tokens) {
        if (haystack_title.includes(token)) score += 3
        if (haystack_summary.includes(token)) score += 2
        if (haystack_slug.includes(token)) score += 1
      }

      const date = new Date((post as unknown as { date?: string }).date ?? 0).getTime()
      return { post, score, date: Number.isFinite(date) ? date : 0 }
    })
    .toSorted((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.date - a.date
    })

  const matched = scored
    .filter((r) => (tokens.length === 0 ? true : r.score > 0))
    .slice(0, Math.max(0, limit))

  const picks =
    matched.length > 0
      ? matched
      : scored.toSorted((a, b) => b.date - a.date).slice(0, Math.max(0, limit))

  return picks.map(({ post }) => ({
    id: `post:${post.slug}`,
    title: post.title,
    href: getLocalizedPath({ slug: `/blog/${post.slug}`, locale }),
    excerpt: post.summary,
    type: 'post'
  }))
}

export const build_post_recommendation_answer = (params: {
  query: string
  locale: string
  limit?: number
  excludeIds?: string[]
}): RecommendationResult => {
  const { query, locale, limit = 3, excludeIds } = params
  const citations = recommend_posts({ query, locale, limit, excludeIds })

  if (citations.length === 0) {
    const message = locale.startsWith('pt')
      ? 'Não encontrei uma postagem para recomendar agora. Você pode tentar outra palavra-chave (ex.: "database", "nextjs", "infra").'
      : 'I could not find a post to recommend right now. Try different keywords (e.g., "database", "nextjs", "infra").'

    return { message, citations: [] }
  }

  const intro = locale.startsWith('pt')
    ? 'Aqui vão algumas postagens que você pode curtir:'
    : 'Here are a few posts you might enjoy:'

  const lines = citations.map((c) => `- ${c.title}: ${c.href}`)

  return {
    message: [intro, '', ...lines].join('\n'),
    citations
  }
}
