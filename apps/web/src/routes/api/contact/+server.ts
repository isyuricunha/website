import { contactPost } from '@isyuricunha/trpc-server/server/contact'
import type { RequestHandler } from './$types'

export const prerender = false

export const POST: RequestHandler = async ({ request }) => contactPost(request)
