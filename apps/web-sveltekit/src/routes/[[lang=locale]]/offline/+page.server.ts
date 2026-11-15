import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

// Cached offline fallback page; no personal or request-specific content.
export const prerender = true

const LABEL_KEYS = [
  'title',
  'description',
  'refresh',
  'go-home',
  'available.title',
  'available.cached-pages',
  'available.loaded-content',
  'available.search'
] as const

export const load: PageServerLoad = async ({ locals }) => {
  const t = await getServerTranslator(locals.locale)

  return {
    labels: buildLabels(t, 'offline', LABEL_KEYS)
  }
}
