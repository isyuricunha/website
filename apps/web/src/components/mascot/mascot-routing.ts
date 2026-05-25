import { i18n } from '@isyuricunha/i18n/config'

const DETAIL_SEGMENTS = new Set(['projects'])

export const getMascotPageKey = (path: string): string => {
  const localePattern = new RegExp(`^/(${i18n.locales.join('|')})/`, '')
  const pathWithoutLocale = path.replace(localePattern, '/')

  if (pathWithoutLocale === '/' || pathWithoutLocale === '') return 'home'

  const blogPostMatch = /^\/blog\/([^/]+)$/.exec(pathWithoutLocale)
  if (blogPostMatch) return 'blogPost'

  const detailMatch = /^\/(\w+)\/([^/]+)$/.exec(pathWithoutLocale)
  if (detailMatch) {
    const seg = detailMatch[1]
    if (seg && DETAIL_SEGMENTS.has(seg)) {
      return `${seg}Detail`
    }
  }

  if (pathWithoutLocale.startsWith('/blog')) return 'blog'
  if (pathWithoutLocale.startsWith('/snippet') || pathWithoutLocale.startsWith('/snippets')) {
    return 'snippet'
  }
  if (pathWithoutLocale.startsWith('/projects')) return 'projects'
  if (pathWithoutLocale.startsWith('/about')) return 'about'
  if (pathWithoutLocale.startsWith('/uses')) return 'uses'
  if (pathWithoutLocale.startsWith('/music')) return 'music'
  if (pathWithoutLocale.startsWith('/contact')) return 'contact'
  if (pathWithoutLocale.startsWith('/guestbook')) return 'guestbook'
  if (pathWithoutLocale.startsWith('/now')) return 'now'
  if (pathWithoutLocale.startsWith('/settings')) return 'settings'
  if (pathWithoutLocale.startsWith('/notifications')) return 'notifications'
  if (pathWithoutLocale.startsWith('/sitemap')) return 'sitemap'
  if (pathWithoutLocale.startsWith('/offline')) return 'offline'
  if (pathWithoutLocale.startsWith('/admin')) return 'admin'
  if (pathWithoutLocale.includes('search') || pathWithoutLocale.includes('?q=')) return 'search'
  if (pathWithoutLocale === '/404' || pathWithoutLocale.includes('not-found')) return '404'

  return 'home'
}

export const canExplainSelectionOnPage = (pageKey: string): boolean =>
  pageKey === 'blogPost' || pageKey === 'snippet'
