import { GoogleGenerativeAI } from '@google/generative-ai'
import { env, flags } from '@isyuricunha/env'

type AIProvider = 'gemini' | 'ollama'

interface AIServiceConfig {
  provider: AIProvider
  model?: string
  temperature?: number
  maxTokens?: number
}

interface SiteContext {
  currentPage: string
  pagePath?: string
  pageContext?: {
    type: 'post' | 'project' | 'page'
    title: string
    description: string
    href: string
    contentExcerpt: string
  } | null
  citations?: Array<{
    id: string
    title: string
    href: string
    excerpt?: string
    type: 'post' | 'project' | 'page'
  }>
  conversation?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }>
  recentPosts?: Array<{
    title: string
    slug: string
    excerpt: string
  }>
  projects?: Array<{
    name: string
    description: string
    tech: string[]
  }>
  locale: string
}

class AIService {
  private gemini?: GoogleGenerativeAI

  constructor() {
    // Initialize Gemini only if enabled and API key exists
    if (flags.gemini && env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    }
  }

  async generateResponse(
    message: string,
    context: SiteContext,
    config?: AIServiceConfig
  ): Promise<string> {
    const resolved_config: AIServiceConfig = config ?? { provider: 'gemini' }

    switch (resolved_config.provider) {
      case 'gemini':
        return this.generateGeminiResponse(message, context, resolved_config)
      case 'ollama':
        return this.generateOllamaResponse(message, context, resolved_config)
      default:
        throw new Error(`Unsupported AI provider: ${resolved_config.provider}`)
    }
  }

  private async generateGeminiResponse(
    message: string,
    context: SiteContext,
    config: AIServiceConfig
  ): Promise<string> {
    if (!this.gemini || !flags.gemini) {
      throw new Error('Gemini AI is not available')
    }

    const model = this.gemini.getGenerativeModel({
      model: config.model || env.GEMINI_MODEL || 'gemini-2.0-flash-lite'
    })

    const systemPrompt = this.buildSystemPrompt(context, message)
    const result = await model.generateContent(systemPrompt)
    const response = result.response

    return response.text()
  }

