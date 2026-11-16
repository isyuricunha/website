import { aiChat } from '@/lib/ai/chat'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  return aiChat(request)
}
