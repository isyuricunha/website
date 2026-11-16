import { newsletterConfirmGet } from '@isyuricunha/trpc-server/server/newsletter/confirm'
import type { RequestHandler } from './$types'

export const prerender = false

export const GET: RequestHandler = async ({ request }) => newsletterConfirmGet(request)
