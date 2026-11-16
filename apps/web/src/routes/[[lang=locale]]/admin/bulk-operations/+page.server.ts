import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

// Keys are relative to their namespaces; buildLabels applies the prefix itself.
const LABEL_KEYS = [
  'title',
  'description',
  'messages.completed',
  'messages.failed',
  'messages.cancelled',
  'messages.cancel-failed',
  'messages.select-users',
  'confirm.bulk-action',
  'confirm.cancel-operation',
  'confirm.bulk-action-title',
  'confirm.cancel-operation-title',
  'actions.delete-users',
  'actions.ban-users',
  'actions.unban-users',
  'actions.update-role',
  'actions.execute',
  'actions.cancel',
  'actions.export',
  'status.completed',
  'status.failed',
  'status.running',
  'status.cancelled',
  'status.pending',
  'date.never',
  'date.unknown',
  'user-actions.title',
  'user-actions.search-placeholder',
  'user-actions.filters',
  'user-actions.select-action',
  'user-actions.new-role',
  'user-actions.no-users',
  'user-actions.no-users-hint',
  'table.user',
  'table.select-all',
  'table.role',
  'table.joined',
  'operations.title',
  'operations.failed-to-load',
  'operations.loading',
  'operations.summary',
  'operations.progress',
  'operations.empty',
  'roles.user',
  'roles.admin'
] as const

const rolePattern = (key: string) =>
  key.startsWith('roles.') ? `admin.modals.edit-user.{key}` : key

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)

  const labels: Record<string, string> = {}
  for (const key of LABEL_KEYS) {
    labels[key] = t(
      key.startsWith('roles.') ? `admin.modals.edit-user.${key}` : `admin.bulk-operations.${key}`
    )
  }

  return {
    locale,
    labels
  }
}
