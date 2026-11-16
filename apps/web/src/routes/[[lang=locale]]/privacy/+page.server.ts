import { i18n } from '@isyuricunha/i18n/config'
import type { EntryGenerator } from './$types'
import { createContentPageLoad } from '../content-page'

// The default crawl evaluates the optional [[lang=locale]] param as empty,
// so only the unprefixed variant gets prerendered without an explicit list.
export const entries: EntryGenerator = () =>
  i18n.locales.map((locale) => ({ lang: locale as never }))

export const prerender = true

export const load = createContentPageLoad('privacy')
