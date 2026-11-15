import { error } from '@sveltejs/kit'
import { getProject, getProjectSlugs } from '#lib/content.ts'
import { buildSeoHead } from '#lib/seo.ts'
import type { EntryGenerator, PageServerLoad } from './$types'

export const entries: EntryGenerator = () => {
  return getProjectSlugs().map(({ locale, slug }) => ({ lang: locale as never, slug }))
}

export const prerender = true

export const load: PageServerLoad = async ({ params, parent }) => {
  const { locale } = await parent()
  const project = getProject(locale, params.slug)

  if (!project) {
    error(404, 'Project not found')
  }

  const head = buildSeoHead({
    slug: `/projects/${project.slug}`,
    locale,
    title: project.name,
    description: project.description
  })

  return {
    ...head,
    locale,
    html: project.html
  }
}
