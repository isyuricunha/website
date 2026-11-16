import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

// Keys are relative to each namespace; buildLabels applies the prefix itself.
const TABLE_KEYS = [
  'userId',
  'body',
  'type',
  'createdAt',
  'actions',
  'search',
  'open-menu',
  'delete',
  'delete-title',
  'confirm-delete-with-body',
  'delete-success',
  'delete-error',
  'export-csv',
  'export-success',
  'failed-to-fetch-comments-data',
  'prev-page',
  'next-page'
] as const

const COMMON_KEYS = ['confirm', 'cancel', 'processing'] as const

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)

  const labels: Record<string, string> = {
    ...buildLabels(t, 'admin.table.comments', TABLE_KEYS),
    ...buildLabels(t, 'admin.common', COMMON_KEYS),
    'page-header.title': t('admin.page-header.comments.title'),
    'page-header.description': t('admin.page-header.comments.description'),
    'common.admin-label': t('admin.common.admin-label')
  }

  return {
    locale,
    labels
  }
}
