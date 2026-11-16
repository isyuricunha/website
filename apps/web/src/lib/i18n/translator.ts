import { DEFAULT_LOCALE } from './config'
import { formatMessage, type MessageVariables } from './format'
import type { Messages } from './catalog'

export type Translator = (key: string, variables?: MessageVariables) => string

function flatten(
  messages: unknown,
  prefix = '',
  output: Record<string, string> = {}
): Record<string, string> {
  for (const [key, value] of Object.entries(messages as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object') {
      flatten(value, path, output)
    } else if (typeof value === 'string') {
      output[path] = value
    }
  }

  return output
}

/**
 * Builds a translator for one locale. When the locale is not the default, an
 * English fallback fills keys that a catalog has not translated yet.
 */
export function createTranslator(
  locale: string,
  messages: Messages,
  fallbackMessages?: Messages
): Translator {
  const flat = flatten(messages)
  const flatFallback =
    fallbackMessages && locale !== DEFAULT_LOCALE ? flatten(fallbackMessages) : null

  return (key, variables) => {
    const pattern = flat[key] ?? flatFallback?.[key] ?? key
    return formatMessage(pattern, variables, locale)
  }
}
