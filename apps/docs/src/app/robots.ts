import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/constants'

const robots = (): MetadataRoute.Robots => ({
  host: SITE_URL,
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/embed', '/embed/']
    }
  ],
  sitemap: `${SITE_URL}/sitemap.xml`
})

export default robots
