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

const contentByLocale = new Map(
  i18n.locales.map((locale) => [
    locale,
    {
      posts: newestForLocale(allPosts, locale),
      snippets: newestForLocale(allSnippets, locale),
      projects: newestForLocale(allProjects, locale)
    }
  ])
)

export const getRecentNotFoundContent = (locale: string) => {
  return contentByLocale.get(locale) ?? contentByLocale.get(i18n.defaultLocale)!
}
