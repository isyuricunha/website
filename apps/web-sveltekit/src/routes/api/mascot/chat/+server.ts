import { aiChat } from '@isyuricunha/trpc-server/server/ai/chat'

export const prerender = false
export const runtime = 'nodejs'

// The mascot chat delegates to the same AI chat handler as the Next app.
export async function POST({ request }: { request: Request }): Promise<Response> {
  return aiChat(request)
}
