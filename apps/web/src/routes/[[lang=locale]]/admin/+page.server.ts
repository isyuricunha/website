import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

const LABEL_KEYS = [
  'title',
  'description',
  'status.live',
  'actions.refresh',
  'messages.refresh-success',
  'messages.refresh-error',
  'loading.title',
  'loading.description',
  'loading.card',
  'loading.error',
  'stats.total-users.title',
  'stats.total-comments.title',
  'stats.guestbook-entries.title',
  'stats.guestbook-entries.description',
  'stats.admin-users.title',
  'stats.admin-users.description',
  'stats.this-month',
  'recent-activity.title',
  'recent-activity.description',
  'recent-activity.weekly',
  'recent-activity.new-users',
  'recent-activity.new-comments',
  'quick-actions.title',
  'quick-actions.description',
  'quick-actions.manage-users.title',
  'quick-actions.manage-users.description',
  'quick-actions.moderate-comments.title',
  'quick-actions.moderate-comments.description',
  'quick-actions.monitoring.title',
  'quick-actions.monitoring.description',
  'system-health.title',
  'system-health.description',
  'system-health.engagement',
  'system-health.per-user',
  'system-health.monthly-users',
  'system-health.monthly-comments',
  'system-health.view-details'
] as const

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)
  const labels = buildLabels(t, 'admin.dashboard', LABEL_KEYS)

  const flat: Record<string, string> = {}
  for (const [key, value] of Object.entries(labels)) {
    flat[key.replace('admin.dashboard.', '')] = value
  }

  return {
    locale,
    labels: flat
  }
}
