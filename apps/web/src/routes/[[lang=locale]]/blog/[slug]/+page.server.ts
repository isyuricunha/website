import { flags } from '#lib/flags.ts'
import { getRecommendedPosts } from '#lib/recommendations.ts'
import { getPost, getPostSlugs } from '#lib/content.ts'
import { error } from '@sveltejs/kit'
import type { EntryGenerator, PageServerLoad } from './$types'

// Fully static: every localized post is prerendered from the build-time MDX
// render, same URL space as the Next.js generateStaticParams.
export const entries: EntryGenerator = () => {
  return getPostSlugs().map(({ locale, slug }) => ({ lang: locale as never, slug }))
}

export const prerender = true

export const load: PageServerLoad = async ({ params, parent }) => {
  const { locale } = await parent()
  const post = getPost(locale, params.slug)

  if (!post) {
    error(404, 'Post not found')
  }

  const recommended = getRecommendedPosts({ slug: params.slug, locale }).map((rec) => ({
    id: rec.id,
    title: rec.title,
    description: rec.description,
    href: rec.href,
    type: rec.type
  }))

  return {
    locale,
    flags: { comment: flags.comment, likeButton: flags.likeButton },
    recommended,
    post: {
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      date: post.date,
      readingTime: post.readingTime,
      html: post.html,
      toc: post.toc
    }
  }
}
