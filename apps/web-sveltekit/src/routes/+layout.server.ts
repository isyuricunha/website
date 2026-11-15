import type { LayoutServerLoad } from './$types'

// Locale negotiation lives in hooks.server.ts; this load only surfaces the
// resolved locale to the layout and every page under it.
export const load: LayoutServerLoad = async ({ locals }) => {
  return { locale: locals.locale }
}
