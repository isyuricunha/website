import { aiContentPost } from '@isyuricunha/trpc-server/server/ai/content'
import { aiContentGet } from '@isyuricunha/trpc-server/server/ai/content'
import type { RequestHandler } from './$types'

export const prerender = false

export const POST: RequestHandler = async ({ request }) => aiContentPost(request)
export const GET: RequestHandler = async ({ request }) => aiContentGet(request)
