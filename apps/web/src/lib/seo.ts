import type { Metadata } from 'next'

import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from './constants'

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
  image = '/images/og-default.png',
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
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

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
      canonical: fullUrl,
      ...(alternateLocales.length > 0 && {
        languages: alternateLocales.reduce<Record<string, string>>((acc, loc) => {
          acc[loc] = `${SITE_URL}/${loc}${url.replace(SITE_URL, '')}`
          return acc
        }, {})
      })
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
  publishedTime,
  modifiedTime,
  image
}: {
  title: string
  description: string
  slug: string
  publishedTime: string
  modifiedTime?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: `${SITE_URL}/blog/${slug}`,
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
      '@id': `${SITE_URL}/blog/${slug}`
    }
  }
}

export function generateProjectJsonLd({
  name,
  description,
  slug,
  homepage,
  repository,
  techStack
}: {
  name: string
  description: string
  slug: string
  homepage?: string
  repository?: string
  techStack?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: `${SITE_URL}/projects/${slug}`,
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
