import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

// New post creation redirects to the dashboard, matching the Next.js page.
export const prerender = false

export const load: PageServerLoad = async ({ params }) => {
  const locale = params.lang ?? 'en'
  redirect(307, locale === 'en' ? '/admin' : `/${locale}/admin`)
}
