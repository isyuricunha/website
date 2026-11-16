import { newsletterSubscribePost } from '@isyuricunha/trpc-server/server/newsletter/subscribe'
import type { RequestHandler } from './$types'

export const prerender = false

export const POST: RequestHandler = async ({ request }) => newsletterSubscribePost(request)
