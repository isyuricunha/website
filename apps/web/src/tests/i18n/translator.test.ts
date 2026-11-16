import { describe, expect, it } from 'vitest'

import { loadMessages } from '#lib/i18n/catalog.ts'
import { createTranslator } from '#lib/i18n/translator.ts'

describe('createTranslator', () => {
  it('resolves nested keys', async () => {
    const messages = await loadMessages('en')
    const t = createTranslator('en', messages)

    expect(t('error.something-went-wrong')).toBe('Something went wrong!')
  })

  it('formats plural messages from the real catalog', async () => {
    const messages = await loadMessages('en')
    const t = createTranslator('en', messages)

    expect(t('common.likes', { count: 1 })).toBe('1 like')
    expect(t('common.likes', { count: 4 })).toBe('4 likes')
    expect(t('common.views', { count: 0 })).toBe('0 views')
  })

  it('falls back to English for missing keys in another locale', () => {
    const t = createTranslator(
      'pt',
      { common: { present: 'pt string' } } as never,
      { common: { present: 'en string', missing: 'en fallback' } } as never
    )

    expect(t('common.present')).toBe('pt string')
    expect(t('common.missing')).toBe('en fallback')
  })

  it('returns the key itself when nothing matches', () => {
    const t = createTranslator('pt', {} as never)
    expect(t('nope.nothing')).toBe('nope.nothing')
  })
})

describe('loadMessages', () => {
  it('loads every catalog without error', async () => {
    for (const locale of ['en', 'pt', 'es', 'ja', 'zh-CN', 'fr', 'de']) {
      const messages = await loadMessages(locale)
      expect(Object.keys(messages).length).toBeGreaterThan(5)
    }
  })
})
