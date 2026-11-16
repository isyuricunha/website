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
  'messages.translate-failed',
  'messages.title-content-required',
  'messages.pt-filled',
  'messages.all-languages-filled',
  'messages.created',
  'messages.create-failed',
  'messages.updated',
  'messages.update-failed',
  'messages.deleted',
  'messages.delete-failed',
  'actions.create',
  'actions.update',
  'actions.translating',
  'actions.fill-pt',
  'actions.translate-all',
  'actions.activate',
  'actions.deactivate',
  'actions.edit-aria',
  'actions.delete-aria',
  'create.title',
  'create.description',
  'edit.title',
  'edit.description',
  'delete.title',
  'delete.description',
  'fields.title',
  'fields.title-placeholder',
  'fields.title-pt',
  'fields.title-pt-placeholder',
  'fields.content',
  'fields.content-placeholder',
  'fields.content-pt',
  'fields.content-pt-placeholder',
  'fields.type',
  'fields.priority',
  'fields.priority-value',
  'fields.dismissible',
  'fields.active',
  'types.info',
  'types.success',
  'types.warning',
  'types.error',
  'types.maintenance',
  'types.feature',
  'types.update',
  'analytics.total-views.title',
  'analytics.total-views.description',
  'analytics.dismissal-rate.title',
  'analytics.dismissal-rate.description',
  'analytics.active.title',
  'analytics.active.description',
  'list.title',
  'list.description',
  'status.inactive',
  'status.translated',
  'status.targeted',
  'status.dismissible',
  'status.not-dismissible',
  'fields.active'
] as const

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)

  const labels: Record<string, string> = {
    ...buildLabels(t, 'admin.announcement-management', LABEL_KEYS),
    'common.cancel': t('common.cancel'),
    'common.delete': t('common.delete')
  }

  return {
    locale,
    labels
  }
}
