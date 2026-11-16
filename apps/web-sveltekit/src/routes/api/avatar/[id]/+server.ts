import { avatarGet } from '@isyuricunha/trpc-server/server/avatar'

export const prerender = false

export async function GET({
  request,
  params
}: {
  request: Request
  params: { id: string }
}): Promise<Response> {
  return avatarGet(request, params)
}
