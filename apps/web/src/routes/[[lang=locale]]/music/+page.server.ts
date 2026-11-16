import { buildLabels } from '#lib/labels.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { i18n } from '@isyuricunha/i18n/config'
import type { EntryGenerator, PageServerLoad } from './$types'

// All music data is fetched client-side from Last.fm through tRPC; the page
// shell itself is static per locale.
// The default crawl evaluates the optional [[lang=locale]] param as empty,
// so only the unprefixed variant gets prerendered without an explicit list.
export const entries: EntryGenerator = () =>
  i18n.locales.map((locale) => ({ lang: locale as never }))

export const prerender = true

const LABEL_KEYS = [
  'title',
  'description',
  'sections.listening-data.label',
  'sections.listening-data.title',
  'now-listening.title',
  'now-listening.subtitle',
  'now-listening.not-playing',
  'now-listening.by',
  'top-artists.title',
  'top-artists.subtitle',
  'top-artists.no-data',
  'top-artists.tooltips.shuffle-on',
  'top-artists.tooltips.shuffle-off',
  'top-artists.tooltips.view-list',
  'top-artists.tooltips.view-grid',
  'top-songs.title',
  'top-songs.subtitle',
  'top-songs.no-data',
  'recently-played.title',
  'recently-played.subtitle',
  'recently-played.no-data',
  'heatmap.title',
  'heatmap.subtitle',
  'heatmap.days.sun',
  'heatmap.days.mon',
  'heatmap.days.tue',
  'heatmap.days.wed',
  'heatmap.days.thu',
  'heatmap.days.fri',
  'heatmap.days.sat',
  'heatmap.legend.low',
  'heatmap.legend.high',
  'import.title',
  'import.subtitle',
  'import.choose',
  'import.plays',
  'import.artists',
  'import.duration',
  'import.invalid-file',
  'import.parse-error',
  'import.file-too-large',
  'stats.title',
  'stats.subtitle',
  'stats.labels.total-hours',
  'stats.labels.diversity',
  'stats.labels.avg-popularity',
  'stats.labels.top-artists',
  'stats.labels.top-genres',
  'error',
  'no-data',
  'refresh',
  'export.csv',
  'export.json',
  'range.short',
  'range.medium',
  'range.long',
  'listeners',
  'followers',
  'timeline.title',
  'timeline.subtitle',
  'timeline.empty',
  'timeline.periods.last-hour',
  'timeline.periods.today',
  'timeline.periods.yesterday',
  'timeline.periods.this-week',
  'timeline.periods.earlier',
  'timeline.more-tracks',
  'timeline.count',
  'timeline.labels.total-tracks',
  'timeline.labels.unique-artists',
  'timeline.labels.track',
  'timeline.labels.tracks',
  'social.title',
  'social.subtitle',
  'social.now-playing',
  'social.top-tracks',
  'social.share-text',
  'social.buttons.twitter',
  'social.buttons.facebook',
  'social.buttons.copy',
  'social.buttons.open',
  'social.profile.title',
  'social.profile.share-title',
  'social.profile.share-description'
] as const

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale
  const t = await getServerTranslator(locale)
  const labels = buildLabels(t, 'spotify', LABEL_KEYS)
  const siteDescription = t('metadata.site-description')

  const flat: Record<string, string> = {}
  for (const [key, value] of Object.entries(labels)) {
    flat[key.replace('spotify.', '')] = value
  }

  return {
    ...buildSeoHead({ slug: '/music', locale, title: flat.title, description: flat.description }),
    locale,
    siteDescription,
    labels: flat
  }
}
