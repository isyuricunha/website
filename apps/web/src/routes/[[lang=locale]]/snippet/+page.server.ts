import { getSnippets } from '#lib/content.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

// The snippet listing is fully static content.
export const prerender = true

export const load: PageServerLoad = async ({ parent, url }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)
  const head = buildSeoHead({
    slug: '/snippet',
    locale,
    title: t('snippet.title'),
    description: t('snippet.description')
  })

  return {
    ...head,
    locale,
    canonicalPath: `${url.origin}${head.canonicalPath}`,
    snippets: getSnippets(locale).map(({ slug, title, description, date }) => ({
      slug,
      title,
      description,
      date
    }))
  }
}
