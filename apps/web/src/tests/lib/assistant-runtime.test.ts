import { afterEach, describe, expect, it, vi } from 'vitest'

import { type AssistantEvent, readAssistantEvents } from '@/lib/ai/assistant-protocol'
import { runSiteAssistant } from '@/lib/ai/assistant-runtime'
import { executeSiteTool } from '@/lib/ai/assistant-tools'

vi.mock('@/lib/ai/site-index', () => ({
  find_citations: vi.fn(() => [
    { id: 'post:docker', title: 'Docker', href: '/blog/docker', type: 'post' }
  ]),
  get_site_overview: vi.fn(() => []),
  read_site_content: vi.fn(() => null)
}))

const config = {
  endpoint: 'https://example.invalid/v1',
  model: 'test',
  apiKey: 'test',
  source: 'database' as const
}
const context = { currentPage: 'home', locale: 'en' }
const sse = (...events: unknown[]) =>
  new Response(
    events.map((event) => 'data: ' + JSON.stringify(event) + '\n\n').join('') + 'data: [DONE]\n\n',
    { headers: { 'Content-Type': 'text/event-stream' } }
  )
const chunk = (delta: unknown, finish_reason?: string) => ({ choices: [{ delta, finish_reason }] })

describe('Nery assistant protocol', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('handles fragmented tool calls and returns sources with the final streamed text', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        sse(
          chunk({
            tool_calls: [
              { index: 0, id: 'call_1', function: { name: 'search_site', arguments: '{"query":' } }
            ]
          }),
          chunk({ tool_calls: [{ index: 0, function: { arguments: '"Docker"}' } }] }, 'tool_calls')
        )
      )
      .mockResolvedValueOnce(
        sse(chunk({ content: 'Read ' }), chunk({ content: '[Docker](/blog/docker).' }, 'stop'), {
          choices: [],
          usage: { prompt_tokens: 100, completion_tokens: 10 }
        })
      )
    vi.stubGlobal('fetch', fetchMock)
    const events: AssistantEvent[] = []
    const result = await runSiteAssistant({
      config,
      context,
      message: 'Find Docker',
      requestId: 'qa',
      signal: new AbortController().signal,
      emit: (event) => {
        events.push(event)
      }
    })
    expect(result.toolCount).toBe(1)
    const second = JSON.parse(fetchMock.mock.calls[1]?.[1].body)
    expect(second.messages.at(-1)).toMatchObject({ role: 'tool', tool_call_id: 'call_1' })
    expect(events.at(-1)).toMatchObject({
      type: 'done',
      text: 'Read [Docker](/blog/docker).',
      requestId: 'qa',
      citations: [{ href: '/blog/docker' }]
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falls back only for explicit unsupported tool errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('tools are not supported', { status: 400 }))
      .mockResolvedValueOnce(sse(chunk({ content: 'Hello' }, 'stop')))
    vi.stubGlobal('fetch', fetchMock)
    const events: AssistantEvent[] = []
    await runSiteAssistant({
      config,
      context,
      message: 'Find public content about Docker',
      requestId: 'qa',
      signal: new AbortController().signal,
      emit: (event) => {
        events.push(event)
      }
    })
    expect(JSON.parse(fetchMock.mock.calls[1]?.[1].body)).not.toHaveProperty('tools')
    expect(events.at(-1)).toMatchObject({ type: 'done', text: 'Hello' })
  })

  it('does not send tool definitions for simple greetings', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sse(chunk({ content: 'Olá!' }, 'stop')))
    vi.stubGlobal('fetch', fetchMock)
    await runSiteAssistant({
      config,
      context,
      message: 'Olá!',
      requestId: 'qa',
      signal: new AbortController().signal,
      emit: vi.fn()
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1].body)).not.toHaveProperty('tools')
  })

  it('propagates cancellation to an in-flight upstream request', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Cancelled', 'AbortError')),
            { once: true }
          )
        })
    )
    vi.stubGlobal('fetch', fetchMock)
    const events: AssistantEvent[] = []
    const promise = runSiteAssistant({
      config,
      context,
      message: 'Find Docker',
      requestId: 'qa',
      signal: controller.signal,
      emit: (event) => {
        events.push(event)
      }
    })
    controller.abort()
    await expect(promise).rejects.toThrow()
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true)
    expect(events.some((event) => event.type === 'done')).toBe(false)
  })

  it('rejects arbitrary tool names and malformed arguments', () => {
    expect(executeSiteTool('shell', '{}', context).result).toEqual({ error: 'Unknown tool.' })
    expect(executeSiteTool('search_site', '{"query":""}', context).result).toMatchObject({
      error: expect.any(String)
    })
  })

  it('reuses identical tool results while satisfying every provider call id', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        sse(
          chunk(
            {
              tool_calls: [
                {
                  index: 0,
                  id: 'a',
                  function: { name: 'search_site', arguments: '{"query":"Docker"}' }
                },
                {
                  index: 1,
                  id: 'b',
                  function: { name: 'search_site', arguments: '{ "query": "Docker" }' }
                }
              ]
            },
            'tool_calls'
          )
        )
      )
      .mockResolvedValueOnce(sse(chunk({ content: '[Docker](/blog/docker)' }, 'stop')))
    vi.stubGlobal('fetch', fetchMock)
    const result = await runSiteAssistant({
      config,
      context,
      message: 'Docker',
      requestId: 'qa',
      signal: new AbortController().signal,
      emit: vi.fn()
    })
    expect(result.toolCount).toBe(1)
    const second = JSON.parse(fetchMock.mock.calls[1]?.[1].body)
    expect(second.messages.slice(-2)).toEqual([
      expect.objectContaining({ role: 'tool', tool_call_id: 'a' }),
      expect.objectContaining({ role: 'tool', tool_call_id: 'b' })
    ])
  })

  it('does not turn upstream error envelopes into successful responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(sse({ error: { message: 'private provider error' } }))
    )
    const events: AssistantEvent[] = []
    await expect(
      runSiteAssistant({
        config,
        context,
        message: 'Hello',
        requestId: 'qa',
        signal: new AbortController().signal,
        emit: (event) => {
          events.push(event)
        }
      })
    ).rejects.toThrow('stream error')
    expect(events.some((event) => event.type === 'done')).toBe(false)
  })

  it('rejects malformed NDJSON events and releases the reader', async () => {
    const body = new Response('{"type":"done","text":42}\n').body!
    const reader = readAssistantEvents(body)
    await expect(reader.next()).rejects.toThrow()
    expect(body.locked).toBe(false)
  })

  it('decodes split UTF-8 and NDJSON events', async () => {
    const expected = [
      { type: 'delta', text: 'Olá 日本語' },
      { type: 'done', text: 'Olá 日本語', citations: [], requestId: 'qa', latencyMs: 1 }
    ]
    const bytes = new TextEncoder().encode(
      expected.map((event) => JSON.stringify(event)).join('\n') + '\n'
    )
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of bytes) controller.enqueue(Uint8Array.of(byte))
        controller.close()
      }
    })
    const actual: unknown[] = []
    for await (const event of readAssistantEvents(body)) {
      actual.push(event)
      expect(event).toHaveProperty('type')
    }
    expect(actual).toEqual(expected)
  })
})
