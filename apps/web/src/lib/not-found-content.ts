import { i18n } from '@isyuricunha/i18n/config'
import { allPosts, allProjects, allSnippets } from 'content-collections'

// The localized 404 UI is reached by arbitrary URLs. Compute its three
// recommendations per locale once per server instance, not on every 404.
const newestForLocale = <T extends { locale: string }>(entries: readonly T[], locale: string) =>
  entries
    .filter((entry) => entry.locale === locale)
    .toSorted((a, b) => {
      const firstDate = new Date((a as { date?: string }).date ?? 0).getTime()
      const secondDate = new Date((b as { date?: string }).date ?? 0).getTime()
      return secondDate - firstDate
    })
    .slice(0, 3)

const createLocaleContent = (locale: string) => ({
  posts: newestForLocale(allPosts, locale),
  snippets: newestForLocale(allSnippets, locale),
  projects: newestForLocale(allProjects, locale)
})

// not-found is bundled into the route tree. Do not sort all locales merely
// because a regular page imports the same server bundle. Populate lazily on
// the first 404 in each locale, then reuse for that worker's lifetime.
const contentByLocale = new Map<string, ReturnType<typeof createLocaleContent>>()

export const getRecentNotFoundContent = (locale: string) => {
  const selectedLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale
  const cached = contentByLocale.get(selectedLocale)
  if (cached) return cached

  const content = createLocaleContent(selectedLocale)
  contentByLocale.set(selectedLocale, content)
  return content
}
