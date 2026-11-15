import { getProjects } from '#lib/content.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

// Static content listing; the GitHub repo widget joins in stage 6 with the
// tRPC mount, so the page stays on-demand until then.
export const prerender = false

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)
  const head = buildSeoHead({
    slug: '/projects',
    locale,
    title: t('projects.title'),
    description: t('projects.description')
  })

  return {
    ...head,
    locale,
    projects: getProjects(locale).map(({ slug, name, description, techstack, status }) => ({
      slug,
      name,
      description,
      techstack,
      status
    }))
  }
}
