import { redirect } from '@sveltejs/kit'
import { flags } from '#lib/flags.ts'
import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { getSession } from '@isyuricunha/trpc-server/auth'
import { DEFAULT_LOCALE } from '#lib/i18n/config.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

const LABEL_KEYS = [
  'title',
  'description',
  'sign-in',
  'sections.profile',
  'sections.profile-description',
  'sections.security',
  'sections.security-description',
  'fields.avatar-url',
  'fields.avatar-url-placeholder',
  'fields.avatar-upload',
  'fields.username',
  'fields.username-placeholder',
  'fields.public-profile',
  'fields.public',
  'fields.private',
  'fields.name-color',
  'fields.name-color-placeholder',
  'fields.name-effect',
  'fields.bio',
  'fields.bio-placeholder',
  'fields.new-email',
  'fields.new-email-placeholder',
  'fields.current-password',
  'fields.new-password',
  'fields.confirm-new-password',
  'actions.upload-avatar',
  'actions.save-profile',
  'actions.change-email',
  'actions.change-password',
  'messages.profile-updated',
  'messages.avatar-updated',
  'messages.avatar-file-required',
  'messages.avatar-invalid-type',
  'messages.avatar-too-large',
  'messages.anonymous-avatar-restriction',
  'messages.email-required',
  'messages.email-verification-sent',
  'messages.current-password-required',
  'messages.password-too-short',
  'messages.passwords-do-not-match',
  'messages.password-updated',
  'privacy.title',
  'privacy.description',
  'privacy.export-title',
  'privacy.export-description',
  'privacy.download',
  'privacy.delete-title',
  'privacy.delete-description',
  'privacy.delete-trigger',
  'privacy.delete-export-reminder',
  'privacy.delete-sent',
  'privacy.delete-dialog-title',
  'privacy.delete-dialog-description',
  'privacy.confirm-label',
  'privacy.cancel',
  'privacy.delete-pending',
  'privacy.delete-action',
  'privacy.delete-unavailable'
] as const

export const load: PageServerLoad = async ({ locals, request }) => {
  const locale = locals.locale
  const t = await getServerTranslator(locale)

  const session = flags.auth ? await getSession(request.headers) : null
  if (flags.auth && !session) {
    redirect(307, locale === DEFAULT_LOCALE ? '/' : `/${locale}`)
  }

  const labels = buildLabels(t, 'settings', LABEL_KEYS)
  const siteName = t('metadata.site-title')

  const flat: Record<string, string> = {}
  for (const [key, value] of Object.entries(labels)) {
    flat[key.replace('settings.', '')] = value
  }

  if (!flat['sign-in']) {
    flat['sign-in'] = t('common.sign-in')
  }

  return {
    ...buildSeoHead({
      slug: '/settings',
      locale,
      title: flat.title,
      description: flat.description
    }),
    locale,
    siteName,
    authEnabled: flags.auth,
    labels: flat
  }
}
