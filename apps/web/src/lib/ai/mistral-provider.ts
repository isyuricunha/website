import { Mistral } from '@mistralai/mistralai'
import { env, flags } from '@isyuricunha/env'
import {
  build_yue_openai_messages,
  build_yue_system_message,
  type YueSiteContext
} from './yue-context'

type SiteContext = YueSiteContext

export class MistralProvider {
  private client: Mistral | null = null
  private readonly defaultModel = 'mistral-large-latest'

  constructor() {
    if (flags.mistral && env.MISTRAL_API_KEY) {
      this.client = new Mistral({
        apiKey: env.MISTRAL_API_KEY,
        serverURL: env.MISTRAL_BASE_URL || undefined
      })
    }
  }

  isAvailable(): boolean {
    return !!(flags.mistral && env.MISTRAL_API_KEY && this.client)
  }

  async generateResponse(
    message: string,
    context: SiteContext
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Mistral AI is not available')
    }

    const messages = build_yue_openai_messages(context, message, 15)
    const systemMessage = build_yue_system_message(context)

    try {
      const response = await this.client.chat.complete({
        model: env.MISTRAL_AGENT_ID || this.defaultModel,
        messages: [
          { role: 'system', content: systemMessage },
          ...messages
        ],
        temperature: 0.7,
        maxTokens: 256
      })

      const content = response.choices?.[0]?.message?.content
      if (typeof content === 'string') {
        return content
      }
      return 'Sorry, I could not generate a response.'
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Mistral API error: ${error.message}`, { cause: error })
      }
      throw new Error('Mistral API error: unknown error', { cause: error })
    }
  }

  async generateStream(
    message: string,
    context: SiteContext
  ): Promise<ReadableStream<Uint8Array>> {
    if (!this.client) {
      throw new Error('Mistral AI is not available')
    }

    const messages = build_yue_openai_messages(context, message, 15)
    const systemMessage = build_yue_system_message(context)
    const encoder = new TextEncoder()

    try {
      const stream = await this.client.chat.stream({
        model: env.MISTRAL_AGENT_ID || this.defaultModel,
        messages: [
          { role: 'system', content: systemMessage },
          ...messages
        ],
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
