import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

// Keys are relative to each namespace; buildLabels applies the prefix itself.
const TABLE_KEYS = [
  'columns.createdAt',
  'columns.action',
  'columns.admin',
  'columns.targetType',
  'columns.targetId',
  'columns.ipAddress',
  'search-placeholder',
  'filter-actions'
] as const

const PAGE_KEYS = ['failed-to-fetch'] as const

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)

  const labels: Record<string, string> = {
    ...buildLabels(t, 'admin.audit-logs', TABLE_KEYS),
    ...buildLabels(t, 'admin.audit-logs', PAGE_KEYS),
    'page-header.title': t('admin.page-header.audit-logs.title'),
    'page-header.description': t('admin.page-header.audit-logs.description'),
    'common.admin-label': t('admin.common.admin-label')
  }

  return {
    locale,
    labels
  }
}
