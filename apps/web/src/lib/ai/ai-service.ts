import { runtimeProvider } from './runtime-provider'
import { type YueSiteContext } from './yue-context'

type SiteContext = YueSiteContext

class AIService {
  async generateStream(message: string, context: SiteContext): Promise<ReadableStream<Uint8Array>> {
    return runtimeProvider.generateStream(message, context)
  }

  async generateResponse(message: string, context: SiteContext): Promise<string> {
    return runtimeProvider.generateResponse(message, context)
  }

  async generateTags(content: string, existingTags: string[] = []): Promise<string[]> {
    const prompt = `Analyze this blog post content and suggest 3-6 relevant tags.

CONTENT:
${content.slice(0, 1500)}...

EXISTING TAGS: ${existingTags.join(', ')}

Instructions:
- Use lowercase, kebab-case format (e.g., "web-development", "javascript")
- Prioritize existing tags when relevant
- Focus on main technologies, topics, and concepts
- Return only the tags as a comma-separated list

Tags:`

    const context: SiteContext = {
      currentPage: '/blog',
      locale: 'en'
    }

    const response = await this.generateResponse(prompt, context)

    return response
      .split(',')
      .map((tag) =>
        tag
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '')
      )
      .filter((tag) => tag.length > 0)
      .slice(0, 6)
  }

  async generateSummary(content: string, maxLength = 200): Promise<string> {
    const prompt = `Create a concise summary of this blog post (max ${maxLength} characters):

CONTENT:
${content.slice(0, 2000)}...

Requirements:
- Maximum ${maxLength} characters
- Engaging and informative
- Suitable as post excerpt
- No markdown formatting

Summary:`

    const context: SiteContext = {
      currentPage: '/blog',
      locale: 'en'
    }

    const response = await this.generateResponse(prompt, context)
    return response.slice(0, Math.max(0, maxLength)).trim()
  }

  async generateMetaDescription(title: string, content: string): Promise<string> {
    const prompt = `Create an SEO-optimized meta description (120-160 characters) for this blog post:

TITLE: ${title}

CONTENT:
${content.slice(0, 1500)}...

Requirements:
- Exactly 120-160 characters
- Include relevant keywords naturally
- Compelling and click-worthy
- No quotes or special characters

Meta description:`

    const context: SiteContext = {
      currentPage: '/blog',
      locale: 'en'
    }

    const response = await this.generateResponse(prompt, context)

    let description = response.trim()
    if (description.length > 160) {
      description = description.slice(0, 157) + '...'
    } else if (description.length < 120) {
      description = description + " - Yuri Cunha's Blog"
    }

    return description
  }

  async translateContent(content: string, fromLang: string, toLang: string): Promise<string> {
    const langNames: Record<string, string> = {
      en: 'English',
      pt: 'Portuguese (Brazilian)',
      fr: 'French',
      de: 'German',
      zh: 'Chinese (Simplified)'
    }

    const prompt = `Translate this content from ${langNames[fromLang] || fromLang} to ${langNames[toLang] || toLang}:

${content}

Instructions:
- Maintain original formatting (markdown, HTML tags)
- Keep technical terms when appropriate
- Natural, fluent translation
- Preserve the original tone and style

Translation:`

    const context: SiteContext = {
      currentPage: '/blog',
      locale: toLang
    }

    return this.generateResponse(prompt, context)
  }

  getAvailableProviders(): string[] {
    return ['runtime']
  }
}

export const aiService = new AIService()
