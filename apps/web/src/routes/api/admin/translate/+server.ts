import { adminTranslatePost } from '@isyuricunha/trpc-server/server/admin/translate'
import type { RequestHandler } from './$types'

export const prerender = false

export const POST: RequestHandler = async ({ request }) => adminTranslatePost(request)
