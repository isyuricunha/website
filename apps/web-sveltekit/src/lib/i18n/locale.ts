import { DEFAULT_LOCALE, isLocale } from './config'

/**
 * Locale negotiation mirroring the previous next-intl behavior:
 * an explicit cookie wins over Accept-Language, and the default locale is the
 * last resort. The cookie name matches next-intl's default so existing
 * visitor preferences keep working.
 */
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function localeFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null
  }

  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    const value = rest.join('=')

    if (name === LOCALE_COOKIE && isLocale(value)) {
      return value
    }
  }

  return null
}

function parseAcceptLanguage(header: string): Array<{ tag: string; quality: number }> {
  return header
    .split(',')
    .map((entry) => {
      const [tag, ...params] = entry.trim().split(';')
      let quality = 1

      for (const param of params) {
        const [key, value] = param.trim().split('=')

        if (key === 'q') {
          quality = Number(value) || 0
        }
      }

      return { tag, quality }
    })
    .sort((a, b) => b.quality - a.quality)
}

export function localeFromAcceptLanguage(header: string | null): string | null {
  if (!header) {
    return null
  }

  for (const { tag } of parseAcceptLanguage(header)) {
    if (isLocale(tag)) {
      return tag
    }

    const base = tag.split('-')[0].toLowerCase()

    if (isLocale(base)) {
      return base
    }

    // Simplified Chinese only: the catalog offers zh-CN, so traditional
    // variants fall through to the default locale instead of guessing.
    if (base === 'zh' && (/hans/i.test(tag) || /cn/i.test(tag))) {
      return 'zh-CN'
    }
  }

  return null
}

export function negotiateLocale(
  cookieHeader: string | null,
  acceptLanguage: string | null
): string {
  return (
    localeFromCookie(cookieHeader) ?? localeFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE
  )
}
