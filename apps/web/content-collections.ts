import { type Context, defineCollection, defineConfig, type Meta } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { getTOC, rehypePlugins, remarkPlugins } from '@isyuricunha/mdx-plugins'
import { z } from 'zod'

const contentSchema = z.object({
  content: z.string()
})

type BaseDoc = {
  _meta: Meta
  content: string
}

const transform = async <D extends BaseDoc>(document: D, context: Context) => {
  const code = await compileMDX(context, document, {
    remarkPlugins,
    rehypePlugins
  })
  const [locale, path] = document._meta.path.split(/[/\\]/)

  if (!locale || !path) {
    throw new Error(`Invalid path: ${document._meta.path}`)
  }

  return {
    ...document,
    code,
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

const posts = defineCollection({
  name: 'Post',
  directory: 'src/content/blog',
  include: '**/*.mdx',
  schema: contentSchema.merge(postFieldsSchema),
  transform: async (document, context) => {
    const baseTransform = await transform(document, context)

    // Calculate reading time: Latin scripts average ~200 wpm, CJK scripts
    // have no whitespace boundaries so whitespace counting collapses a whole
    // article into a handful of "words". Count CJK characters separately at
    // ~500 cpm and combine.
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

const snippetDateSchema = z
  .union([z.string(), z.date()])
  .transform((value) =>
    typeof value === 'string' ? value : (value.toISOString().split('T')[0] ?? '')
  )

const snippetFieldsSchema = z.object({
  title: z.string(),
  date: snippetDateSchema,
  author: z.string().optional(),
  description: z.string(),
  tags: z.array(z.string()).optional().default([]),
  readingTime: z.number().optional()
})

const snippets = defineCollection({
  name: 'Snippet',
  directory: 'src/content/snippet',
  include: '**/*.mdx',
  schema: contentSchema.merge(snippetFieldsSchema),
  transform: async (document, context) => {
    const baseTransform = await transform(document, context)

    // Same CJK-aware counting as posts above.
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

const projects = defineCollection({
  name: 'Project',
  directory: 'src/content/projects',
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
  directory: 'src/content/pages',
  include: '**/*.mdx',
  schema: contentSchema,
  transform
})

export default defineConfig({
  content: [posts, snippets, projects, pages]
})
