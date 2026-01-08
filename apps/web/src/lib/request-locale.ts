import { i18n } from '@isyuricunha/i18n/config'

export type request_locale = 'en' | 'pt'

const normalize_locale = (value: string): request_locale | null => {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null

  const [base] = trimmed.split('-')
  if (!base) return null

  if (!i18n.locales.includes(base)) return null

  if (base === 'en' || base === 'pt') return base
  return null
}

const get_cookie_value = (cookie_header: string | null, name: string): string | null => {
  if (!cookie_header) return null

  const pairs = cookie_header.split(';')
  for (const pair of pairs) {
    const [raw_key, ...raw_value] = pair.split('=')
    const key = raw_key?.trim()
    if (!key) continue
    if (key !== name) continue

    const value = raw_value.join('=').trim()
    if (!value) return ''

    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  return null
}

const get_locale_from_referer = (referer: string | null): request_locale | null => {
  if (!referer) return null

  try {
    const url = new URL(referer)
    const first_segment = url.pathname.split('/').find(Boolean)
    if (!first_segment) return null

    return normalize_locale(first_segment)
  } catch {
    return null
  }
}

const get_locale_from_accept_language = (accept_language: string | null): request_locale | null => {
  if (!accept_language) return null

  const candidates = accept_language
    .split(',')
    .map((part) => part.split(';')[0]?.trim())
    .filter(Boolean) as string[]

  for (const candidate of candidates) {
    const normalized = normalize_locale(candidate)
    if (normalized) return normalized
  }

  return null
}

export const get_request_locale = (headers: Headers): request_locale => {
  const header_locale = normalize_locale(headers.get('x-locale') ?? '')
  if (header_locale) return header_locale

  const referer_locale = get_locale_from_referer(headers.get('referer'))
  if (referer_locale) return referer_locale

  const cookie_locale = normalize_locale(
    get_cookie_value(headers.get('cookie'), 'NEXT_LOCALE') ?? ''
  )
  if (cookie_locale) return cookie_locale

  const accept_language_locale = get_locale_from_accept_language(headers.get('accept-language'))
  if (accept_language_locale) return accept_language_locale

  return normalize_locale(i18n.defaultLocale) ?? 'en'
}
