import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { i18n } from '@isyuricunha/i18n/config'
import type { EntryGenerator, PageServerLoad } from './$types'

// Notifications are user-specific; the page shell stays static per locale.
// The default crawl evaluates the optional [[lang=locale]] param as empty,
// so only the unprefixed variant gets prerendered without an explicit list.
export const entries: EntryGenerator = () =>
  i18n.locales.map((locale) => ({ lang: locale as never }))

export const prerender = true

const LABEL_KEYS = [
  'title',
  'sign-in',
  'empty',
  'loading',
  'refreshing',
  'unread',
  'mark-all-read'
] as const

const SIGN_IN_LABEL_KEYS = [
  'sign-in',
  'sign-up',
  'sign-in-error',
  'sign-up-error',
  'sign-in-success',
  'sign-up-success',
  'email-placeholder',
  'password-placeholder',
  'already-have-account',
  'dont-have-account'
] as const

const signInCatalogKey = (key: string) => {
  if (key === 'email-placeholder' || key === 'password-placeholder') {
    return `dialog.sign-in.${key}`
  }

  if (key === 'already-have-account' || key === 'dont-have-account') {
    return `dialog.${key}`
  }

  return `common.${key}`
}

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale
  const t = await getServerTranslator(locale)
  const labels = buildLabels(t, 'component.notifications', LABEL_KEYS)
  const description = t('component.notifications.empty')
  const siteName = t('metadata.site-title')

  const flat: Record<string, string> = {}
  for (const [key, value] of Object.entries(labels)) {
    flat[key.replace('component.notifications.', '')] = value
  }

  // Labels for the reused sign-in dialog, keyed the way the component reads.
  for (const key of SIGN_IN_LABEL_KEYS) {
    flat[key] = t(signInCatalogKey(key))
  }

  return {
    ...buildSeoHead({ slug: '/notifications', locale, title: flat.title, description }),
    locale,
    siteName,
    labels: flat
  }
}
