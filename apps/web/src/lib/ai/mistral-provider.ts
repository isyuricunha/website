import { Mistral } from '@mistralai/mistralai'
import { env, flags } from '@isyuricunha/env'
import {
  build_yue_openai_messages,
  build_yue_system_message,
  type YueSiteContext
} from './yue-context'
import { logger } from '@/lib/logger'

type SiteContext = YueSiteContext

export class MistralProvider {
  private client: Mistral | null = null
  private readonly defaultModel = 'mistral-large-latest'

  constructor() {
    logger.info('[MistralProvider] Initializing...', {
      hasFlag: flags.mistral,
      hasApiKey: !!env.MISTRAL_API_KEY,
      apiKeyLength: env.MISTRAL_API_KEY?.length,
      baseUrl: env.MISTRAL_BASE_URL
    })

    if (flags.mistral && env.MISTRAL_API_KEY) {
      this.client = new Mistral({
        apiKey: env.MISTRAL_API_KEY,
        serverURL: env.MISTRAL_BASE_URL || undefined
      })
      logger.info('[MistralProvider] Client initialized successfully')
    } else {
      logger.warn('[MistralProvider] Client NOT initialized', {
        flags_mistral: flags.mistral,
        has_api_key: !!env.MISTRAL_API_KEY
      })
    }
  }

  isAvailable(): boolean {
    const available = !!(flags.mistral && env.MISTRAL_API_KEY && this.client)
    logger.debug('[MistralProvider] isAvailable:', { available })
    return available
  }

  async generateResponse(message: string, context: SiteContext): Promise<string> {
    logger.info('[MistralProvider] generateResponse called', {
      messageLength: message.length,
      hasContext: !!context
    })

    if (!this.client) {
      const error = new Error('Mistral AI is not available - client is null')
      logger.error('[MistralProvider] Client not initialized', {
        hasFlag: flags.mistral,
        hasApiKey: !!env.MISTRAL_API_KEY
      })
      throw error
    }

    const messages = build_yue_openai_messages(context, message, 15)
    const systemMessage = build_yue_system_message(context)

    logger.debug('[MistralProvider] Sending request to Mistral API', {
      model: env.MISTRAL_AGENT_ID || this.defaultModel,
      messageCount: messages.length + 1
    })

    try {
      const response = await this.client.chat.complete({
        model: env.MISTRAL_AGENT_ID || this.defaultModel,
        messages: [{ role: 'system', content: systemMessage }, ...messages],
        temperature: 0.7,
        maxTokens: 256
      })

      logger.debug('[MistralProvider] API response received', {
        hasResponse: !!response,
        hasChoices: !!response?.choices?.length
      })

      const content = response.choices?.[0]?.message?.content
      if (typeof content === 'string') {
        return content
      }
      return 'Sorry, I could not generate a response.'
    } catch (error) {
      logger.error('[MistralProvider] API error', {
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error ? error.cause : undefined
      })

      if (error instanceof Error) {
        throw new Error(`Mistral API error: ${error.message}`, { cause: error })
      }
      throw new Error('Mistral API error: unknown error', { cause: error })
    }
  }

  async generateStream(message: string, context: SiteContext): Promise<ReadableStream<Uint8Array>> {
    if (!this.client) {
      throw new Error('Mistral AI is not available')
    }

    const messages = build_yue_openai_messages(context, message, 15)
    const systemMessage = build_yue_system_message(context)
    const encoder = new TextEncoder()

    try {
      const stream = await this.client.chat.stream({
        model: env.MISTRAL_AGENT_ID || this.defaultModel,
        messages: [{ role: 'system', content: systemMessage }, ...messages],
        temperature: 0.7,
        maxTokens: 256
      })

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.data?.choices?.[0]?.delta?.content
              if (typeof content === 'string') {
                controller.enqueue(encoder.encode(content))
              }
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Mistral streaming error: ${error.message}`, { cause: error })
      }
      throw new Error('Mistral streaming error: unknown error', { cause: error })
    }
  }
}

export const mistralProvider = new MistralProvider()
