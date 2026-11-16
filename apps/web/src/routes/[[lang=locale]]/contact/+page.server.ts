import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { buildSeoHead } from '#lib/seo.ts'
import type { PageServerLoad } from './$types'

// Contact form posts to /api/contact; page itself is static per locale.
export const prerender = false

const LABEL_KEYS = [
  'page-title',
  'page-description',
  'form.title',
  'form.description',
  'form.name.label',
  'form.name.placeholder',
  'form.name.required',
  'form.name.max-length',
  'form.email.label',
  'form.email.placeholder',
  'form.email.required',
  'form.email.invalid',
  'form.subject.label',
  'form.subject.placeholder',
  'form.subject.required',
  'form.subject.max-length',
  'form.message.label',
  'form.message.placeholder',
  'form.message.required',
  'form.message.min-length',
  'form.message.max-length',
  'form.submit',
  'form.submitting',
  'form.success',
  'form.error',
  'form.network-error',
  'direct.title',
  'direct.description',
  'direct.email-label',
  'direct.response-time',
  'direct.urgent',
  'social.title',
  'social.description',
  'social.github.name',
  'social.github.description',
  'social.twitter.name',
  'social.twitter.description',
  'social.linkedin.name',
  'social.linkedin.description'
] as const

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale
  const t = await getServerTranslator(locale)
  const labels = buildLabels(t, 'contact', LABEL_KEYS)

  // Re-key labels back to the component's flat naming (strip 'contact.' prefix).
  const flat: Record<string, string> = {}
  for (const [key, value] of Object.entries(labels)) {
    flat[key.replace('contact.', '')] = value
  }

  return {
    ...buildSeoHead({
      slug: '/contact',
      locale,
      title: flat['page-title'],
      description: flat['page-description']
    }),
    locale,
    labels: flat
  }
}
