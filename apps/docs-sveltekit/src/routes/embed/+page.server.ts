import { error } from '@sveltejs/kit'
import { getDemo } from '../../../mdx/demos-registry.ts'
import { renderToStaticMarkup } from 'react-dom/server'
import type { PageServerLoad } from './$types'

// Embed route: a single component demo rendered in an iframe by the docs.
export const prerender = false

export const load: PageServerLoad = async ({ url }) => {
  const component = url.searchParams.get('component')

  if (!component) {
    error(400, 'Missing component parameter')
  }

  const demo = await getDemo(component)

  if (!demo) {
    error(404, 'Component not found')
  }

  return { title: component, html: renderToStaticMarkup(demo) }
}
