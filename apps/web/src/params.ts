import { defineParams } from '@sveltejs/kit/params'
import { isLocale } from '#lib/i18n/config.ts'

export const params = defineParams({
  // Matches only the locale codes the site actually serves; the optional
  // [[lang=locale]] segment uses this so foreign path segments fall through
  // to the 404 route instead of being read as a locale.
  locale: (param: string) => {
    if (!isLocale(param)) {
      return
    }

    return param
  }
})
