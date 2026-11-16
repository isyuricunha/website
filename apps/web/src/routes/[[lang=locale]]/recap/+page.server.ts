import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { buildSeoHead } from '#lib/seo.ts'
import type { PageServerLoad } from './$types'

export const prerender = false

const LABEL_KEYS = [
  'title',
  'description',
  'loading',
  'no-data',
  'period',
  'all-time',
  'coding.total',
  'coding.daily-average',
  'coding.top-projects',
  'coding.top-languages',
  'listening.top-artists',
  'listening.top-tracks',
  'listening.plays',
  'content.total-posts',
  'content.published-last-year',
  'content.top-post',
  'content.most-read',
  'content.most-liked',
  'content.views',
  'content.likes'
] as const

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale
  const t = await getServerTranslator(locale)
  const labels = buildLabels(t, 'recap', LABEL_KEYS)

  return {
    ...buildSeoHead({
      slug: '/recap',
      locale,
      title: labels['title'],
      description: labels['description']
    }),
    locale,
    labels
  }
}
