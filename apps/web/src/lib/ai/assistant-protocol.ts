import { z } from 'zod'

type AssistantCitation = {
  id: string
  title: string
  href: string
  excerpt?: string
  type: 'post' | 'project' | 'page' | 'snippet'
  publishedAt?: string
  updatedAt?: string
  repositoryHref?: string
}

export type AssistantAction =
  { type: 'navigate'; href: string; title: string } | { type: 'search'; query: string }

export type AssistantEvent =
  | { type: 'delta'; text: string }
  | { type: 'reset' }
  | { type: 'phase'; phase: 'searching' | 'reading' | 'responding' }
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

const citationSchema = z.object({
  id: z.string().max(500),
  title: z.string().max(1000),
  href: z.string().max(500),
  excerpt: z.string().max(6000).optional(),
  type: z.enum(['post', 'project', 'page', 'snippet']),
  publishedAt: z.string().max(100).optional(),
  updatedAt: z.string().max(100).optional(),
  repositoryHref: z.string().max(500).optional()
})
const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('navigate'), href: z.string().max(500), title: z.string().max(1000) }),
  z.object({ type: z.literal('search'), query: z.string().max(300) })
])
const eventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('delta'), text: z.string().max(60_000) }),
  z.object({ type: z.literal('reset') }),
  z.object({ type: z.literal('phase'), phase: z.enum(['searching', 'reading', 'responding']) }),
  z.object({
    type: z.literal('done'),
    text: z.string().max(60_000),
    citations: z.array(citationSchema).max(10),
    requestId: z.string().max(200),
    latencyMs: z.number().nonnegative(),
    actions: z.array(actionSchema).max(2).optional(),
    toolCalls: z.number().int().nonnegative().optional(),
    providerRounds: z.number().int().nonnegative().optional()
  }),
  z.object({ type: z.literal('error'), requestId: z.string().max(200) })
])

const parseEvent = (line: string): AssistantEvent => {
  if (line.length > 200_000) throw new Error('Assistant event exceeds limit')
  return eventSchema.parse(JSON.parse(line))
}

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
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      if (buffer.length > 200_000) throw new Error('Assistant event exceeds limit')
      for (const line of lines) {
        if (line.trim()) yield parseEvent(line)
      }
    }
    buffer += decoder.decode()
    if (buffer.trim()) yield parseEvent(buffer)
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
