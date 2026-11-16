import { describe, expect, it } from 'vitest'

import { DEFAULT_LOCALE, i18n, LOCALE_CODES, localeFromPathname } from '#lib/i18n/config.ts'
import { localeFromAcceptLanguage, localeFromCookie, negotiateLocale } from '#lib/i18n/locale.ts'

describe('locale config', () => {
  it('keeps the literal locale list in sync with the package config', () => {
    expect([...LOCALE_CODES]).toEqual(i18n.locales)
  })

  it('exposes en as the default locale', () => {
    expect(DEFAULT_LOCALE).toBe('en')
  })
})

describe('localeFromPathname', () => {
  it('reads an explicit locale prefix', () => {
    expect(localeFromPathname('/pt/blog')).toEqual({ locale: 'pt', unprefixed: '/blog' })
  })

  it('strips the default locale prefix when present', () => {
    expect(localeFromPathname('/en/blog')).toEqual({ locale: 'en', unprefixed: '/blog' })
  })

  it('uses the default locale for unprefixed paths', () => {
    expect(localeFromPathname('/blog')).toEqual({ locale: 'en', unprefixed: '/blog' })
    // The empty tail keeps redirects slash-free: / redirects to /pt, /pt/ was
    // the old double-slash bug.
    expect(localeFromPathname('/')).toEqual({ locale: 'en', unprefixed: '' })
  })

  it('does not treat other first segments as locales', () => {
    expect(localeFromPathname('/admin/users')).toEqual({
      locale: 'en',
      unprefixed: '/admin/users'
    })
  })
})

describe('locale negotiation', () => {
  it('prefers the NEXT_LOCALE cookie', () => {
    expect(negotiateLocale('NEXT_LOCALE=pt; other=1', 'de-DE,de;q=0.9')).toBe('pt')
  })

  it('ignores invalid cookie values', () => {
    expect(localeFromCookie('NEXT_LOCALE=xx')).toBeNull()
    expect(localeFromCookie(null)).toBeNull()
  })

  it('maps a full accept-language tag to a catalog locale', () => {
    expect(localeFromAcceptLanguage('pt-BR,pt;q=0.9')).toBe('pt')
    expect(localeFromAcceptLanguage('es-419')).toBe('es')
    expect(localeFromAcceptLanguage('ja-JP,ja;q=0.8,en;q=0.5')).toBe('ja')
  })

  it('maps Simplified Chinese variants to zh-CN', () => {
    expect(localeFromAcceptLanguage('zh-Hans-CN')).toBe('zh-CN')
    expect(localeFromAcceptLanguage('zh-CN,zh;q=0.9')).toBe('zh-CN')
  })

  it('does not guess for Traditional Chinese variants', () => {
    expect(localeFromAcceptLanguage('zh-Hant-TW')).toBeNull()
  })

  it('falls back to the default locale', () => {
    expect(negotiateLocale(null, null)).toBe('en')
  })
})
