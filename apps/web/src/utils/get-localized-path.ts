import { i18n } from '@isyuricunha/i18n/config'

type LocalizedDocument = {
  slug: string
  locale: string
}

export const getLocalizedPath = (doc: LocalizedDocument) => {
  const locale = doc.locale

  const slug = doc.slug === '' ? '/' : doc.slug

  const localePath = locale === i18n.defaultLocale ? '' : `/${locale}`

  return `${localePath}${slug}`
}
