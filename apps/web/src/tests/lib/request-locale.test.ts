import { describe, expect, it } from 'vitest'

import { get_request_locale } from '@/lib/request-locale'

describe('get_request_locale', () => {
  it('prefers x-locale header', () => {
    const headers = new Headers({ 'x-locale': 'pt' })
    expect(get_request_locale(headers)).toBe('pt')
  })

  it('uses referer path locale when x-locale is missing', () => {
    const headers = new Headers({ referer: 'https://yuricunha.com/pt/blog/hello' })
    expect(get_request_locale(headers)).toBe('pt')
  })

  it('uses NEXT_LOCALE cookie when header/referer are missing', () => {
    const headers = new Headers({ cookie: 'foo=bar; NEXT_LOCALE=en; test=1' })
    expect(get_request_locale(headers)).toBe('en')
  })

  it('uses accept-language when other signals are missing', () => {
    const headers = new Headers({ 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' })
    expect(get_request_locale(headers)).toBe('pt')
  })

  it('falls back to default locale on invalid inputs', () => {
    const headers = new Headers({
      'x-locale': 'xx',
      referer: 'https://yuricunha.com/xx/page',
      cookie: 'NEXT_LOCALE=xx',
      'accept-language': 'xx'
    })

    expect(get_request_locale(headers)).toBe('en')
  })
})
