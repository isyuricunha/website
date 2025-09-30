import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface BlogPost {
  slug: string
  title: string
  date: string
  modifiedTime?: string
  summary: string
  content: string
  locale: string
  filePath: string
  tags?: string[]
}

export interface BlogPostMetadata {
  slug: string
  title: string
  date: string
  modifiedTime?: string
  summary: string
  locale: string
  filePath: string
  tags?: string[]
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog')
const SUPPORTED_LOCALES = ['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'hi', 'bn', 'ru', 'ur']

export class BlogService {
  /**
   * Get all blog posts for a specific locale
   */
  static async getPostsByLocale(locale: string): Promise<BlogPostMetadata[]> {
    const localeDir = path.join(CONTENT_DIR, locale)
    
    try {
      // Check if directory exists first
      try {
        await fs.access(localeDir)
      } catch {
        // Directory doesn't exist, return empty array silently
        return []
      }

      const files = await fs.readdir(localeDir)
      const mdxFiles = files.filter(file => file.endsWith('.mdx'))
      
      const posts = await Promise.all(
        mdxFiles.map(async (file) => {
          const filePath = path.join(localeDir, file)
          try {
            const fileContent = await fs.readFile(filePath, 'utf8')
            const { data } = matter(fileContent)
            
            return {
              slug: file.replace('.mdx', ''),
              title: data.title || 'Untitled',
              date: data.date || new Date().toISOString(),
              modifiedTime: data.modifiedTime,
              summary: data.summary || '',
              locale,
              filePath,
              tags: data.tags || []
            }
          } catch (error) {
            console.error(`Error parsing ${filePath}:`, error)
            return null
          }
        })
      )
      
      // Filter out null values from failed parses
      const validPosts = posts.filter((post): post is BlogPostMetadata => post !== null)
      
      return validPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      console.error(`Error reading posts for locale ${locale}:`, error)
      return []
    }
  }

  /**
   * Get all blog posts across all locales
   */
  static async getAllPosts(): Promise<BlogPostMetadata[]> {
    const allPosts: BlogPostMetadata[] = []
    
    for (const locale of SUPPORTED_LOCALES) {
      const posts = await this.getPostsByLocale(locale)
      allPosts.push(...posts)
    }
    
    return allPosts
  }

  /**
   * Get a specific blog post by slug and locale
   */
  static async getPost(slug: string, locale: string): Promise<BlogPost | null> {
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
        filePath,
        tags: data.tags || []
      }
    } catch (error) {
      console.error(`Error reading post ${slug} for locale ${locale}:`, error)
      return null
    }
  }

  /**
   * Check if a post exists
   */
  static async postExists(slug: string, locale: string): Promise<boolean> {
    const localeDir = path.join(CONTENT_DIR, locale)
    const filePath = path.join(localeDir, `${slug}.mdx`)
    
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Save a blog post to file system
   */
  static async savePost(post: Omit<BlogPost, 'filePath'>): Promise<boolean> {
    const { slug, title, date, modifiedTime, summary, content, locale, tags } = post
    const localeDir = path.join(CONTENT_DIR, locale)
    const filePath = path.join(localeDir, `${slug}.mdx`)
    
    // Ensure directory exists
    await fs.mkdir(localeDir, { recursive: true })
    
    // Create frontmatter
    const frontmatter = {
      title,
      date,
      ...(modifiedTime && { modifiedTime }),
      summary,
      ...(tags && tags.length > 0 && { tags })
    }
    
    // Combine frontmatter and content
    const fileContent = matter.stringify(content, frontmatter)
    
    try {
      await fs.writeFile(filePath, fileContent, 'utf8')
      return true
    } catch (error) {
      console.error(`Error saving post ${slug} for locale ${locale}:`, error)
      return false
    }
  }

  /**
   * Delete a blog post
   */
  static async deletePost(slug: string, locale: string): Promise<boolean> {
    const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`)
    
    try {
      await fs.unlink(filePath)
      return true
    } catch (error) {
      console.error(`Error deleting post ${slug} for locale ${locale}:`, error)
      return false
    }
  }

  /**
   * Check if a post exists in a specific locale
   */
  static async postExists(slug: string, locale: string): Promise<boolean> {
    const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`)
    
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get posts grouped by slug (for translation management)
   */
  static async getPostsBySlug(): Promise<Record<string, BlogPostMetadata[]>> {
    const allPosts = await this.getAllPosts()
    const groupedPosts: Record<string, BlogPostMetadata[]> = {}
    
    allPosts.forEach(post => {
      if (!groupedPosts[post.slug]) {
        groupedPosts[post.slug] = []
      }
      groupedPosts[post.slug].push(post)
    })
    
    return groupedPosts
  }

  /**
   * Generate a unique slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}
