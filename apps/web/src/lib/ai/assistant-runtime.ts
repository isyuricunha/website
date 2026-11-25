import { z } from 'zod'

import { type AssistantAction, type AssistantEvent } from './assistant-protocol'
import { executeSiteTool, siteTools } from './assistant-tools'
import {
  build_mascot_openai_messages,
  is_simple_social_message,
  type MascotSiteContext
} from './mascot-context'
import { type AiRuntimeConfig } from './runtime-config'
import { type Citation } from './site-index'

const MAX_ROUNDS = 3
const MAX_TOOLS = 4
const MAX_OUTPUT = 1800

const optionalString = z.string().nullable().optional()
const nullableString = z.string().nullable().optional()
const functionDelta = z.object({ name: optionalString, arguments: optionalString })
const callDelta = z.object({
  index: z.number().int().min(0).max(15),
  id: optionalString,
  function: functionDelta.nullable().optional()
})
const streamDelta = z.object({
  content: nullableString,
  tool_calls: z.array(callDelta).nullable().optional()
})
const streamChoice = z.object({
  delta: streamDelta.nullable().optional(),
  finish_reason: nullableString
})
const tokenCount = z.number().optional()
const usageSchema = z.object({ prompt_tokens: tokenCount, completion_tokens: tokenCount })
const deltaSchema = z.object({
  error: z.unknown().optional(),
  choices: z.array(streamChoice).optional(),
  usage: usageSchema.nullable().optional()
})

type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } }
type ProviderMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string }

type Usage = { input: number; output: number; reported: boolean }
type RunOptions = {
  config: AiRuntimeConfig
  context: MascotSiteContext
  message: string
  requestId: string
  signal: AbortSignal
  emit: (event: AssistantEvent) => void
}

class ToolSupportError extends Error {}

