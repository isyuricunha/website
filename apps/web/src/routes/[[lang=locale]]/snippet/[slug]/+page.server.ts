import { error } from '@sveltejs/kit'
import { getSnippet, getSnippetSlugs } from '#lib/content.ts'
import type { EntryGenerator, PageServerLoad } from './$types'

export const entries: EntryGenerator = () => {
  return getSnippetSlugs().map(({ locale, slug }) => ({ lang: locale as never, slug }))
}

export const prerender = true

export const load: PageServerLoad = async ({ params, parent }) => {
  const { locale } = await parent()
  const snippet = getSnippet(locale, params.slug)

  if (!snippet) {
    error(404, 'Snippet not found')
  }

  return {
    locale,
    snippet: {
      slug: snippet.slug,
      title: snippet.title,
      description: snippet.description,
      date: snippet.date,
      html: snippet.html
    }
  }
}
