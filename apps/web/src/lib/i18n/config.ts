import { i18n } from '@isyuricunha/i18n/config'

export { i18n } from '@isyuricunha/i18n/config'

/**
Literal locale codes. `i18n.locales` widens to `string[]` because it is
built with `Array.map`, so the literal union is declared here and a unit
test keeps it in sync with the package config.
*/
const LOCALE_CODES = ['en', 'pt', 'es', 'ja', 'zh-CN', 'fr', 'de'] as const

export { LOCALE_CODES }

export type Locale = (typeof LOCALE_CODES)[number]

export const DEFAULT_LOCALE = i18n.defaultLocale as Locale

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (LOCALE_CODES as readonly string[]).includes(value)
}

/**
Extract the locale from a request pathname. With `localePrefix: 'as-needed'`
the default locale has no prefix and every other locale is the first path
segment.
*/
export function localeFromPathname(pathname: string): { locale: Locale; unprefixed: string } {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length > 0 && isLocale(segments[0])) {
    return {
      locale: segments[0],
      unprefixed: `/${segments.slice(1).join('/')}`.replace(/\/$/, '') || '/'
    }
  }

  return { locale: DEFAULT_LOCALE, unprefixed: pathname === '/' ? '' : pathname }
}
