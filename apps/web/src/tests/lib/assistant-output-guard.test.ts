import { describe, expect, it } from 'vitest'

import { AssistantOutputGuard, containsAssistantControlText } from '@/lib/ai/assistant-output-guard'

const leaked =
  '<tool_call> <function=search_site> <parameter=query> blog articles </parameter> </function> </tool_call>'

describe('Assistant output boundary', () => {
  it('blocks the observed wire format at every possible chunk boundary', () => {
    for (let split = 0; split <= leaked.length; split += 1) {
      const guard = new AssistantOutputGuard()
      const text =
        guard.push(leaked.slice(0, split)) + guard.push(leaked.slice(split)) + guard.finish()
      expect(text).toBe('')
      expect(guard.blocked).toBe(true)
    }
  })

  it('does not leak a marker streamed character by character after normal prose', () => {
    const guard = new AssistantOutputGuard()
    const text =
      Array.from('One moment. ' + leaked, (part) => guard.push(part)).join('') + guard.finish()
    expect(text).toBe('One moment. ')
    expect(guard.blocked).toBe(true)
  })

  it.each([
    '<tool_ca',
    '<FUNCTION=search_site>',
    '</parameter>',
    '<tool_response>private',
    '<|tool_call',
    '[TOOL_CALLS]'
  ])('rejects malformed or reserved protocol text %s', (text) => {
    expect(containsAssistantControlText(text)).toBe(true)
  })

  it('preserves legitimate Markdown, HTML examples and comparisons', () => {
    const prose = 'Use [Docker](/blog/docker), <div>example</div> and x < 5.'
    const guard = new AssistantOutputGuard()
    expect(Array.from(prose, (part) => guard.push(part)).join('') + guard.finish()).toBe(prose)
    expect(guard.blocked).toBe(false)
  })
})
