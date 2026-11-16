import { i18n } from '@isyuricunha/i18n/config'
import path from 'node:path'
import { BlogService, setBlogContentDir } from '@isyuricunha/trpc-server/lib/blog/blog-service'

// The MDX corpus lives in the Next app tree until consolidation.
setBlogContentDir(path.resolve(process.cwd(), '../web/src/content/blog'))

export const prerender = false

export async function GET({ url }: { url: string }): Promise<Response> {
  const { searchParams } = new URL(url)
  const requested = searchParams.get('locale') || i18n.defaultLocale
  // An unknown locale would silently disable the mascot's new-post
  // notification; fall back to the default locale instead of answering "no
  // post" for a typo'd locale.
  const locale = (i18n.locales as readonly string[]).includes(requested)
    ? requested
    : i18n.defaultLocale

  try {
    const posts = await BlogService.getPostsByLocale(locale)
    if (posts.length === 0) {
      return Response.json({ post: null })
    }

    const latest = posts[0]
    if (!latest) {
      return Response.json({ post: null })
    }

    return Response.json({
      post: {
        slug: latest.slug,
        title: latest.title,
        date: latest.date
      }
    })
  } catch {
    return Response.json({ error: 'Failed to fetch latest post' }, { status: 500 })
  }
}
