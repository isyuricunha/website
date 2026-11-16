import { loadMessages } from './catalog.ts'
import { DEFAULT_LOCALE } from './config.ts'
import { createTranslator, type Translator } from './translator.ts'

/**
 * Server-only translator. Loads the locale catalog plus the English fallback
 * and caches both module-level, so repeated requests do not re-read JSON.
 */
export async function getServerTranslator(locale: string): Promise<Translator> {
  const [messages, fallback] = await Promise.all([
    loadMessages(locale),
    locale === DEFAULT_LOCALE ? Promise.resolve(undefined) : loadMessages(DEFAULT_LOCALE)
  ])

  return createTranslator(locale, messages, fallback)
}
