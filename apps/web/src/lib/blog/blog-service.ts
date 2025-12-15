import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { logger } from '@/lib/logger'

interface BlogPost {
  slug: string
  title: string
  date: string
  modifiedTime?: string
  summary: string
  content: string
  locale: string
  filePath: string
}

interface BlogPostMetadata {
  slug: string
  title: string
  date: string
  modifiedTime?: string
  summary: string
  locale: string
  filePath: string
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog')
const SUPPORTED_LOCALES = ['en', 'pt', 'fr', 'de', 'ja', 'zh']

const is_enoent = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  )
}

export const BlogService = {
  /**
   * Get all blog posts for a specific locale
   */
  async getPostsByLocale(locale: string): Promise<BlogPostMetadata[]> {
    const localeDir = path.join(CONTENT_DIR, locale)

    try {
      const files = await fs.readdir(localeDir)
      const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

      const posts = await Promise.all(
        mdxFiles.map(async (file) => {
          const filePath = path.join(localeDir, file)
          const fileContent = await fs.readFile(filePath, 'utf8')
          const { data } = matter(fileContent)

          return {
            slug: file.replace('.mdx', ''),
            title: data.title || 'Untitled',
            date: data.date || new Date().toISOString(),
            modifiedTime: data.modifiedTime,
            summary: data.summary || '',
            locale,
            filePath
          }
        })
      )

      return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      if (is_enoent(error)) return []
      logger.error('Error reading posts for locale', error, { locale })
      return []
    }
  },

  /**
   * Get all blog posts across all locales
   */
  async getAllPosts(): Promise<BlogPostMetadata[]> {
    const allPosts: BlogPostMetadata[] = []

    for (const locale of SUPPORTED_LOCALES) {
      const posts = await this.getPostsByLocale(locale)
      allPosts.push(...posts)
    }

    return allPosts
  },

  /**
   * Get a specific blog post by slug and locale
   */
  async getPost(slug: string, locale: string): Promise<BlogPost | null> {
    const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`)

    try {
      const fileContent = await fs.readFile(filePath, 'utf8')
      const { data, content } = matter(fileContent)

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        modifiedTime: data.modifiedTime,
        summary: data.summary || '',
        content,
        locale,
        filePath
      }
    } catch (error) {
      if (is_enoent(error)) return null
      logger.error('Error reading post', error, { slug, locale })
      return null
    }
  },

  /**
   * Save a blog post to file system
   */
  async savePost(post: Omit<BlogPost, 'filePath'>): Promise<boolean> {
    const { slug, title, date, modifiedTime, summary, content, locale } = post
    const localeDir = path.join(CONTENT_DIR, locale)
    const filePath = path.join(localeDir, `${slug}.mdx`)

    // Ensure directory exists
    await fs.mkdir(localeDir, { recursive: true })

    // Create frontmatter
    const frontmatter = {
      title,
      date,
      ...(modifiedTime && { modifiedTime }),
      summary
    }

    // Combine frontmatter and content
    const fileContent = matter.stringify(content, frontmatter)

    try {
      await fs.writeFile(filePath, fileContent, 'utf8')
      return true
    } catch (error) {
      logger.error('Error saving post', error, { slug, locale })
      return false
    }
  },

  /**
   * Delete a blog post
   */
  async deletePost(slug: string, locale: string): Promise<boolean> {
    const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`)

    try {
      await fs.unlink(filePath)
      return true
    } catch (error) {
      logger.error('Error deleting post', error, { slug, locale })
      return false
    }
  },

  /**
   * Check if a post exists in a specific locale
   */
  async postExists(slug: string, locale: string): Promise<boolean> {
    const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`)

    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  },

  /**
   * Get posts grouped by slug (for translation management)
   */
  async getPostsBySlug(): Promise<Record<string, BlogPostMetadata[]>> {
    const allPosts = await this.getAllPosts()
    const groupedPosts: Record<string, BlogPostMetadata[]> = {}

    allPosts.forEach((post) => {
      const slug = post.slug
      const group = groupedPosts[slug] ?? []
      if (!groupedPosts[slug]) {
        groupedPosts[slug] = group
      }
      group.push(post)
    })

    return groupedPosts
  },

  /**
   * Generate a unique slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}