async function readRound(
  config: AiRuntimeConfig,
  messages: ProviderMessage[],
  tools: boolean,
  exposeTools: boolean,
  signal: AbortSignal,
  emit: RunOptions['emit']
) {
  const response = await fetch(`${config.endpoint}/chat/completions`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'text/event-stream',
      authorization: `Bearer ${config.apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.4,
      max_tokens: MAX_OUTPUT,
      stream: true,
      ...(exposeTools && { tools: siteTools, tool_choice: tools ? 'auto' : 'none' })
    }),
    signal
  })
  if (!response.ok) {
    if (tools && [400, 422, 501].includes(response.status)) {
      const detail = (await response.text()).slice(0, 2000)
      if (
        /tool|function.call/i.test(detail) &&
        /not.support|unsupported|not.implemented/i.test(detail)
      )
        throw new ToolSupportError('Provider does not support tools')
    }
    try {
      await response.body?.cancel()
    } catch {
      // An already closed response has no remaining data.
    }
    throw new Error(`Assistant provider returned HTTP ${response.status}`)
  }
  if (!response.body) throw new Error('Assistant provider returned no stream')
  if (!response.headers.get('content-type')?.includes('text/event-stream')) {
    await response.body.cancel()
    throw new Error('Unexpected assistant provider response format')
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  const calls = new Map<number, ToolCall>()
  let text = ''
  let buffer = ''
  let complete = false
  let finishReason: string | undefined
  let usage: Usage = { input: 0, output: 0, reported: false }
  const consume = (line: string) => {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return
    const value = trimmed.slice(5).trim()
    if (value === '[DONE]') {
      complete = true
      return
    }
    if (!value) return
    const payload = deltaSchema.safeParse(JSON.parse(value))
    if (!payload.success) throw new Error('Invalid assistant stream event')
    const data = payload.data
    if (data.error) throw new Error('Assistant provider returned a stream error')
    if (
      data.usage &&
      typeof data.usage.prompt_tokens === 'number' &&
      typeof data.usage.completion_tokens === 'number'
    ) {
      usage = {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens,
        reported: true
      }
    }
    const choice = data.choices?.[0]
    if (choice?.finish_reason) finishReason = choice.finish_reason
    if (choice?.delta?.content) {
      text += choice.delta.content
      if (text.length > 60_000) throw new Error('Assistant response exceeds limit')
      if (calls.size === 0) emit({ type: 'delta', text: choice.delta.content })
    }
    const fragments = choice?.delta?.tool_calls ?? []
    for (const part of fragments) {
      const call = calls.get(part.index) ?? {
        id: '',
        type: 'function',
        function: { name: '', arguments: '' }
      }
      if (part.id) call.id += part.id
      if (part.function?.name) call.function.name += part.function.name
      if (part.function?.arguments) call.function.arguments += part.function.arguments
      if (
        call.function.arguments.length > 4000 ||
        call.function.name.length > 100 ||
        call.id.length > 200
      )
        throw new Error('Invalid tool call size')
      calls.set(part.index, call)
    }
  }
  try {
    while (!complete) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += value
      if (buffer.length > 200_000) throw new Error('Assistant stream event exceeds limit')
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) consume(line)
    }
    if (buffer.trim()) consume(buffer)
  } finally {
    try {
      await reader.cancel()
    } catch {
      // The request may already be aborted.
    } finally {
      reader.releaseLock()
    }
  }
  if (!finishReason && !complete) throw new Error('Incomplete assistant response')
  if (finishReason === 'content_filter' || finishReason === 'error')
    throw new Error('Assistant provider stopped the response')
  if (finishReason === 'tool_calls' && calls.size === 0) throw new Error('Missing tool calls')
  if (finishReason === 'length' && calls.size > 0) throw new Error('Incomplete tool arguments')
  const toolCalls = [...calls].toSorted(([a], [b]) => a - b).map(([, call]) => call)
  if (
    toolCalls.some((call) => !call.id || !call.function.name) ||
    new Set(toolCalls.map((call) => call.id)).size !== toolCalls.length
  )
    throw new Error('Invalid tool call identifiers')
  return { text, toolCalls, usage }
}

export const runSiteAssistant = async (options: RunOptions) => {
  const { config, context, message, requestId, emit } = options
  const signal = AbortSignal.any([options.signal, AbortSignal.timeout(45_000)])
  const start = Date.now()
  const messages: ProviderMessage[] = build_mascot_openai_messages(context, message)
  const citations = new Map<string, Citation>(
    (context.citations ?? []).map((item) => [item.href, item])
  )
  const usage: Usage = { input: 0, output: 0, reported: true }
  const actions: AssistantAction[] = []
  const toolCache = new Map<string, ReturnType<typeof executeSiteTool>>()
  let toolCount = 0
  let executedTools = 0
  let rounds = 0
  let toolsEnabled = !is_simple_social_message(message)
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    if (round === 0) emit({ type: 'phase', phase: 'responding' })
    const allowTools = toolsEnabled && round < MAX_ROUNDS - 1 && toolCount < MAX_TOOLS
    let result
    try {
      result = await readRound(config, messages, allowTools, toolsEnabled, signal, emit)
    } catch (error) {
      if (round !== 0 || !(error instanceof ToolSupportError)) throw error
      toolsEnabled = false
      emit({ type: 'reset' })
      result = await readRound(config, messages, false, false, signal, emit)
    }
    rounds += 1
    usage.input += result.usage.input
    usage.output += result.usage.output
    usage.reported &&= result.usage.reported
    if (result.toolCalls.length === 0) {
      if (!result.text.trim()) throw new Error('Empty assistant response')
      const sources = Array.from(citations.values())
      const hrefs = new Set(
        Array.from(result.text.matchAll(/\]\(<?([^\s)>]+)>?\)/g), (match) => match[1])
      )
      const linked = sources.filter((source) => hrefs.has(source.href))
      const titled = sources.filter((source) =>
        result.text.toLowerCase().includes(source.title.toLowerCase())
      )
      const relevant = linked.length > 0 ? linked : titled
      emit({
        type: 'done',
        text: result.text,
        citations: relevant.slice(0, 6),
        requestId,
        latencyMs: Date.now() - start,
        actions: actions.slice(0, 2),
        toolCalls: executedTools,
        providerRounds: rounds
      })
      return { usage, rounds, toolCount: executedTools, model: config.model }
    }
    if (!allowTools || !toolsEnabled || toolCount + result.toolCalls.length > MAX_TOOLS)
      throw new Error('Assistant tool budget exceeded')
    emit({ type: 'reset' })
    messages.push({ role: 'assistant', content: result.text || null, tool_calls: result.toolCalls })
    const reading = result.toolCalls.some((call) =>
      ['read_site_content', 'get_current_page'].includes(call.function.name)
    )
    emit({ type: 'phase', phase: reading ? 'reading' : 'searching' })
    for (const call of result.toolCalls) {
      signal.throwIfAborted()
      let normalized = call.function.arguments
      try {
        const args = JSON.parse(normalized) as unknown
        if (args && typeof args === 'object' && !Array.isArray(args)) {
          normalized = JSON.stringify(
            Object.fromEntries(
              Object.entries(args).toSorted(([left], [right]) => left.localeCompare(right))
            )
          )
        }
      } catch {
        // Invalid arguments still receive a tool error, not a crash.
      }
      const key = call.function.name + ':' + normalized
      let output = toolCache.get(key)
      if (!output) {
        output = executeSiteTool(call.function.name, call.function.arguments, {
          locale: context.locale,
          pagePath: context.pagePath,
          history: context.conversation
        })
        toolCache.set(key, output)
        executedTools += 1
        if (output.action && actions.length < 2) actions.push(output.action)
      }
      for (const citation of output.citations) citations.set(citation.href, citation)
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(output.result) })
      toolCount += 1
    }
  }
  throw new Error('Assistant response budget exceeded')
}
