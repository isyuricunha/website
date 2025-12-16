import { type Context, defineCollection, defineConfig, type Meta } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { getTOC, rehypePlugins, remarkPlugins } from '@isyuricunha/mdx-plugins'

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

const posts = defineCollection({
  name: 'Post',
  directory: 'src/content/blog',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
    modifiedTime: z.string(),
    summary: z.string(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    readingTime: z.number().optional(),
    featured: z.boolean().optional().default(false)
  }),
  transform: async (document, context) => {
    const baseTransform = await transform(document, context)

    // Calculate reading time (average 200 words per minute)
    const wordCount = document.content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    return {
      ...baseTransform,
      readingTime
    }
  }
})

const snippets = defineCollection({
  name: 'Snippet',
  directory: 'src/content/snippet',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    date: z
      .union([z.string(), z.date()])
      .transform((value) => (typeof value === 'string' ? value : value.toISOString().split('T')[0] ?? '')),
    author: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).optional().default([]),
    readingTime: z.number().optional()
  }),
  transform: async (document, context) => {
    const baseTransform = await transform(document, context)

    // Calculate reading time (average 200 words per minute)
    const wordCount = document.content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    return {
      ...baseTransform,
      readingTime
    }
  }
})

const projects = defineCollection({
  name: 'Project',
  directory: 'src/content/projects',
  include: '**/*.mdx',
  schema: (z) => ({
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
  }),
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
  schema: () => ({}),
  transform
})

export default defineConfig({
  collections: [posts, snippets, projects, pages]
})
