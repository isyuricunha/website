import { aiFeedbackPost } from '@isyuricunha/trpc-server/server/ai/feedback'
import type { RequestHandler } from './$types'

export const prerender = false

export const POST: RequestHandler = async ({ request }) => aiFeedbackPost(request)
