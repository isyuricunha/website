import type { MetadataRoute } from 'next'

import { supportedLanguages } from '@tszhong0411/i18n/config'
import { allPages, allPosts, allProjects } from 'content-collections'

import { SITE_URL } from '@/lib/constants'
import { getLocalizedPath } from '@/utils/get-localized-path'

const sitemap = (): MetadataRoute.Sitemap => {
  const entries: MetadataRoute.Sitemap = []

  // Base routes that should exist for all languages
  const baseRoutes = ['', '/blog', '/guestbook']

  // Generate URLs for base routes (all languages)
  for (const locale of supportedLanguages) {
    for (const route of baseRoutes) {
      entries.push({
        url: `${SITE_URL}${getLocalizedPath({ slug: route, locale: locale.code })}`,
        lastModified: new Date()
      })
    }
  }

  // Generate URLs for blog posts (group by locale to only generate existing content)
  const postsByLocale = new Map<string, Set<string>>()
  for (const post of allPosts) {
    if (!postsByLocale.has(post.locale)) {
      postsByLocale.set(post.locale, new Set())
    }
    postsByLocale.get(post.locale)?.add(post.slug)
  }

  for (const [locale, slugs] of postsByLocale) {
    for (const slug of slugs) {
      entries.push({
        url: `${SITE_URL}${getLocalizedPath({ slug: `/blog/${slug}`, locale })}`,
        lastModified: new Date()
      })
    }
  }

  // Generate URLs for projects (group by locale to only generate existing content)
  const projectsByLocale = new Map<string, Set<string>>()
  for (const project of allProjects) {
    if (!projectsByLocale.has(project.locale)) {
      projectsByLocale.set(project.locale, new Set())
    }
    projectsByLocale.get(project.locale)?.add(project.slug)
  }

  for (const [locale, slugs] of projectsByLocale) {
    // Add /projects route for this locale
    entries.push({
      url: `${SITE_URL}${getLocalizedPath({ slug: '/projects', locale })}`,
      lastModified: new Date()
    })

    // Add individual project pages
    for (const slug of slugs) {
      entries.push({
        url: `${SITE_URL}${getLocalizedPath({ slug: `/projects/${slug}`, locale })}`,
        lastModified: new Date()
      })
    }
  }

  // Generate URLs for pages (group by locale to only generate existing content)
  const pagesByLocale = new Map<string, Set<string>>()
  for (const page of allPages) {
    if (!pagesByLocale.has(page.locale)) {
      pagesByLocale.set(page.locale, new Set())
    }
    pagesByLocale.get(page.locale)?.add(page.slug)
  }

  for (const [locale, slugs] of pagesByLocale) {
    for (const slug of slugs) {
      entries.push({
        url: `${SITE_URL}${getLocalizedPath({ slug: `/${slug}`, locale })}`,
        lastModified: new Date()
      })
    }
  }

  return entries
}

export default sitemap
