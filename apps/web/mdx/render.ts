import { evaluate } from '@mdx-js/mdx'
import { rehypePlugins, remarkPlugins } from '@isyuricunha/mdx-plugins'

import { createContentComponents } from './content-components'
import { Fragment, jsx, jsxs } from '@isyuricunha/mdx-render/runtime'

/**
 * Renders one MDX document to static HTML using the custom string runtime.
 * Runs inside the content pipeline build process only; no React anywhere in
 * this path. Components are injected through the MDXContent props, which the
 * compiled body spreads over its built-in tag defaults.
 */
export async function renderMdxHtml(source: string, locale: string): Promise<string> {
  const components = createContentComponents(locale)

  const { default: Content } = await evaluate(source, {
    Fragment,
    jsx,
    jsxs,
    remarkPlugins,
    rehypePlugins
  })

  return Content({ components }).html
}
