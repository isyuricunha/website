import { i18n } from '@isyuricunha/i18n/config'
import { NextResponse } from 'next/server'
import { allPosts } from 'content-collections'

export const dynamic = 'force-dynamic'
const cacheHeaders = { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requested = searchParams.get('locale') || i18n.defaultLocale
  // An unknown locale would silently disable the mascot's new-post notification
  // (getPostsByLocale returns an empty list); fall back to the default locale
  // instead of answering "no post" for a typo'd locale.
  const locale = (i18n.locales as readonly string[]).includes(requested)
    ? requested
    : i18n.defaultLocale

  try {
    const posts = allPosts
      .filter((post) => post.locale === locale)
      .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    if (posts.length === 0) {
      return NextResponse.json({ post: null }, { headers: cacheHeaders })
    }

    const latest = posts[0]
    if (!latest) {
      return NextResponse.json({ post: null }, { headers: cacheHeaders })
    }

    return NextResponse.json(
      { post: { slug: latest.slug, title: latest.title, date: latest.date } },
      { headers: cacheHeaders }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to fetch latest post' }, { status: 500 })
  }
}
