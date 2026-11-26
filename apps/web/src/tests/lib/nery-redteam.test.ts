import { describe, expect, it, vi } from 'vitest'

import { executeSiteTool } from '@/lib/ai/assistant-tools'
import { AssistantOutputGuard } from '@/lib/ai/assistant-output-guard'
import { readAssistantEvents } from '@/lib/ai/assistant-protocol'
import { is_safe_internal_path } from '@/components/mascot/chat-link-policy'

vi.mock('content-collections', () => ({
  allPosts: [
    {
      locale: 'en',
      slug: 'hello',
      title: 'Hello',
      summary: 'Public article',
      content: 'Public content'
    }
  ],
  allProjects: [],
  allSnippets: [],
  allPages: []
}))

const deniedPaths = [
  '/admin',
  '/pt/admin/users',
  '/api/ai/chat',
  '/settings',
  '/account',
  '/en/notifications',
  '/blog/../admin',
  '/%61dmin',
  '/pt/blog/%2fadmin',
  '/blog/%2e%2e/admin',
  '//example.invalid',
  'https://example.invalid',
  'javascript:void(0)',
  '/\\example.invalid',
  '/blog/%00',
  '/blog/%5cadmin',
  '/blog/%252fadmin',
  '/blog/hello/extra',
  '/.env',
  '/api/private'
]

const invalidArguments = [
  ['shell', '{}'],
  ['execute_sql', '{}'],
  ['fetch_url', '{}'],
  ['send_email', '{}'],
  ['read_site_content', '{"href":"/","offset":-1}'],
  ['read_site_content', '{"href":"/","offset":100001}'],
  ['read_site_content', '{"href":"/","offset":0.5}'],
  ['read_site_content', '{"href":"/","offset":"1"}'],
  ['read_site_content', '{"href":"/","extra":true}'],
  ['read_site_content', '{"href":""}'],
  ['search_site', '{"query":""}'],
  ['search_site', '{"query":"   "}'],
  ['search_site', JSON.stringify({ query: 'x'.repeat(301) })],
  ['search_site', '{"query":123}'],
  ['search_site', '{"query":"Docker","admin":true}'],
  ['get_site_overview', '{"admin":true}'],
  ['get_current_page', '{"href":"/admin"}'],
  ['open_search', '{"query":"test","auto":true}'],
  ['navigate', 'not-json'],
  ['search_site', 'x'.repeat(4001)]
] as const

const controlMarkers = [
  '<tool_call>',
  '</tool_call>',
  '<tool_response>',
  '</tool_response>',
  '<tool_use>',
  '</tool_use>',
  '<function_call>',
  '</function_call>',
  '<function=search_site>',
  '</function>',
  '<parameter=query>',
  '</parameter>',
  '<|tool_call',
  '<|python_tag|>',
  '[TOOL_CALLS]'
]

const invalidEvents = [
  { type: 'unknown' },
  { type: 'delta', text: 42 },
  { type: 'phase', phase: 'admin' },
  { type: 'done', text: 'ok', citations: [], requestId: 'x', latencyMs: -1 },
  {
    type: 'done',
    text: 'ok',
    citations: [],
    requestId: 'x',
    latencyMs: 1,
    actions: [{ type: 'shell' }]
  },
  {
    type: 'done',
    text: 'ok',
    citations: [],
    requestId: 'x',
    latencyMs: 1,
    actions: Array.from({ length: 3 }, () => ({ type: 'search', query: 'test' }))
  },
  { type: 'delta', text: 'x'.repeat(60_001) },
  { type: 'error', requestId: 42 },
  { type: 'done', text: 'ok', citations: [], requestId: 'x', latencyMs: 1, providerRounds: -1 }
]

describe('Nery red-team deterministic boundaries', () => {
  it.each(deniedPaths)('denies private or malformed content read: %s', (href) => {
    expect(is_safe_internal_path(href)).toBe(false)
    const result = executeSiteTool('read_site_content', JSON.stringify({ href }), { locale: 'en' })
    expect(result.result).toHaveProperty('error')
    expect(result.citations).toEqual([])
    expect(result.action).toBeUndefined()
  })
  it.each(deniedPaths)('denies unsafe navigation proposal: %s', (href) => {
    const result = executeSiteTool('navigate', JSON.stringify({ href }), { locale: 'en' })
    expect(result.result).toHaveProperty('error')
    expect(result.action).toBeUndefined()
  })
  it.each(invalidArguments)('rejects invalid or unknown tool %s (%s)', (name, args) => {
    const result = executeSiteTool(name, args, { locale: 'en' })
    expect(result.result).toHaveProperty('error')
    expect(result.action).toBeUndefined()
    expect(result.citations).toEqual([])
  })
  it.each(controlMarkers)('blocks fragmented control marker %s', (marker) => {
    for (let split = 0; split <= marker.length; split += 1) {
      const guard = new AssistantOutputGuard()
      const output =
        guard.push(marker.slice(0, split)) + guard.push(marker.slice(split)) + guard.finish()
      expect(output).toBe('')
      expect(guard.blocked).toBe(true)
    }
  })
  it.each(invalidEvents)('rejects malformed client event %#', async (event) => {
    const body = new Response(JSON.stringify(event) + '\n').body!
    const reader = readAssistantEvents(body)
    await expect(reader.next()).rejects.toThrow()
    expect(body.locked).toBe(false)
  })
})
