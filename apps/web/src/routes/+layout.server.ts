import { getServerTranslator } from '#lib/i18n/server.ts'
import type { LayoutServerLoad } from './$types'

// Locale negotiation lives in hooks.server.ts; this load surfaces the locale
// and the layout chrome labels (header, navbar, footer) to the layout.
const LAYOUT_LABEL_KEYS = [
  'skip-to-main-content',
  'home',
  'blog',
  'snippets',
  'guestbook',
  'projects',
  'about',
  'now',
  'uses',
  'music',
  'recap',
  'sitemap',
  'privacy',
  'contact',
  'github',
  'links',
  'star',
  'navigation',
  'toggle-menu'
] as const

export const load: LayoutServerLoad = async ({ locals }) => {
  const locale = locals.locale
  const t = await getServerTranslator(locale)

  const labels: Record<string, string> = {}

  for (const key of LAYOUT_LABEL_KEYS) {
    labels[key] = t(`layout.${key}`)
  }

  return { locale, labels }
}
