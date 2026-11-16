import { getPosts } from '#lib/content.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

// The blog listing serves on demand for now; it flips to prerender together
// with the post page, whose prerender crawl requires the [slug] route to
// exist. Same entries as the Next.js generateStaticParams (one per locale).
export const prerender = false

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)

  return {
    title: t('blog.title'),
    description: t('blog.description'),
    strings: {
      home: t('layout.home'),
      blog: t('layout.blog'),
      rss: t('blog.filtered-posts.rss'),
      error: t('common.error')
    },
    posts: getPosts(locale).map(
      ({ slug, title, summary, date, readingTime, category, tags, featured }) => ({
        slug,
        title,
        summary,
        date,
        readingTime,
        category,
        tags,
        featured
      })
    )
  }
}
