import { accountDataExportGet } from '@isyuricunha/trpc-server/server/account/data-export'
import type { RequestHandler } from './$types'

export const prerender = false

export const GET: RequestHandler = async ({ request }) => accountDataExportGet(request)
