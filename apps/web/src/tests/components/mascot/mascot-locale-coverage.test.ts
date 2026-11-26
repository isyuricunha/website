import { describe, expect, it } from 'vitest'

import { build_mascot_openai_messages, type MascotSiteContext } from '@/lib/ai/mascot-context'
import { i18n } from '@isyuricunha/i18n/config'

const baseContext = (locale: string): MascotSiteContext => ({
  currentPage: 'home',
  locale
})

const systemMessageFor = (locale: string): string => {
  const messages = build_mascot_openai_messages(baseContext(locale), 'test')
  return messages[0]?.content ?? ''
}

describe('mascot system message locale coverage', () => {
  it('carries an explicit respond-in-language instruction for every supported locale', () => {
    for (const locale of i18n.locales) {
      const message = systemMessageFor(locale)
      // The locale instruction block is the only place the response language is
      // declared; it must never be empty for a supported locale.
      expect(message, `locale ${locale}`).toMatch(
        /Respond in|Responda|Responde|Répondez|Antworten|请用|日本語で/
      )
    }
  })

  it('identifies the website assistant with the canonical Nery mascot', () => {
    for (const locale of i18n.locales) {
      expect(systemMessageFor(locale)).toContain('Nery Mizuki')
      expect(systemMessageFor(locale)).not.toMatch(/You are Yue/)
    }
  })

  it('defines the public profile consistently in every language without claiming model ownership', () => {
    for (const locale of i18n.locales) {
      const system = systemMessageFor(locale)
      expect(system).toContain('Nery Small 3.0')
      expect(system).toContain('nery-small-3-0')
      expect(system).toContain('Your model name is Nery Small 3.0')
      expect(system).toContain('do not use a fixed introduction or canned response')
      expect(system).toContain('never invent technical provenance or claim independent training')
    }
  })

  it('keeps editorial prompts independent of the public mascot identity', () => {
    const messages = build_mascot_openai_messages(
      { ...baseContext('en'), purpose: 'editorial' },
      'Summarize'
    )
    expect(messages[0]?.content).not.toContain('Nery Small 3.0')
  })

  it('sends the conversation as structured turns only, with the current question once', () => {
    const messages = build_mascot_openai_messages(
      {
        ...baseContext('en'),
        conversation: [
          { role: 'user', content: 'unique previous question' },
          { role: 'assistant', content: 'unique previous answer' }
        ]
      },
      'unique current question'
    )
    expect(messages.slice(1)).toEqual([
      { role: 'user', content: 'unique previous question' },
      { role: 'assistant', content: 'unique previous answer' },
      { role: 'user', content: 'unique current question' }
    ])
    expect(messages[0]?.content).not.toContain('unique previous')
    expect(messages[0]?.content).not.toContain('unique current')
  })

  it('does not replay previously leaked assistant control text', () => {
    const messages = build_mascot_openai_messages(
      {
        ...baseContext('en'),
        conversation: [
          { role: 'user', content: 'Find blog articles' },
          {
            role: 'assistant',
            content:
              '<tool_call><function=search_site><parameter=query>blog articles</parameter></function></tool_call>'
          },
          { role: 'user', content: 'Can you explain <tool_call> as a string?' }
        ]
      },
      'Try again'
    )
    expect(messages.slice(1)).toEqual([
      { role: 'user', content: 'Find blog articles' },
      { role: 'user', content: 'Can you explain <tool_call> as a string?' },
      { role: 'user', content: 'Try again' }
    ])
  })

  it('retains the newest bounded history and current user turn exactly once', () => {
    const previous = Array.from({ length: 30 }, (_, index) => ({
      role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: String(index).padStart(2, '0') + 'x'.repeat(2998)
    }))
    const messages = build_mascot_openai_messages(
      { ...baseContext('en'), conversation: previous },
      'new question'
    )
    const history = messages.slice(1, -1)
    expect(history.map((turn) => turn.content)).toEqual(
      previous.slice(-4).map((turn) => turn.content)
    )
    expect(messages.at(-1)).toEqual({ role: 'user', content: 'new question' })
  })

  it('preserves genuine repeated questions across distinct turns', () => {
    const messages = build_mascot_openai_messages(
      {
        ...baseContext('en'),
        conversation: [
          { role: 'user', content: 'same question' },
          { role: 'assistant', content: 'first answer' }
        ]
      },
      'same question'
    )
    expect(messages.slice(1)).toEqual([
      { role: 'user', content: 'same question' },
      { role: 'assistant', content: 'first answer' },
      { role: 'user', content: 'same question' }
    ])
  })

  it('resolves the zh-CN locale (canonical website casing) to Chinese instructions', () => {
    expect(systemMessageFor('zh-CN')).toContain('请用中文回答')
  })

  it('resolves ja to Japanese instructions', () => {
    expect(systemMessageFor('ja')).toContain('日本語で')
  })

  it('resolves es to Spanish instructions', () => {
    expect(systemMessageFor('es')).toContain('Responde en español')
  })
})
