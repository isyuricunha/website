import { i18n } from '@isyuricunha/i18n/config'
import { allPages, allPosts, allProjects, allSnippets } from 'content-collections'

import { createKnowledgeIndex, tokenizeKnowledge } from './knowledge-search'

import { isPublicRepositoryHref, publicContact } from '@/lib/public-contact'
import { getLocalizedPath } from '@/utils/get-localized-path'
import { is_safe_internal_path } from '@/components/mascot/chat-link-policy'

export type SiteEntryType = 'post' | 'project' | 'page' | 'snippet'

type SiteEntry = {
  type: SiteEntryType
  title: string
  description: string
  href: string
  slug: string
  locale: string
  content?: string
  publishedAt?: string
  updatedAt?: string
  tags?: string[]
  category?: string
  readingTime?: number
  project?: {
    repository: string
    homepage?: string
    techstack: string[]
    status: string
    startDate?: string
    endDate?: string
  }
}

const format_citation_link = (citation: Citation): string => {
  const title = citation.title
    .replaceAll('\\', '\\\\')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
  return `- [${title}](<${citation.href}>)`
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

  const ranked = searchKnowledge(query, locale).filter(
    ({ entry }) => entry.type === 'snippet' && !excluded_slugs.has(entry.slug)
  )
  const available = allSnippets
    .filter((entry) => entry.locale === locale && !excluded_slugs.has(entry.slug))
    .toSorted(
      (a, b) =>
        new Date((b as unknown as { date?: string }).date ?? 0).getTime() -
        new Date((a as unknown as { date?: string }).date ?? 0).getTime()
    )
  const picks = (
    tokens.length === 0
      ? available
      : ranked.flatMap(({ entry }) =>
          available.filter((candidate) => candidate.slug === entry.slug)
        )
  )
    .slice(0, Math.max(0, limit))
    .map((snippet) => ({ snippet }))

  return picks.map(({ snippet }) => ({
    id: `snippet:${snippet.slug}`,
    title: snippet.title,
    href: getLocalizedPath({ slug: `/snippet/${snippet.slug}`, locale }),
    excerpt: snippet.description,
    type: 'snippet',
    publishedAt: dateValue(snippet.date),
    tags: snippet.tags,
    readingTime: snippet.readingTime
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

  const lines = citations.map((citation) => format_citation_link(citation))

  return {
    message: [intro, '', ...lines].join('\n'),
    citations
  }
}

export type PageContext = {
  type: SiteEntryType
  title: string
  description: string
  href: string
  contentExcerpt: string
  publishedAt?: string
  updatedAt?: string
}

export type Citation = {
  id: string
  title: string
  href: string
  excerpt?: string
  type: SiteEntryType
  publishedAt?: string
  updatedAt?: string
  tags?: string[]
  category?: string
  readingTime?: number
  project?: SiteEntry['project']
  repositoryHref?: string
  evidence?: string
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

const staticRouteSlugs = [
  '/',
  '/contact',
  '/blog',
  '/snippet',
  '/projects',
  '/guestbook',
  '/about',
  '/now',
  '/uses',
  '/music',
  '/privacy'
] as const
const staticRouteLabels: Record<string, Array<[string, string]>> = {
  en: [
    ['Home', 'Yuri Cunha’s portfolio'],
    ['Contact', 'How to contact Yuri'],
    ['Blog', 'Published articles and essays'],
    ['Snippets', 'Practical notes and code recipes'],
    ['Projects', 'Projects and repositories'],
    ['Guestbook', 'Leave a public message'],
    ['About', 'About the author and the site'],
    ['Now', 'Current interests and work'],
    ['Uses', 'Tools and setup'],
    ['Music', 'Music page and statistics'],
    ['Privacy', 'Public privacy notice and data handling']
  ],
  pt: [
    ['Início', 'Portfólio de Yuri Cunha'],
    ['Contato', 'Como entrar em contato com Yuri'],
    ['Blog', 'Postagens e artigos do blog'],
    ['Snippets', 'Notas práticas e trechos de código'],
    ['Projetos', 'Projetos e repositórios'],
    ['Guestbook', 'Deixe uma mensagem pública'],
    ['Sobre', 'Sobre o autor e o site'],
    ['Agora', 'Interesses e trabalho atuais'],
    ['Uses', 'Ferramentas e setup'],
    ['Música', 'Página de música e estatísticas'],
    ['Privacidade', 'Aviso de privacidade e tratamento de dados']
  ],
  es: [
    ['Inicio', 'Portafolio de Yuri Cunha'],
    ['Contacto', 'Cómo contactar con Yuri'],
    ['Blog', 'Artículos y ensayos publicados'],
    ['Snippets', 'Notas prácticas y fragmentos de código'],
    ['Proyectos', 'Proyectos y repositorios'],
    ['Libro de visitas', 'Deja un mensaje público'],
    ['Acerca de', 'Sobre el autor y el sitio'],
    ['Ahora', 'Intereses y trabajo actuales'],
    ['Herramientas', 'Herramientas y configuración'],
    ['Música', 'Música y estadísticas'],
    ['Privacidad', 'Aviso de privacidad y tratamiento de datos']
  ],
  fr: [
    ['Accueil', 'Portfolio de Yuri Cunha'],
    ['Contact', 'Comment contacter Yuri'],
    ['Blog', 'Articles et essais publiés'],
    ['Snippets', 'Notes pratiques et extraits de code'],
    ['Projets', 'Projets et dépôts'],
    ['Livre d’or', 'Laisser un message public'],
    ['À propos', 'À propos de l’auteur et du site'],
    ['En ce moment', 'Intérêts et travaux actuels'],
    ['Outils', 'Outils et configuration'],
    ['Musique', 'Musique et statistiques'],
    ['Confidentialité', 'Politique de confidentialité']
  ],
  de: [
    ['Startseite', 'Portfolio von Yuri Cunha'],
    ['Kontakt', 'Kontakt zu Yuri'],
    ['Blog', 'Veröffentlichte Artikel und Essays'],
    ['Snippets', 'Praktische Notizen und Codebeispiele'],
    ['Projekte', 'Projekte und Repositories'],
    ['Gästebuch', 'Eine öffentliche Nachricht hinterlassen'],
    ['Über', 'Über den Autor und die Website'],
    ['Aktuell', 'Aktuelle Interessen und Arbeit'],
    ['Werkzeuge', 'Werkzeuge und Einrichtung'],
    ['Musik', 'Musik und Statistiken'],
    ['Datenschutz', 'Öffentliche Datenschutzerklärung']
  ],
  ja: [
    ['ホーム', 'Yuri Cunha のポートフォリオ'],
    ['お問い合わせ', 'Yuri への連絡方法'],
    ['ブログ', '公開記事とエッセイ'],
    ['スニペット', '実用的なメモとコード例'],
    ['プロジェクト', 'プロジェクトとリポジトリ'],
    ['ゲストブック', '公開メッセージを残す'],
    ['プロフィール', '著者とサイトについて'],
    ['近況', '現在の関心と活動'],
    ['使用ツール', 'ツールと環境'],
    ['音楽', '音楽と統計'],
    ['プライバシー', 'プライバシーとデータの取り扱い']
  ],
  'zh-CN': [
    ['首页', 'Yuri Cunha 的个人网站'],
    ['联系', '联系 Yuri 的方式'],
    ['博客', '已发布的文章与随笔'],
    ['代码片段', '实用笔记与代码示例'],
    ['项目', '项目与代码仓库'],
    ['留言簿', '留下公开留言'],
    ['关于', '关于作者与网站'],
    ['近况', '当前兴趣与工作'],
    ['工具', '工具与环境配置'],
    ['音乐', '音乐与统计'],
    ['隐私', '隐私声明与数据处理']
  ]
}

const get_static_routes = (locale: string): StaticRouteEntry[] =>
  staticRouteSlugs.map((slug, index) => {
    const [title, description] = (staticRouteLabels[locale] ?? staticRouteLabels.en)?.[index] ?? [
      slug,
      slug
    ]
    return { slug, title, description }
  })

function strip_locale_prefix(path: string): string {
  const locale_pattern = new RegExp(`^/(${i18n.locales.join('|')})(/|$)`, 'i')
  return path.replace(locale_pattern, '/').replace(/\/+/g, '/')
}

const tokenize = tokenizeKnowledge

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

function extract_quoted_phrases(value: string): string[] {
  const phrases: string[] = []
  const re = /["“”']([^"“”']+)["“”']/g
  for (let match = re.exec(value); match !== null; match = re.exec(value)) {
    const phrase = match[1]?.trim()
    if (phrase) phrases.push(phrase)
  }
  return phrases
}

function infer_excluded_post_slugs_from_query(params: { query: string; locale: string }): string[] {
  const { query, locale } = params
  const slugs: string[] = []

  // /blog/<slug>
  const blog_re = /\/blog\/([a-z0-9-]+)/gi
  for (let match = blog_re.exec(query); match !== null; match = blog_re.exec(query)) {
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

const dateValue = (value?: string) => {
  if (!value || !Number.isFinite(Date.parse(value))) return
  return value
}

const contactContent = () =>
  [
    'Public contact channels published on the contact page:',
    `Email: ${publicContact.email}`,
    `GitHub: ${publicContact.github}`,
    `X (Twitter): ${publicContact.twitter}`,
    `LinkedIn: ${publicContact.linkedin}`,
    'A contact form is available on this page.'
  ].join('\n')

const toCitation = (entry: SiteEntry, includeEvidence = false): Citation => ({
  id: `${entry.type}:${entry.slug}`,
  title: entry.title,
  href: entry.href,
  excerpt: entry.slug === 'contact' && entry.type === 'page' ? entry.content : entry.description,
  type: entry.type,
  ...(includeEvidence &&
    entry.type === 'page' &&
    entry.content && {
      evidence: entry.content.slice(0, entry.slug === 'privacy' ? 6000 : 1800)
    }),
  publishedAt: entry.publishedAt,
  updatedAt: entry.updatedAt,
  tags: entry.tags,
  category: entry.category,
  readingTime: entry.readingTime,
  project: entry.project,
  repositoryHref:
    entry.project?.repository && isPublicRepositoryHref(entry.project.repository)
      ? entry.project.repository
      : undefined
})

const siteEntries = new Map<string, SiteEntry[]>()

export const build_site_index = (locale: string): SiteEntry[] => {
  if (i18n.locales.every((supported) => supported !== locale)) return []
  const cached = siteEntries.get(locale)
  if (cached) return cached
  const entries: SiteEntry[] = Array.from(get_static_routes(locale), (route) => ({
    type: 'page',
    title: route.title,
    description: route.description,
    href: getLocalizedPath({ slug: route.slug, locale }),
    slug: route.slug.replace(/^\//, ''),
    locale,
    ...(route.slug === '/contact' && { content: contactContent() })
  }))

  for (const post of allPosts) {
    if (post.locale !== locale) continue
    entries.push({
      type: 'post',
      title: post.title,
      description: post.summary,
      href: getLocalizedPath({ slug: `/blog/${post.slug}`, locale }),
      slug: post.slug,
      locale,
      content: post.content,
      publishedAt: dateValue(post.date),
      updatedAt: dateValue(post.modifiedTime),
      tags: post.tags,
      category: post.category,
      readingTime: post.readingTime
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
      locale,
      content: snippet.content,
      publishedAt: dateValue(snippet.date),
      tags: snippet.tags,
      readingTime: snippet.readingTime
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
      locale,
      content: project.content,
      category: project.category,
      project: {
        repository: project.github,
        homepage: project.homepage,
        techstack: project.techstack,
        status: project.status,
        startDate: dateValue(project.startDate),
        endDate: dateValue(project.endDate)
      }
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
      locale,
      content: page.content
    })
  }

  const byHref = new Map<string, SiteEntry>()
  for (const entry of entries) {
    const previous = byHref.get(entry.href)
    byHref.set(
      entry.href,
      previous ? { ...previous, content: entry.content ?? previous.content } : entry
    )
  }
  const unique_by_href = Array.from(byHref.values()).filter((entry) =>
    is_safe_internal_path(entry.href)
  )
  siteEntries.set(locale, unique_by_href)
  return unique_by_href
}

const resolve_site_entry = (href: string, locale: string): SiteEntry | undefined => {
  if (!is_safe_internal_path(href)) return undefined
  const url = new URL(href, 'https://local.invalid')
  const slug = strip_locale_prefix(url.pathname).replace(/^\/snippets(?=\/|$)/, '/snippet')
  const canonical = getLocalizedPath({ slug, locale })
  return build_site_index(locale).find((entry) => entry.href === canonical)
}

export const get_page_context = (page_path: string, locale: string): PageContext | null => {
  const entry = resolve_site_entry(page_path, locale)
  // A directory/overview is not a document to summarize.
  if (!entry?.content) return null
  return {
    type: entry.type,
    title: entry.title,
    description: entry.description,
    href: entry.href,
    contentExcerpt: entry.content.slice(0, 1200),
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt
  }
}

function extract_snippet_slugs_from_query(query: string): string[] {
  const slugs: string[] = []
  const snippet_re = /\/snippet\/([a-z0-9-]+)/gi
  for (let match = snippet_re.exec(query); match !== null; match = snippet_re.exec(query)) {
    const slug = match[1]?.trim()
    if (slug) slugs.push(slug)
  }
  return unique(slugs)
}

const knowledgeIndexes = new Map<
  string,
  { entries: SiteEntry[]; rank: ReturnType<typeof createKnowledgeIndex<SiteEntry>> }
>()

const searchKnowledge = (query: string, locale: string) => {
  if (i18n.locales.every((supported) => supported !== locale)) return []
  let index = knowledgeIndexes.get(locale)
  if (!index) {
    const entries = build_site_index(locale)
    index = { entries, rank: createKnowledgeIndex(entries) }
    knowledgeIndexes.set(locale, index)
  }
  const exact = index.entries.filter((entry) =>
    [entry.title, entry.slug, entry.href].some(
      (value) => value.toLowerCase() === query.trim().toLowerCase()
    )
  )
  const matches = index.rank(query)
  const best = matches[0]?.score ?? 0
  const ranked = matches.filter((item) => item.score >= best * 0.25)
  const exactHrefs = new Set(exact.map((entry) => entry.href))
  return [
    ...exact.map((entry) => ({ entry, score: Number.MAX_SAFE_INTEGER })),
    ...ranked.filter(({ entry }) => !exactHrefs.has(entry.href))
  ]
}

export type ContentOrder = 'newest' | 'oldest' | 'updated'

export const list_site_content = (params: {
  locale: string
  type: 'post' | 'snippet'
  order: ContentOrder
  query?: string
  limit?: number
}): Citation[] => {
  const { locale, type, order, query, limit = 5 } = params
  const entries = query?.trim()
    ? searchKnowledge(query, locale).map(({ entry }) => entry)
    : build_site_index(locale)
  const date = (entry: SiteEntry) =>
    Date.parse((order === 'updated' ? entry.updatedAt : entry.publishedAt) ?? '')
  return entries
    .filter((entry) => entry.type === type && Number.isFinite(date(entry)))
    .toSorted(
      (a, b) =>
        (order === 'oldest' ? date(a) - date(b) : date(b) - date(a)) || a.href.localeCompare(b.href)
    )
    .slice(0, limit)
    .map((entry) => toCitation(entry))
}

export const find_citations = (params: {
  message: string
  locale: string
  page_path?: string
  limit?: number
}): Citation[] => {
  const { message, locale, page_path, limit = 5 } = params
  const scored = searchKnowledge(message, locale)
  const channelQuery = message.toLowerCase()
  const publicChannel =
    /\b(?:e-?mail|github|linkedin|twitter|contact|contato|contacto|kontakt|correo|courriel)\b/u.test(
      channelQuery
    ) ||
    /redes sociais|social media|social links|連絡|メール|联系方式|邮箱|社交/u.test(channelQuery)
  const contact = publicChannel
    ? build_site_index(locale).find((entry) => entry.type === 'page' && entry.slug === 'contact')
    : undefined

  const privacyQuestion =
    /privacy (?:notice|policy)|aviso de privacidade|pol[ií]tica de privacidade|pol[ií]tica de privacidad|politique de confidentialit[eé]|datenschutzerkl[aä]rung|プライバシーポリシー|隐私政策/u.test(
      channelQuery
    )
  const privacy = privacyQuestion
    ? build_site_index(locale).find((entry) => entry.type === 'page' && entry.slug === 'privacy')
    : undefined
  const citations: Citation[] = []

  const page_ctx = page_path ? get_page_context(page_path, locale) : null
  if (page_ctx) {
    const entry = resolve_site_entry(page_ctx.href, locale)
    if (entry) citations.push({ ...toCitation(entry, true), id: 'page' })
  }

  if (contact && citations.every((citation) => citation.href !== contact.href)) {
    citations.push({ ...toCitation(contact), excerpt: contactContent() })
  }

  if (privacy && citations.every((citation) => citation.href !== privacy.href)) {
    citations.push(toCitation(privacy, true))
  }

  const remainingItems = scored
    .filter(({ entry }) => citations.every((citation) => citation.href !== entry.href))
    .slice(0, Math.max(0, limit - citations.length))
  for (const item of remainingItems) {
    citations.push(toCitation(item.entry, true))
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

  const lines = citations.map((citation) => format_citation_link(citation))

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

  const ranked = searchKnowledge(query, locale).filter(
    ({ entry }) => entry.type === 'post' && !excluded_slugs.has(entry.slug)
  )
  const available = allPosts
    .filter((entry) => entry.locale === locale && !excluded_slugs.has(entry.slug))
    .toSorted(
      (a, b) =>
        new Date((b as unknown as { date?: string }).date ?? 0).getTime() -
        new Date((a as unknown as { date?: string }).date ?? 0).getTime()
    )
  const picks = (
    tokens.length === 0
      ? available
      : ranked.flatMap(({ entry }) =>
          available.filter((candidate) => candidate.slug === entry.slug)
        )
  )
    .slice(0, Math.max(0, limit))
    .map((post) => ({ post }))

  return picks.map(({ post }) => ({
    id: `post:${post.slug}`,
    title: post.title,
    href: getLocalizedPath({ slug: `/blog/${post.slug}`, locale }),
    excerpt: post.summary,
    type: 'post',
    publishedAt: dateValue(post.date),
    updatedAt: dateValue(post.modifiedTime),
    tags: post.tags,
    category: post.category,
    readingTime: post.readingTime
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

  const lines = citations.map((citation) => format_citation_link(citation))

  return {
    message: [intro, '', ...lines].join('\n'),
    citations
  }
}

export const get_site_overview = (locale: string): Citation[] =>
  get_static_routes(locale).map((route) => ({
    id: `page:${route.slug}`,
    title: route.title,
    href: getLocalizedPath({ slug: route.slug, locale }),
    excerpt: route.slug === '/contact' ? contactContent() : route.description,
    type: 'page'
  }))

export const read_site_content = (href: string, locale: string, offset = 0) => {
  const entry = resolve_site_entry(href, locale)
  if (!entry) return null
  const content = entry.content ?? entry.description
  const end = Math.min(content.length, offset + 6000)
  return {
    citation: toCitation(entry),
    content: content.slice(offset, end),
    nextOffset: end < content.length ? end : null
  }
}
