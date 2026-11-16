import { i18n } from '@isyuricunha/i18n/config'

import { SITE_URL } from './constants'

type LocalizedDocument = {
  slug: string
  locale: string
}

/** Same rules as the Next.js implementation: default locale unprefixed, no
 * trailing slashes on canonical URLs. */
export const getLocalizedPath = (doc: LocalizedDocument) => {
  const locale = doc.locale

  const rawSlug = doc.slug === '' ? '/' : doc.slug
  const slug = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`

  const localePath = locale === i18n.defaultLocale ? '' : `/${locale}`

  if (localePath && (slug === localePath || slug.startsWith(`${localePath}/`))) {
    return slug
  }

  const path = `${localePath}${slug}`

  if (path !== '/' && path.endsWith('/')) return path.slice(0, -1)

  return path
}

export const build_absolute_language_alternates = ({
  slug,
  locales
}: {
  slug: string
  locales?: string[]
}) => {
  const availableLocales = locales && locales.length > 0 ? locales : [...i18n.locales]

  const languages = availableLocales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = `${SITE_URL}${getLocalizedPath({ slug, locale })}`
    return acc
  }, {})

  // x-default should point at the default locale when a variant exists there
  // (matching build_alternates), otherwise the first available one.
  const fallback_locale = availableLocales.includes(i18n.defaultLocale)
    ? i18n.defaultLocale
    : availableLocales[0]

  languages['x-default'] = `${SITE_URL}${getLocalizedPath({ slug, locale: fallback_locale ?? '' })}`

  return languages
}

type SeoAlternates = {
  canonical: string
  languages: Record<string, string>
}

export const build_alternates = ({
  slug,
  locale,
  locales
}: {
  slug: string
  locale: string
  locales?: string[]
}): SeoAlternates => {
  const availableLocales = locales && locales.length > 0 ? locales : [...i18n.locales]

  const languages = availableLocales.reduce<Record<string, string>>((acc, loc) => {
    acc[loc] = getLocalizedPath({ slug, locale: loc })
    return acc
  }, {})

  const first_available = availableLocales[0] ?? i18n.defaultLocale
  const defaultTarget = languages[i18n.defaultLocale] ?? languages[first_available] ?? ''
  languages['x-default'] = defaultTarget

  return {
    canonical: getLocalizedPath({ slug, locale }),
    languages
  }
}

export type SeoHead = {
  title: string
  description: string
  canonicalPath: string
  alternates: SeoAlternates
}

export function buildSeoHead({
  slug,
  locale,
  title,
  description
}: {
  slug: string
  locale: string
  title: string
  description: string
}): SeoHead {
  return {
    title,
    description,
    canonicalPath: getLocalizedPath({ slug, locale }),
    alternates: build_alternates({ slug, locale })
  }
}
