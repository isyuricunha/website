import { newsletterUnsubscribePost } from '@isyuricunha/trpc-server/server/newsletter/unsubscribe'
import type { RequestHandler } from './$types'

export const prerender = false

export const POST: RequestHandler = async ({ request }) => newsletterUnsubscribePost(request)
