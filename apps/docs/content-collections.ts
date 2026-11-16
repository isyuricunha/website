import { defineCollection, defineConfig } from '@content-collections/core'
import { getTOC, rehypePlugins, remarkPlugins } from '@isyuricunha/mdx-plugins'
import { evaluate } from '@mdx-js/mdx'
import { z } from 'zod'

import { createDocsComponents } from './mdx/docs-components'
import { Fragment, jsx, jsxs } from '@isyuricunha/mdx-render/runtime'

const contentSchema = z.object({
  content: z.string()
})

const linkSchema = z
  .object({
    doc: z.string().optional(),
    api: z.string().optional()
  })
  .optional()

const docMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  link: linkSchema
})

const docs = defineCollection({
  name: 'Doc',
  directory: '../docs/src/content',
  include: '**/*.mdx',
  schema: contentSchema.merge(docMetaSchema),
  transform: async (document) => {
    const path = document._meta.path.replaceAll('\\', '/')

    const components = createDocsComponents()
    const { default: Content } = await evaluate(document.content, {
      Fragment,
      jsx,
      jsxs,
      remarkPlugins,
      rehypePlugins
    })

    const html = Content({ components }).html

    return {
      ...document,
      html,
      slug: path === 'index' ? '' : path
    }
  }
})

export default defineConfig({
  content: [docs]
})
