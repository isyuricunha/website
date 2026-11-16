import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { i18n } from '@isyuricunha/i18n/config'
import type { EntryGenerator, PageServerLoad } from './$types'

// Cached offline fallback page; no personal or request-specific content.
// The default crawl evaluates the optional [[lang=locale]] param as empty,
// so only the unprefixed variant gets prerendered without an explicit list.
export const entries: EntryGenerator = () =>
  i18n.locales.map((locale) => ({ lang: locale as never }))

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
