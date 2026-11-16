import { i18n } from '@isyuricunha/i18n/config'

type LocalizedDocument = {
  slug: string
  locale: string
}

export const getLocalizedPath = (doc: LocalizedDocument) => {
  const locale = doc.locale

  const rawSlug = doc.slug === '' ? '/' : doc.slug
  const slug = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`

  const localePath = locale === i18n.defaultLocale ? '' : `/${locale}`

  if (localePath && (slug === localePath || slug.startsWith(`${localePath}/`))) {
    return slug
  }

  const path = `${localePath}${slug}`

  // Localized homepages (`/pt`, not `/pt/`) — the platform 308-redirects the
  // trailing-slash form, so canonical/hreflang/sitemap URLs must match the
  // redirect target or every localized homepage ships a redirecting canonical.
  if (path !== '/' && path.endsWith('/')) return path.slice(0, -1)

  return path
}
