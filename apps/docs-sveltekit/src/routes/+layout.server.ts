import { SITE_NAME } from '#lib/site.ts'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ url }) => {
  return {
    pathname: url.pathname,
    title: SITE_NAME
  }
}
