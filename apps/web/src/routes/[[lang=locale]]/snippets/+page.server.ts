import { redirect } from '@sveltejs/kit'
import { i18n } from '@isyuricunha/i18n/config'
import { getLocalizedPath } from '#lib/seo.ts'
import type { PageServerLoad } from './$types'

// /snippets permanently redirects to /snippet, matching the Next.js page.
export const prerender = true

export const load: PageServerLoad = async ({ params }) => {
  const target = getLocalizedPath({ slug: '/snippet', locale: params.lang ?? i18n.defaultLocale })

  redirect(308, target)
}
