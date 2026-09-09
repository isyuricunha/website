/**
 * Email locale registry and shared copy.
 *
 * Mirrors the website's supported locales (@isyuricunha/i18n/config). Every
 * template resolves its strings through `resolve_email_locale` + the per-
 * template copy dictionaries, so a new locale only needs to be added here.
 */

export const EMAIL_LOCALES = ['en', 'pt', 'es', 'ja', 'zh-CN', 'fr', 'de'] as const

export type EmailLocale = (typeof EMAIL_LOCALES)[number]

export const DEFAULT_EMAIL_LOCALE: EmailLocale = 'en'

const EMAIL_LOCALE_SET = new Set<string>(EMAIL_LOCALES)

/**
 * Normalizes any locale-ish string (BCP-47 tag, cookie value, query param) to
 * a supported email locale, falling back to the default. `zh-*` variants all
 * resolve to `zh-CN`; unknown or unsupported bases fall back to `en`.
 */
export const resolve_email_locale = (value: string | null | undefined): EmailLocale => {
  if (!value) return DEFAULT_EMAIL_LOCALE

  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_EMAIL_LOCALE

  if (EMAIL_LOCALE_SET.has(trimmed)) return trimmed as EmailLocale

  const [base] = trimmed.toLowerCase().split('-')

  if (base === 'zh') return 'zh-CN'
  if (base && EMAIL_LOCALE_SET.has(base)) return base as EmailLocale

  return DEFAULT_EMAIL_LOCALE
}

/** Rendered as `<Html lang={...}>` — the full BCP-47 tag. */
export const EMAIL_LANG: Record<EmailLocale, string> = {
  en: 'en',
  pt: 'pt-BR',
  es: 'es',
  ja: 'ja',
  'zh-CN': 'zh-CN',
  fr: 'fr',
  de: 'de'
}

export const EMAIL_GREETINGS: Record<EmailLocale, (name: string) => string> = {
  en: (name) => `Hi ${name},`,
  pt: (name) => `Olá ${name},`,
  es: (name) => `Hola ${name},`,
  ja: (name) => `${name} さん、`,
  'zh-CN': (name) => `${name}，您好！`,
  fr: (name) => `Bonjour ${name},`,
  de: (name) => `Hallo ${name},`
}

export const greeting_for = (locale: EmailLocale, name: string): string =>
  (EMAIL_GREETINGS[locale] ?? EMAIL_GREETINGS[DEFAULT_EMAIL_LOCALE])(name)
