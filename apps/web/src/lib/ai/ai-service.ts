import { GoogleGenerativeAI } from '@google/generative-ai'
import { flags } from '@tszhong0411/env'

export type AIProvider = 'gemini' | 'ollama'

export interface AIServiceConfig {
  provider: AIProvider
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface SiteContext {
  currentPage: string
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
    if (flags.gemini && process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    }
  }

  async generateResponse(
    message: string,
    context: SiteContext,
    config: AIServiceConfig = { provider: 'gemini' }
  ): Promise<string> {
    switch (config.provider) {
      case 'gemini':
        return this.generateGeminiResponse(message, context, config)
      case 'ollama':
        return this.generateOllamaResponse(message, context, config)
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
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
      model: config.model || 'gemini-2.0-flash-lite' 
    })

    const systemPrompt = this.buildSystemPrompt(context, message)
    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    
    return response.text()
  }

  private async generateOllamaResponse(
    message: string,
    context: SiteContext,
    config: AIServiceConfig
  ): Promise<string> {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const ollamaModel = config.model || process.env.OLLAMA_MODEL || 'llama3.2'

    const systemPrompt = this.buildSystemPrompt(context, message)
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`

    try {
      // Usando endpoint nativo do Ollama
      const controller = new AbortController()
      
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
        }),
        signal: controller.signal,
        // Remove timeout - wait indefinitely
        // @ts-ignore - Next.js specific
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Ollama API error (${response.status}): ${errorText || response.statusText}`)
      }

      const data = await response.json()
      return data.response || 'Desculpe, não consegui gerar uma resposta.'
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to Ollama at ${ollamaUrl}. Make sure Ollama is running locally. Run: ollama serve`)
      }
      throw error
    }
  }

  private buildSystemPrompt(context: SiteContext, message: string): string {
    const localeInstructions = {
      'en': 'Respond in English',
      'pt': 'Responda em português brasileiro',
      'fr': 'Répondez en français',
      'de': 'Antworten Sie auf Deutsch',
      'zh': '请用中文回答'
    }

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
- Recent posts: ${context.recentPosts?.map(p => p.title).join(', ') || 'none'}
- Featured projects: ${context.projects?.map(p => p.name).join(', ') || 'none'}

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
  async generateTags(content: string, existingTags: string[] = [], provider: AIProvider = 'gemini'): Promise<string[]> {
    const prompt = `Analyze this blog post content and suggest 3-6 relevant tags.

CONTENT:
${content.substring(0, 1500)}...

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
      .map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
      .filter(tag => tag.length > 0)
      .slice(0, 6)
  }

  async generateSummary(content: string, maxLength: number = 200, provider: AIProvider = 'gemini'): Promise<string> {
    const prompt = `Create a concise summary of this blog post (max ${maxLength} characters):

CONTENT:
${content.substring(0, 2000)}...

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
    return response.substring(0, maxLength).trim()
  }

  async generateMetaDescription(title: string, content: string, provider: AIProvider = 'gemini'): Promise<string> {
    const prompt = `Create an SEO-optimized meta description (120-160 characters) for this blog post:

TITLE: ${title}

CONTENT:
${content.substring(0, 1500)}...

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
      description = description.substring(0, 157) + '...'
    } else if (description.length < 120) {
      description = description + ' - Yuri Cunha\'s Blog'
    }
    
    return description
  }

  async translateContent(content: string, fromLang: string, toLang: string, provider: AIProvider = 'gemini'): Promise<string> {
    const langNames = {
      'en': 'English',
      'pt': 'Portuguese (Brazilian)',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ja': 'Japanese',
      'zh': 'Chinese (Simplified)',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'ru': 'Russian',
      'ur': 'Urdu'
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
    return !!(flags.gemini && process.env.GEMINI_API_KEY && this.gemini)
  }

  isOllamaAvailable(): boolean {
    return !!(process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL)
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = []
    if (this.isGeminiAvailable()) providers.push('gemini')
    if (this.isOllamaAvailable()) providers.push('ollama')
    return providers
  }
}

export const aiService = new AIService()
