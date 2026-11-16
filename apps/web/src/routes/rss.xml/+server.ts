import { i18n } from '@isyuricunha/i18n/config'
import RSS from 'rss'
import type { RequestHandler } from './$types'
import { allPosts } from 'content-collections'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { SITE_NAME, SITE_URL } from '#lib/constants.ts'

export const prerender = true

export const GET: RequestHandler = async () => {
  const t = await getServerTranslator(i18n.defaultLocale)

  const feed = new RSS({
    title: t('metadata.site-title'),
    description: t('metadata.site-description'),
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/rss.xml`,
    language: 'en-US',
    image_url: `${SITE_URL}/images/og.png`
  })

  const posts = allPosts
    .filter((p) => p.locale === i18n.defaultLocale)
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  for (const post of posts) {
    const { title, summary, date, slug } = post

    feed.item({
      title,
      url: `${SITE_URL}/blog/${slug}`,
      date,
      description: summary,
      author: SITE_NAME
    })
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })
}
