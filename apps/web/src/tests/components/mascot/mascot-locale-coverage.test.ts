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
