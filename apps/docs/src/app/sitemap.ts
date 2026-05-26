import type { MetadataRoute } from 'next'

import { allDocs } from 'content-collections'

import { SITE_URL } from '@/lib/constants'

const sitemap = (): MetadataRoute.Sitemap => {
  const buildTime = new Date()

  return allDocs.map((doc) => ({
    url: `${SITE_URL}${doc.slug ? `/${doc.slug}` : ''}`,
    lastModified: buildTime,
    changeFrequency: 'monthly',
    priority: doc.slug ? 0.7 : 1
  }))
}

export default sitemap
