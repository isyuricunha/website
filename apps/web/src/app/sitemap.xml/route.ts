import { allPosts } from 'content-collections'
import { allProjects } from 'content-collections'
import { SITE_URL } from '@/lib/constants'

export async function GET() {
  const posts = allPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.modifiedTime || post.date,
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  const projects = allProjects.map((project) => ({
    url: `${SITE_URL}/projects#${project.slug}`,
    lastModified: project.modifiedTime || new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.8
    },
    {
      url: `${SITE_URL}/uses`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7
    },
    {
      url: `${SITE_URL}/spotify`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.6
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.8
    },
    {
      url: `${SITE_URL}/sitemap`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.5
    }
  ]

  const allUrls = [...staticPages, ...posts, ...projects]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
