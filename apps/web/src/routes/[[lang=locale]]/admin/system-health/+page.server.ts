import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

// Keys are relative to the namespace; buildLabels applies the prefix itself.
const LABEL_KEYS = [
  'title',
  'description',
  'auto-refresh',
  'actions.refresh',
  'actions.resolve',
  'actions.resolve-all',
  'actions.view-all-errors',
  'messages.refreshed',
  'messages.error-resolved',
  'messages.all-errors-resolved',
  'messages.resolve-error-failed',
  'messages.resolve-all-errors-failed',
  'overall.status',
  'overall.last-checked',
  'overall.uptime',
  'stats.healthy-checks',
  'stats.warnings',
  'stats.critical-issues',
  'stats.unresolved-errors',
  'service-health.title',
  'recent-errors.title',
  'recent-errors.url',
  'recent-errors.user',
  'recent-errors.stack-trace',
  'trends.title',
  'trends.last-checks',
  'trends.filter',
  'trends.all-services',
  'trends.empty-title',
  'trends.empty-description',
  'trends.stats.healthy',
  'trends.stats.warnings',
  'trends.stats.critical',
  'trends.stats.unknown',
  'trends.table.time',
  'trends.table.service',
  'trends.table.status',
  'trends.table.latency',
  'trends.table.message',
  'status.healthy',
  'status.warning',
  'status.critical',
  'status.unknown'
] as const

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)
  const labels = buildLabels(t, 'admin.system-health', LABEL_KEYS)

  return {
    locale,
    labels
  }
}
