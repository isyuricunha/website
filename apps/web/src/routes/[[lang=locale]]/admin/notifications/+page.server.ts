import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

// Keys are relative to the namespace; buildLabels applies the prefix itself.
const LABEL_KEYS = [
  'title',
  'description',
  'loading',
  'empty',
  'error',
  'messages.created',
  'messages.create-failed',
  'messages.mark-read-failed',
  'messages.title-content-required',
  'actions.create',
  'actions.send',
  'actions.mark-read',
  'dialog.create-title',
  'dialog.create-description',
  'fields.title',
  'fields.title-placeholder',
  'fields.content',
  'fields.content-placeholder',
  'fields.type',
  'fields.user-id',
  'fields.user-id-placeholder',
  'fields.expires-at',
  'fields.action-url',
  'types.system',
  'types.security',
  'types.user-action',
  'types.content',
  'types.marketing',
  'types.reminder',
  'stats.current-page',
  'stats.total.title',
  'stats.total.description',
  'stats.unread.title',
  'stats.unread.description',
  'stats.read-rate.title',
  'stats.read-rate.description',
  'recent.title',
  'recent.description',
  'recent.user',
  'recent.expires',
  'status.unread'
] as const

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)

  const labels: Record<string, string> = {
    ...buildLabels(t, 'admin.notification-management', LABEL_KEYS),
    'common.cancel': t('common.cancel')
  }

  return {
    locale,
    labels
  }
}
