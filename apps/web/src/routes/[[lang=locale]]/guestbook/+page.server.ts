import { buildSeoHead } from '#lib/seo.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import type { PageServerLoad } from './$types'

// The guestbook renders authenticated content; it is server rendered per
// request and never prerendered.
export const prerender = false

const LABEL_KEYS = [
  'title',
  'description',
  'pinned-greeting',
  'pinned-description',
  'message-label',
  'placeholder',
  'submit',
  'message-cannot-be-empty',
  'create-message-successfully',
  'failed-to-load-messages',
  'no-messages',
  'sign-in',
  'sign-up',
  'sign-in-error',
  'sign-up-error',
  'sign-in-success',
  'sign-up-success',
  'signin-description',
  'email-placeholder',
  'password-placeholder',
  'already-have-account',
  'dont-have-account'
] as const

const catalogKey = (key: string) => {
  if (key === 'pinned-greeting' || key === 'pinned-description') {
    return `guestbook.pinned.${key.replace('pinned-', '')}`
  }

  if (key === 'signin-description') {
    return 'guestbook.signin.description'
  }

  if (key.startsWith('sign-')) {
    return `common.${key}`
  }

  if (
    key === 'email-placeholder' ||
    key === 'password-placeholder' ||
    key === 'already-have-account' ||
    key === 'dont-have-account'
  ) {
    return key === 'already-have-account' || key === 'dont-have-account'
      ? `dialog.${key}`
      : `dialog.sign-in.${key}`
  }

  return `guestbook.${key}`
}

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale
  const t = await getServerTranslator(locale)

  const labels: Record<string, string> = {}

  for (const key of LABEL_KEYS) {
    labels[key] = t(catalogKey(key))
  }

  labels['sign-out'] = t('common.sign-out')
  labels['error'] = t('common.error')
  labels['delete'] = t('common.delete')

  // Session data is already resolved request-scoped in hooks.server.ts.
  const user = locals.user as {
    id: string
    name: string | null
    image: string | null
    role: string
  } | null

  return {
    ...buildSeoHead({
      slug: '/guestbook',
      locale,
      title: labels['title'],
      description: labels['description']
    }),
    locale,
    labels,
    user: user ? { id: user.id, name: user.name, image: user.image } : null,
    isAdmin: user?.role === 'admin'
  }
}
