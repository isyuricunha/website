import type { RequestHandler } from './$types'

export const prerender = false

// Legacy dynamic OG URL kept from the Next app: redirect to the static card.
export const GET: RequestHandler = async ({ url }) => {
  const target = new URL('/images/og.png', url)
  return new Response(null, { status: 308, headers: { location: target.toString() } })
}
