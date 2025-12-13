import { supportedLanguages } from '@isyuricunha/i18n/config'
import { getTranslations } from '@isyuricunha/i18n/server'
import { allPosts } from 'content-collections'
import { type NextRequest, NextResponse } from 'next/server'
import RSS from 'rss'

import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { getLocalizedPath } from '@/utils/get-localized-path'

type RouteContext = {
  params: Promise<{
    locale: string
  }>
}

export const GET = async (_request: NextRequest, context: RouteContext) => {
  const { locale } = await context.params

  // Validate locale
  if (!supportedLanguages.some((lang) => lang.code === locale)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const t = await getTranslations({ locale })

  const feed = new RSS({
    title: t('metadata.site-title'),
    description: t('metadata.site-description'),
    site_url: `${SITE_URL}${getLocalizedPath({ slug: '', locale })}`,
    feed_url: `${SITE_URL}${getLocalizedPath({ slug: '/rss.xml', locale })}`,
    language: locale,
    image_url: `${SITE_URL}/images/og.png`
  })

  const posts = allPosts
    .filter((p) => p.locale === locale)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  for (const post of posts) {
    const { title, summary, date, slug } = post

    feed.item({
      title,
      url: `${SITE_URL}${getLocalizedPath({ slug: `/blog/${slug}`, locale })}`,
      date,
      description: summary,
      author: SITE_NAME
    })
  }

  return new NextResponse(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })
}

export const generateStaticParams = () => {
  return supportedLanguages.map((lang) => ({
    locale: lang.code
  }))
}
