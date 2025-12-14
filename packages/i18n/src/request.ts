import { getRequestConfig } from 'next-intl/server'

import { i18n } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !i18n.locales.includes(locale)) {
    locale = i18n.defaultLocale
  }

  const messages_by_locale = {
    en: (await import('./messages/en.json')).default,
    pt: (await import('./messages/pt.json')).default
  } as const

  return {
    messages: {
      ...messages_by_locale[locale as keyof typeof messages_by_locale]
    },
    locale
  }
})
