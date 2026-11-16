import { redirect } from '@sveltejs/kit'
import { getSession } from '@isyuricunha/trpc-server/auth'
import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { LayoutServerLoad } from './$types'

export const prerender = false

const LABEL_KEYS = [
  'nav.general',
  'nav.dashboard',
  'nav.users',
  'nav.comments',
  'nav.security_management',
  'nav.security',
  'nav.audit_logs',
  'nav.communication',
  'nav.email_marketing',
  'nav.announcements',
  'nav.notifications',
  'nav.monitoring_dashboard',
  'nav.monitoring',
  'nav.system_health',
  'nav.data_management',
  'nav.bulk_operations',
  'sidebar.control',
  'common.admin-label',
  'sign-in',
  'sign-out',
  'widget.title',
  'widget.description',
  'widget.loading',
  'widget.empty',
  'widget.dismiss',
  'widget.high-priority'
] as const

export const load: LayoutServerLoad = async ({ locals, request }) => {
  const locale = locals.locale
  const session = await getSession(request.headers)

  if (!session || session.user.role !== 'admin') {
    redirect(307, locale === 'en' ? '/' : `/${locale}`)
  }

  const t = await getServerTranslator(locale)
  const labels = buildLabels(t, 'admin', LABEL_KEYS)

  for (const key of [
    'widget.title',
    'widget.description',
    'widget.loading',
    'widget.empty',
    'widget.dismiss',
    'widget.high-priority'
  ]) {
    labels[key] = t(`component.announcement-widget.${key.replace('widget.', '')}`)
  }

  return {
    locale,
    user: session.user,
    labels
  }
}
