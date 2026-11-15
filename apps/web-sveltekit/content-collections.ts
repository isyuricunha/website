import { defineCollection, defineConfig } from '@content-collections/core'
import { getTOC, rehypePlugins, remarkPlugins } from '@isyuricunha/mdx-plugins'
import { evaluate } from '@mdx-js/mdx'
import { z } from 'zod'

import { createContentComponents } from './mdx/content-components'
import { Fragment, jsx, jsxs } from '@isyuricunha/mdx-render/runtime'

const contentSchema = z.object({
  content: z.string()
})

type BaseDoc = {
  _meta: {
    path: string
  }
  content: string
}

// Shared MDX-to-HTML step: evaluates the document with the same remark/rehype
// pipeline the Next.js app uses, but through the custom string JSX runtime so
// no React ends up anywhere in the render path.
const transform = async <D extends BaseDoc>(document: D, _context: unknown) => {
  const [locale, path] = document._meta.path.split(/[/\\]/)

  if (!locale || !path) {
    throw new Error(`Invalid path: ${document._meta.path}`)
  }

  const components = createContentComponents(locale)
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
    locale,
    slug: path,
    toc: await getTOC(document.content)
  }
}

const postFieldsSchema = z.object({
  title: z.string(),
  date: z.string(),
  modifiedTime: z.string(),
  summary: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  readingTime: z.number().optional(),
  featured: z.boolean().optional().default(false)
})

const snippetFieldsSchema = z.object({
  title: z.string(),
  date: z
    .union([z.string(), z.date()])
    .transform((value) => (typeof value === 'string' ? value : value.toISOString())),
  author: z.string().optional(),
  description: z.string(),
  tags: z.array(z.string()).optional().default([]),
  readingTime: z.number().optional()
})

const projectFieldsSchema = z.object({
  name: z.string(),
  description: z.string(),
  homepage: z.string().optional(),
  github: z.string(),
  repository: z.string().optional(), // For compatibility
  techstack: z.array(z.string()),
  selected: z.boolean().optional().default(false),
  status: z.enum(['active', 'archived', 'beta', 'completed']).optional().default('active'),
  category: z.string().optional(),
  featured: z.boolean().optional().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

const posts = defineCollection({
  name: 'Post',
  directory: '../web/src/content/blog',
  include: '**/*.mdx',
  schema: contentSchema.merge(postFieldsSchema),
  transform: async (document, context) => {
    const baseTransform = await transform(document, context)

    // Reading time: Latin scripts average ~200 wpm, CJK scripts have no
    // whitespace boundaries so whitespace counting collapses a whole article
    // into a handful of "words". Count CJK characters separately at ~500 cpm
    // and combine.
    const cjkCount = (
      document.content.match(
        /[\u{3040}-\u{30FF}\u{3400}-\u{4DBF}\u{4E00}-\u{9FFF}\u{F900}-\u{FAFF}]/gu
      ) ?? []
    ).length
    const latinWords = document.content
      .replace(/[\u{3040}-\u{30FF}\u{3400}-\u{4DBF}\u{4E00}-\u{9FFF}\u{F900}-\u{FAFF}]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean).length
    const readingTime = Math.max(1, Math.ceil(latinWords / 200 + cjkCount / 500))

    return {
      ...baseTransform,
      readingTime
    }
  }
})

const snippets = defineCollection({
  name: 'Snippet',
  directory: '../web/src/content/snippet',
  include: '**/*.mdx',
  schema: contentSchema.merge(snippetFieldsSchema),
  transform
})

const projects = defineCollection({
  name: 'Project',
  directory: '../web/src/content/projects',
  include: '**/*.mdx',
  schema: contentSchema.merge(projectFieldsSchema),
  transform: async (document, context) => {
    const baseTransform = await transform(document, context)

    return {
      ...baseTransform,
      repository: document.github || document.repository // Ensure compatibility
    }
  }
})

const pages = defineCollection({
  name: 'Page',
  directory: '../web/src/content/pages',
  include: '**/*.mdx',
  schema: contentSchema,
  transform
})

export default defineConfig({
  content: [posts, snippets, projects, pages]
})
