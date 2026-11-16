import { SIDEBAR_LINKS, HEADER_LINKS } from '#lib/links.ts'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ url }) => {
  return {
    pathname: url.pathname,
    title: 'Yuri Cunha Docs',
    // Structured plain-data copies for the layout template.
    sidebar: SIDEBAR_LINKS.map((section) => ({
      title: section.title,
      links: section.links.map((link) => ({ href: link.href, text: link.text }))
    })),
    headerLinks: HEADER_LINKS.map((link) => ({ href: link.href, text: link.text }))
  }
}
