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

  return `${localePath}${slug}`
}
