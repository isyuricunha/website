export type AssistantCitation = {
  id: string
  title: string
  href: string
  excerpt?: string
  type: 'post' | 'project' | 'page' | 'snippet'
}

export type AssistantAction =
  { type: 'navigate'; href: string; title: string } | { type: 'search'; query: string }

export type AssistantEvent =
  | { type: 'delta'; text: string }
  | { type: 'reset' }
  | {
      type: 'done'
      text: string
      citations: AssistantCitation[]
      requestId: string
      latencyMs: number
      actions?: AssistantAction[]
      toolCalls?: number
      providerRounds?: number
    }
  | { type: 'error'; requestId: string }

export const ASSISTANT_CONTENT_TYPE = 'application/x-ndjson'

export async function* readAssistantEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      if (buffer.length > 200_000) throw new Error('Assistant event exceeds limit')
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.trim()) yield JSON.parse(line) as AssistantEvent
      }
    }
    buffer += decoder.decode()
    if (buffer.trim()) yield JSON.parse(buffer) as AssistantEvent
  } finally {
    try {
      await reader.cancel()
    } catch {
      // The request may already be aborted.
    } finally {
      reader.releaseLock()
    }
  }
}
