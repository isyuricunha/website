import { supportedLanguages } from '@isyuricunha/i18n/config'
import { allPages, allPosts, allProjects, allSnippets } from 'content-collections'
import type { RequestHandler } from './$types'
import { SITE_URL } from '#lib/constants.ts'
import { build_absolute_language_alternates, getLocalizedPath } from '#lib/seo.ts'

export const prerender = true

type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency?: string
  priority?: number
  alternates?: { languages: Record<string, string> }
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const toW3CDate = (date: Date) => date.toISOString()

export const sitemapXml = (): string => {
  const entries: SitemapEntry[] = []
  const buildTime = new Date()
  const seen = new Set<string>()

  const addEntry = (entry: SitemapEntry) => {
    if (seen.has(entry.url)) return
    seen.add(entry.url)
    entries.push(entry)
  }

  const addLocalizedEntry = ({
    slug,
    locale,
    lastModified = buildTime,
    changeFrequency,
    priority,
    locales = []
  }: {
    slug: string
    locale: string
    lastModified?: Date
    changeFrequency?: string
    priority?: number
    locales?: string[]
  }) => {
    addEntry({
      url: `${SITE_URL}${getLocalizedPath({ slug, locale })}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: build_absolute_language_alternates({ slug, locales: [locale, ...locales] })
      }
    })
  }

  // Snippets (group by locale to only generate existing content)
  const snippetsByLocale = new Map<string, Set<string>>()
  for (const snippet of allSnippets) {
    if (!snippetsByLocale.has(snippet.locale)) {
      snippetsByLocale.set(snippet.locale, new Set())
    }
    snippetsByLocale.get(snippet.locale)?.add(snippet.slug)
  }

  for (const locale of snippetsByLocale.keys()) {
    const slugs = snippetsByLocale.get(locale) ?? []
    for (const slug of slugs) {
      const snippet = allSnippets.find((s) => s.slug === slug && s.locale === locale)

      const snippetLocales: string[] = []
      for (const [loc, set] of snippetsByLocale) {
        if (set.has(slug)) snippetLocales.push(loc)
      }

      addLocalizedEntry({
        slug: `/snippet/${slug}`,
        locale,
        locales: snippetLocales,
        lastModified: snippet ? new Date(snippet.date) : buildTime,
        changeFrequency: 'monthly',
        priority: 0.6
      })
    }
  }

  const baseRoutes = [
    '',
    '/blog',
    '/snippet',
    '/projects',
    '/guestbook',
    '/uses',
    '/now',
    '/music',
    '/recap',
    '/about',
    '/contact',
    '/sitemap'
  ]

  const allLocaleCodes = supportedLanguages.map((language) => language.code)
  for (const locale of allLocaleCodes) {
    for (const route of baseRoutes) {
      addLocalizedEntry({
        slug: route,
        locale,
        locales: allLocaleCodes,
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.7
      })
    }
  }

  const postsByLocale = new Map<string, Set<string>>()
  for (const post of allPosts) {
    if (!postsByLocale.has(post.locale)) {
      postsByLocale.set(post.locale, new Set())
    }
    postsByLocale.get(post.locale)?.add(post.slug)
  }

  const postLocalesBySlug = new Map<string, string[]>()
  for (const [locale, slugs] of postsByLocale) {
    for (const slug of slugs) {
      postLocalesBySlug.set(slug, [...(postLocalesBySlug.get(slug) ?? []), locale])
    }
  }

  for (const [locale, slugs] of postsByLocale) {
    for (const slug of slugs) {
      const post = allPosts.find((p) => p.slug === slug && p.locale === locale)

      addLocalizedEntry({
        slug: `/blog/${slug}`,
        locale,
        locales: postLocalesBySlug.get(slug) ?? [locale],
        lastModified: post ? new Date(post.modifiedTime || post.date) : buildTime,
        changeFrequency: 'monthly',
        priority: 0.8
      })
    }
  }

  const projectsByLocale = new Map<string, Set<string>>()
  for (const project of allProjects) {
    if (!projectsByLocale.has(project.locale)) {
      projectsByLocale.set(project.locale, new Set())
    }
    projectsByLocale.get(project.locale)?.add(project.slug)
  }

  const projectLocalesBySlug = new Map<string, string[]>()
  for (const [locale, slugs] of projectsByLocale) {
    for (const slug of slugs) {
      projectLocalesBySlug.set(slug, [...(projectLocalesBySlug.get(slug) ?? []), locale])
    }
  }

  for (const [locale, slugs] of projectsByLocale) {
    for (const slug of slugs) {
      addLocalizedEntry({
        slug: `/projects/${slug}`,
        locale,
        locales: projectLocalesBySlug.get(slug) ?? [locale],
        changeFrequency: 'monthly',
        priority: 0.7
      })
    }
  }

  const pagesByLocale = new Map<string, Set<string>>()
  for (const page of allPages) {
    if (!pagesByLocale.has(page.locale)) {
      pagesByLocale.set(page.locale, new Set())
    }
    pagesByLocale.get(page.locale)?.add(page.slug)
  }

  const pageLocalesBySlug = new Map<string, string[]>()
  for (const [locale, slugs] of pagesByLocale) {
    for (const slug of slugs) {
      pageLocalesBySlug.set(slug, [...(pageLocalesBySlug.get(slug) ?? []), locale])
    }
  }

  for (const [locale, slugs] of pagesByLocale) {
    for (const slug of slugs) {
      addLocalizedEntry({
        slug: `/${slug}`,
        locale,
        locales: pageLocalesBySlug.get(slug) ?? [locale],
        changeFrequency: 'monthly',
        priority: 0.6
      })
    }
  }

  const urls = entries
    .map((entry) => {
      const parts = [`<url><loc>${escapeXml(entry.url)}</loc>`]
      if (entry.lastModified) parts.push(`<lastmod>${toW3CDate(entry.lastModified)}</lastmod>`)
      if (entry.changeFrequency) parts.push(`<changefreq>${entry.changeFrequency}</changefreq>`)
      if (entry.priority !== undefined) parts.push(`<priority>${entry.priority}</priority>`)
      if (entry.alternates) {
        for (const [lang, href] of Object.entries(entry.alternates.languages)) {
          parts.push(
            `<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}"/>`
          )
        }
      }
      parts.push('</url>')
      return parts.join('')
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`
}

export const GET: RequestHandler = async () => {
  return new Response(sitemapXml(), {
    headers: {
      'content-type': 'application/xml',
      'cache-control': 'public, max-age=0, must-revalidate'
    }
  })
}
