import { describe, expect, it } from 'vitest'

import { is_placeholder_secret } from '@/lib/secrets'

describe('is_placeholder_secret', () => {
  it('flags the documented change-me placeholders', () => {
    expect(is_placeholder_secret('change-me-to-a-random-string-with-at-least-16-chars')).toBe(true)
    expect(is_placeholder_secret('change-me-to-a-random-string')).toBe(true)
    expect(is_placeholder_secret('  CHANGE-ME-SECRET  ')).toBe(true)
  })

  it('treats missing/blank values as unusable', () => {
    expect(is_placeholder_secret(null)).toBe(true)
    expect(is_placeholder_secret(undefined)).toBe(true)
    expect(is_placeholder_secret('')).toBe(true)
    expect(is_placeholder_secret(' '.repeat(3))).toBe(true)
  })

  it('accepts real secrets', () => {
    expect(is_placeholder_secret('0123456789abcdef')).toBe(false)
    expect(is_placeholder_secret('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6')).toBe(false)
  })
})
