import { GoogleGenerativeAI } from '@google/generative-ai'
import { env, flags } from '@isyuricunha/env'

type AIProvider = 'hf' | 'hf_local' | 'gemini' | 'groq' | 'ollama'

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
      case 'hf':
        return this.generateYueLlmResponse(message, context, resolved_config, 'hf')
      case 'hf_local':
        return this.generateYueLlmResponse(message, context, resolved_config, 'hf_local')
      case 'gemini':
        return this.generateGeminiResponse(message, context, resolved_config)
      case 'groq':
        return this.generateGroqResponse(message, context, resolved_config)
      case 'ollama':
        return this.generateOllamaResponse(message, context, resolved_config)
      default:
        throw new Error(`Unsupported AI provider: ${resolved_config.provider}`)
    }
  }

  private getYueLlmTimeoutMs(): number {
    return env.YUE_LLM_REQUEST_TIMEOUT_MS ?? 300_000
  }

  private buildSystemMessage(context: SiteContext): string {
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
- Keep responses brief unless specifically asked for detailed explanations`
  }

  private buildSystemPrompt(context: SiteContext, message: string): string {
    return `${this.buildSystemMessage(context)}\n\nUser message: ${message}`
  }

  private async generateYueLlmResponse(
    message: string,
    context: SiteContext,
    config: AIServiceConfig,
    provider: 'hf' | 'hf_local'
  ): Promise<string> {
    if (!this.isYueLlmAvailable(provider)) {
      throw new Error('Yue LLM is not available')
    }

    const spaceUrl = env.YUE_LLM_SPACE_URL.replace(/\/$/, '')
    const endpoint = provider === 'hf' ? '/respond/hf' : '/respond/local'

    const system_message = this.buildSystemMessage(context)
    const history = (context.conversation ?? []).slice(-15).map((m) => ({
      role: m.role,
      content: m.content
    }))

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.getYueLlmTimeoutMs())

    try {
      const response = await fetch(`${spaceUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.YUE_LLM_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history,
          system_message,
          max_tokens: config.maxTokens ?? 256,
          temperature: config.temperature ?? 0.7,
          top_p: 0.95,
          stream: false
        }),
        signal: controller.signal
      })

      const contentType = response.headers.get('content-type') || ''

      if (!response.ok) {
        const details = contentType.includes('application/json')
          ? ((await response.json().catch(() => null)) as { detail?: string; error?: string } | null)
          : null

        const msg = details?.error ?? details?.detail ?? response.statusText
        throw new Error(`Yue LLM API error (${response.status}): ${msg}`)
      }

      if (!contentType.includes('application/json')) {
        const text = await response.text()
        return text.trim()
      }

      const data = (await response.json()) as { response?: string }
      return data.response?.trim() || 'Sorry, I could not generate a response.'
    } finally {
      clearTimeout(timeout)
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

  private async generateGroqResponse(
    message: string,
    context: SiteContext,
    config: AIServiceConfig
  ): Promise<string> {
    if (!this.isGroqAvailable()) {
      throw new Error('Groq AI is not available')
    }

    const model = config.model || env.GROQ_MODEL || 'llama-3.3-70b-versatile'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000)

    const system_message = this.buildSystemMessage(context)
    const history = (context.conversation ?? []).slice(-15)

    const messages = [
      { role: 'system' as const, content: system_message },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: message }
    ]

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 256,
          stream: false
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        const details = contentType.includes('application/json')
          ? ((await response.json().catch(() => null)) as { error?: { message?: string } } | null)
          : null

        const msg = details?.error?.message ?? response.statusText
        throw new Error(`Groq API error (${response.status}): ${msg}`)
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }

      return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.'
    } finally {
      clearTimeout(timeout)
    }
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
          temperature: config.temperature ?? 0.4,
          num_predict: config.maxTokens ?? 256
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response || 'Desculpe, não consegui gerar uma resposta.'
  }

  async generateOllamaStream(
    message: string,
    context: SiteContext,
    config: AIServiceConfig
  ): Promise<ReadableStream<Uint8Array>> {
    if (!this.isOllamaAvailable()) {
      throw new Error('Ollama AI is not available')
    }

    const ollamaUrl = env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const ollamaModel = config.model || env.OLLAMA_MODEL || 'llama3.2'

    const systemPrompt = this.buildSystemPrompt(context, message)
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: fullPrompt,
            stream: true,
            options: {
              temperature: config.temperature ?? 0.4,
              num_predict: config.maxTokens ?? 256
            }
          })
        })

        if (!response.ok || !response.body) {
          throw new Error(`Ollama API error: ${response.statusText}`)
        }

        const reader = response.body.getReader()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const chunk = JSON.parse(line) as { response?: string; done?: boolean }
              if (chunk.response) {
                controller.enqueue(encoder.encode(chunk.response))
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }

        if (buffer.trim()) {
          try {
            const chunk = JSON.parse(buffer) as { response?: string }
            if (chunk.response) {
              controller.enqueue(encoder.encode(chunk.response))
            }
          } catch {
            // ignore trailing malformed chunk
          }
        }

        controller.close()
      }
    })
  }

  // Check if providers are available
  isHfAvailable(): boolean {
    return !!(flags.hf && env.YUE_LLM_SPACE_URL && env.YUE_LLM_API_TOKEN)
  }

  isHfLocalAvailable(): boolean {
    return !!(flags.hfLocal && env.YUE_LLM_SPACE_URL && env.YUE_LLM_API_TOKEN)
  }

  private isYueLlmAvailable(provider: 'hf' | 'hf_local'): boolean {
    return provider === 'hf' ? this.isHfAvailable() : this.isHfLocalAvailable()
  }

  isGroqAvailable(): boolean {
    return !!(flags.groq && env.GROQ_API_KEY)
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
    // Preferred fallback order: hf -> hf_local -> gemini
    if (this.isHfAvailable()) providers.push('hf')
    if (this.isHfLocalAvailable()) providers.push('hf_local')
    if (this.isGeminiAvailable()) providers.push('gemini')
    if (this.isGroqAvailable()) providers.push('groq')

    // Keep Ollama as an optional provider (useful for local dev)
    if (this.isOllamaAvailable()) providers.push('ollama')
    return providers
  }
}

export const aiService = new AIService()
