import { adminPostsPost } from '@isyuricunha/trpc-server/server/admin/posts'
import { adminPostsPut } from '@isyuricunha/trpc-server/server/admin/posts'
import { adminPostsDelete } from '@isyuricunha/trpc-server/server/admin/posts'
import type { RequestHandler } from './$types'

export const prerender = false

export const POST: RequestHandler = async ({ request }) => adminPostsPost(request)
export const PUT: RequestHandler = async ({ request }) => adminPostsPut(request)
export const DELETE: RequestHandler = async ({ request }) => adminPostsDelete(request)
