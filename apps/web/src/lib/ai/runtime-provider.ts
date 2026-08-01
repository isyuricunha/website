import 'server-only'

import { build_yue_openai_messages, type YueSiteContext } from './yue-context'
import { get_ai_runtime_config } from './runtime-config'

const CHAT_REQUEST_TIMEOUT_MS = 60_000

type ChatCompletionPayload = {
  choices?: Array<{
    message?: {
      content?: unknown
    }
  }>
}

type ChatStreamPayload = {
  choices?: Array<{
    delta?: {
      content?: unknown
    }
  }>
}

const extract_text_content = (content: unknown): string | null => {
  if (typeof content === 'string') return content

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (!part || typeof part !== 'object') return ''
        const value = Reflect.get(part, 'text')
        return typeof value === 'string' ? value : ''
      })
      .join('')

    return text || null
  }

  return null
}

const get_runtime_config = async () => {
  const config = await get_ai_runtime_config()
  if (!config) {
    throw new Error('Runtime AI configuration is incomplete')
  }
  return config
}

const create_chat_request = async (
  message: string,
  context: YueSiteContext,
  stream: boolean
) => {
  const config = await get_runtime_config()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CHAT_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${config.endpoint}/chat/completions`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        accept: stream ? 'text/event-stream' : 'application/json',
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: build_yue_openai_messages(context, message, 15),
        temperature: 0.7,
        max_tokens: 256,
        stream
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Chat endpoint returned HTTP ${response.status}`)
    }

    return response
  } finally {
    clearTimeout(timeout)
  }
}

class RuntimeProvider {
  async generateResponse(message: string, context: YueSiteContext): Promise<string> {
    const response = await create_chat_request(message, context, false)
    const payload = (await response.json()) as ChatCompletionPayload
    const content = extract_text_content(payload.choices?.[0]?.message?.content)

    if (!content) {
      throw new Error('Chat endpoint returned an empty or unsupported response')
    }

    return content
  }

  async generateStream(
    message: string,
    context: YueSiteContext
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await create_chat_request(message, context, true)
    if (!response.body) {
      throw new Error('Chat endpoint returned an empty stream')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split(/\r?\n/)
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue

              const data = trimmed.slice(5).trim()
              if (!data) continue
              if (data === '[DONE]') {
                controller.close()
                return
              }

              try {
                const payload = JSON.parse(data) as ChatStreamPayload
                const content = extract_text_content(payload.choices?.[0]?.delta?.content)
                if (content) controller.enqueue(encoder.encode(content))
              } catch {
                // Ignore malformed event lines and continue reading the stream.
              }
            }
          }

          const tail = decoder.decode()
          if (tail) buffer += tail
          controller.close()
        } catch (error) {
          controller.error(error)
        } finally {
          reader.releaseLock()
        }
      },
      cancel() {
        return reader.cancel()
      }
    })
  }
}

export const runtimeProvider = new RuntimeProvider()