  private async generateOllamaResponse(
    message: string,
    context: SiteContext,
    config: AIServiceConfig
  ): Promise<string> {
    const ollamaUrl = env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const ollamaModel = config.model || env.OLLAMA_MODEL || 'llama3.2'

    const systemPrompt = this.buildSystemPrompt(context, message)
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`

    // Usando endpoint nativo do Ollama
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: config.temperature || 0.7,
          num_predict: config.maxTokens || 500
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response || 'Desculpe, não consegui gerar uma resposta.'
  }

  private buildSystemPrompt(context: SiteContext, message: string): string {
    const localeInstructions = {
      en: 'Respond in English',
      pt: 'Responda em português brasileiro',
      fr: 'Répondez en français',
      de: 'Antworten Sie auf Deutsch',
      zh: '请用中文回答'
    }

    const conversationBlock = (() => {
      const conversation = context.conversation?.slice(-10) ?? []
      if (conversation.length === 0) return 'none'

      return conversation
        .map((m) => {
          const role = m.role === 'user' ? 'User' : 'Assistant'
          return `${role}: ${m.content}`
        })
        .join('\n')
    })()

    const pageContextBlock = context.pageContext
      ? [
        `type: ${context.pageContext.type}`,
        `title: ${context.pageContext.title}`,
        `description: ${context.pageContext.description}`,
        `href: ${context.pageContext.href}`,
        `content_excerpt: ${context.pageContext.contentExcerpt}`
      ].join('\n')
      : 'none'

    const sourcesBlock = (context.citations ?? [])
      .map((c) => `- ${c.title} (${c.type}): ${c.href}${c.excerpt ? ` — ${c.excerpt}` : ''}`)
      .join('\n')

    return `You are Yue, the friendly virtual mascot created by Yuri Cunha for his personal website.

Personality:
- Friendly, helpful, and enthusiastic
- Knowledgeable about web development, databases, and technology
- Speaks in a casual, approachable tone
- Sometimes uses emojis to be more expressive
- ${localeInstructions[context.locale as keyof typeof localeInstructions] || 'Reply in the same language the user speaks to you'}

Context about the website:
- Owner: Yuri Cunha, a Database Administrator (DBA) and Server Infrastructure Specialist from Brazil
- Focus: Modern web development, server/warehouse infrastructure, database optimization, and tech projects
- Current page: ${context.currentPage}
- Current path: ${context.pagePath ?? 'unknown'}
- Recent posts: ${context.recentPosts?.map((p) => p.title).join(', ') || 'none'}
- Featured projects: ${context.projects?.map((p) => p.name).join(', ') || 'none'}

Page context (if available):
${pageContextBlock}

Conversation (recent):
${conversationBlock}

Sources (internal site links you can reference; do not invent URLs):
${sourcesBlock || 'none'}

About Yuri:
- Database Administrator (DBA) and Server Infrastructure Specialist
- Experienced with Go programming language, GitHub API integration, bug fixing with GitHub team
- Website sections:
  * Blog: https://yuricunha.com/blog
  * Setup/Stacks: https://yuricunha.com/
  * Guestbook: https://yuricunha.com/guestbook
  * Projects: https://yuricunha.com/projects (functional with GitHub API)
  * About: https://yuricunha.com/about
  * Music: https://yuricunha.com/spotify
- Email: me@yuricunha.com
- GitHub: https://github.com/isyuricunha

Guidelines:
- Provide helpful but concise explanations for technical topics
- Share relevant information about Yuri or the website when asked
- Stay in character as the website mascot
- Keep responses brief unless specifically asked for detailed explanations

User message: ${message}`
  }

  // Content generation methods
  async generateTags(
    content: string,
    existingTags: string[] = [],
    provider: AIProvider = 'gemini'
  ): Promise<string[]> {
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

    const response = await this.generateResponse(prompt, context, { provider })

    // Extract tags from response
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

  async generateSummary(
    content: string,
    maxLength = 200,
    provider: AIProvider = 'gemini'
  ): Promise<string> {
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

    const response = await this.generateResponse(prompt, context, { provider })
    return response.slice(0, Math.max(0, maxLength)).trim()
  }

  async generateMetaDescription(
    title: string,
    content: string,
    provider: AIProvider = 'gemini'
  ): Promise<string> {
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

    const response = await this.generateResponse(prompt, context, { provider })

    // Ensure it's within the character limit
    let description = response.trim()
    if (description.length > 160) {
      description = description.slice(0, 157) + '...'
    } else if (description.length < 120) {
      description = description + " - Yuri Cunha's Blog"
    }

    return description
  }

  async translateContent(
    content: string,
    fromLang: string,
    toLang: string,
    provider: AIProvider = 'gemini'
  ): Promise<string> {
    const langNames = {
      en: 'English',
      pt: 'Portuguese (Brazilian)',
      fr: 'French',
      de: 'German',
      zh: 'Chinese (Simplified)'
    }

    const prompt = `Translate this content from ${langNames[fromLang as keyof typeof langNames]} to ${langNames[toLang as keyof typeof langNames]}:

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

    return this.generateResponse(prompt, context, { provider })
  }

  // Check if providers are available
  isGeminiAvailable(): boolean {
    return !!(flags.gemini && env.GEMINI_API_KEY && this.gemini)
  }

  isOllamaAvailable(): boolean {
    return !!(flags.ollama && (env.OLLAMA_BASE_URL || env.OLLAMA_MODEL))
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = []
    // Prefer local Ollama when available; Gemini stays as fallback
    if (this.isOllamaAvailable()) providers.push('ollama')
    if (this.isGeminiAvailable()) providers.push('gemini')
    return providers
  }
}

export const aiService = new AIService()
