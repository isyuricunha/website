import { error } from '@sveltejs/kit'
import { getPage } from '#lib/content.ts'
import { buildSeoHead } from '#lib/seo.ts'
import { getServerTranslator } from '#lib/i18n/server.ts'

/**
 * Shared loader for the fixed content pages backed by the pages collection.
 * The MDX slug matches the route name (about, privacy, uses). Typed
 * structurally: the generated per-route types live in the routes themselves.
 */
export function createContentPageLoad(pageName: string) {
  return async (event: { parent: () => Promise<{ locale: string }> }) => {
    const { locale } = await event.parent()
    const page = getPage(locale, pageName)

    if (!page) {
      error(404, 'Page not found')
    }

    const t = await getServerTranslator(locale)
    const head = buildSeoHead({
      slug: `/${pageName}`,
      locale,
      title: t(`${pageName}.title`),
      description: t(`${pageName}.description`)
    })

    return {
      ...head,
      html: page.html
    }
  }
}
