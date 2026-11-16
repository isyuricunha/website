import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

// Keys are relative to each namespace; buildLabels applies the prefix itself.
const TABLE_KEYS = [
  'name',
  'email',
  'role',
  'createdAt',
  'status',
  'actions',
  'search',
  'filter-names',
  'filter-all-roles',
  'export-csv',
  'open-menu',
  'edit',
  'reset-password',
  'ban',
  'unban',
  'delete',
  'active',
  'banned',
  'roles.user',
  'roles.admin',
  'confirm-delete-with-name',
  'confirm-ban-with-name',
  'confirm-unban-with-name',
  'delete-success',
  'delete-error',
  'ban-success',
  'ban-error',
  'unban-success',
  'unban-error',
  'reset-password-success',
  'reset-password-error',
  'update-success',
  'update-error',
  'export-success',
  'failed-to-fetch-users-data',
  'rows-count',
  'prev-page',
  'next-page'
] as const

const MODAL_KEYS = [
  'title',
  'name',
  'username',
  'email',
  'role',
  'image',
  'cancel',
  'save',
  'saving',
  'update-success',
  'update-error',
  'validation.name-required',
  'validation.invalid-email',
  'validation.invalid-url',
  'roles.user',
  'roles.admin'
] as const

const COMMON_KEYS = ['confirm', 'cancel', 'processing'] as const

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent()
  const t = await getServerTranslator(locale)

  const labels: Record<string, string> = {
    ...buildLabels(t, 'admin.table.users', TABLE_KEYS),
    ...buildLabels(t, 'admin.modals.edit-user', MODAL_KEYS),
    ...buildLabels(t, 'admin.common', COMMON_KEYS),
    'page-header.title': t('admin.page-header.users.title'),
    'page-header.description': t('admin.page-header.users.description'),
    'common.admin-label': t('admin.common.admin-label')
  }

  return {
    locale,
    labels
  }
}
