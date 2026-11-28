import type en from '@isyuricunha/i18n/messages/en.json'

import { DEFAULT_LOCALE } from './config'

export type Messages = typeof en

// One lazy loader per locale. Vite code-splits each JSON file into its own
// chunk, so a request only ever loads the catalog of the requested locale.
const catalogs: Record<string, () => Promise<{ default: Messages }>> = {
  en: () => import('@isyuricunha/i18n/messages/en.json'),
  pt: () => import('@isyuricunha/i18n/messages/pt.json'),
  es: () => import('@isyuricunha/i18n/messages/es.json'),
  ja: () => import('@isyuricunha/i18n/messages/ja.json'),
  'zh-CN': () => import('@isyuricunha/i18n/messages/zh-CN.json'),
  fr: () => import('@isyuricunha/i18n/messages/fr.json'),
  de: () => import('@isyuricunha/i18n/messages/de.json')
}

const loaded = new Map<string, Messages>()

export async function loadMessages(locale: string): Promise<Messages> {
  const cached = loaded.get(locale)

  if (cached) {
    return cached
  }

  const loader = catalogs[locale] ?? catalogs[DEFAULT_LOCALE]
  const messages = (await loader()).default
  loaded.set(locale, messages)

  return messages
}
