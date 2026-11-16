import { aiChat } from '@isyuricunha/trpc-server/server/ai/chat'

export const prerender = false

export async function POST({ request }: { request: Request }): Promise<Response> {
  return aiChat(request)
}
