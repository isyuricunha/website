import type { Metadata } from 'next'

import { i18n } from '@isyuricunha/i18n/config'

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants'
import { getLocalizedPath } from '@/utils/get-localized-path'

const strip_locale_prefix = (pathname: string) => {
  for (const locale of i18n.locales) {
    if (locale === i18n.defaultLocale) continue

    if (pathname === `/${locale}`) return ''
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1)
    }
  }

  return pathname
}

const normalize_pathname = (url: string) => {
  if (!url) return ''

  const pathname = url.startsWith('http') ? new URL(url).pathname : url
  if (pathname === '/') return ''
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

export type SeoAlternates = {
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
  const availableLocales = locales && locales.length > 0 ? locales : i18n.locales

  const languages = availableLocales.reduce<Record<string, string>>((acc, loc) => {
    acc[loc] = getLocalizedPath({ slug, locale: loc })
    return acc
  }, {})

  languages['x-default'] = getLocalizedPath({ slug, locale: i18n.defaultLocale })

  return {
    canonical: getLocalizedPath({ slug, locale }),
    languages
  }
}

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  locale?: string
  alternateLocales?: string[]
}

export function generateSEO({
  title,
  description = SITE_DESCRIPTION,
  image = '/images/og.png',
  url = SITE_URL,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  tags,
  locale = 'en',
  alternateLocales = []
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const localizedPath = normalize_pathname(url)
  const baseSlug = strip_locale_prefix(localizedPath)
  const canonicalPath = getLocalizedPath({ slug: baseSlug, locale })
  const fullUrl = `${SITE_URL}${canonicalPath}`
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  const alternates = build_alternates({
    slug: baseSlug,
    locale,
    locales: [locale, ...alternateLocales]
  })

  const openGraph: NonNullable<Metadata['openGraph']> = {
    title: fullTitle,
    description,
    url: fullUrl,
    siteName: SITE_NAME,
    images: [
      {
        url: fullImage,
        width: 1200,
        height: 630,
        alt: title || SITE_NAME
      }
    ],
    locale,
    type,
    ...(type === 'article' && {
      publishedTime,
      modifiedTime,
      authors,
      tags
    })
  }

  const twitter: NonNullable<Metadata['twitter']> = {
    card: 'summary_large_image',
    title: fullTitle,
    description,
    images: [fullImage],
    creator: '@isyuricunha'
  }

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: tags?.join(', '),
    authors: authors?.map((author) => ({ name: author })),
    openGraph,
    twitter,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }

  return metadata
}

// JSON-LD structured data generators
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

export function generateBlogPostJsonLd({
  title,
  description,
  slug,
  locale,
  publishedTime,
  modifiedTime,
  image
}: {
  title: string
  description: string
  slug: string
  locale: string
  publishedTime: string
  modifiedTime?: string
  image?: string
}) {
  const url = `${SITE_URL}${getLocalizedPath({ slug: `/blog/${slug}`, locale })}`

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL
    },
    publisher: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL
    },
    image: image ? `${SITE_URL}${image}` : `${SITE_URL}/images/blog/${slug}/cover.png`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  }
}

export function generateProjectJsonLd({
  name,
  description,
  slug,
  locale,
  homepage,
  repository,
  techStack
}: {
  name: string
  description: string
  slug: string
  locale: string
  homepage?: string
  repository?: string
  techStack?: string[]
}) {
  const url = `${SITE_URL}${getLocalizedPath({ slug: `/projects/${slug}`, locale })}`

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web',
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL
    },
    ...(homepage && { downloadUrl: homepage }),
    ...(repository && { codeRepository: repository }),
    ...(techStack && { programmingLanguage: techStack })
  }
}
