import { describe, expect, it } from 'vitest'

import { formatMessage } from '#lib/i18n/format.ts'

describe('formatMessage', () => {
  it('replaces simple placeholders', () => {
    expect(formatMessage('Hello {name}!', { name: 'Yuri' }, 'en')).toBe('Hello Yuri!')
  })

  it('keeps the raw pattern when no variables are given', () => {
    expect(formatMessage('Hello {name}!', undefined, 'en')).toBe('Hello {name}!')
  })

  it('keeps the raw placeholder when the variable is missing', () => {
    expect(formatMessage('Hello {name}!', {}, 'en')).toBe('Hello {name}!')
  })

  it('leaves text without variables untouched', () => {
    expect(formatMessage("Don't panic.", undefined, 'en')).toBe("Don't panic.")
  })

  it('selects the exact =1 plural branch', () => {
    expect(formatMessage('{count, plural, =1 {# like} other {# likes}}', { count: 1 }, 'en')).toBe(
      '1 like'
    )
  })

  it('selects the exact =0 plural branch', () => {
    expect(
      formatMessage(
        '{count, plural, =0 {0 results} =1 {1 result} other {# results}}',
        { count: 0 },
        'en'
      )
    ).toBe('0 results')
  })

  it('selects the other plural branch', () => {
    expect(formatMessage('{count, plural, =1 {# like} other {# likes}}', { count: 3 }, 'en')).toBe(
      '3 likes'
    )
  })

  it('uses the locale plural rules', () => {
    // In Portuguese only 1 is singular; ICU inserts the count only where `#`
    // appears in the branch text.
    expect(
      formatMessage('{count, plural, one {# comentário} other {# comentários}}', { count: 2 }, 'pt')
    ).toBe('2 comentários')
    expect(
      formatMessage('{count, plural, one {# comentário} other {# comentários}}', { count: 1 }, 'pt')
    ).toBe('1 comentário')
    expect(
      formatMessage('{count, plural, =1 {comentário} other {comentários}}', { count: 2 }, 'pt')
    ).toBe('comentários')
  })

  it('keeps the raw pattern for a plural selector with a missing variable', () => {
    expect(formatMessage('{count, plural, =1 {# like} other {# likes}}', undefined, 'en')).toBe(
      '{count, plural, =1 {# like} other {# likes}}'
    )
  })
})
