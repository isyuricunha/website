import { aiContentGet, aiContentPost } from '@/lib/ai/content'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  return aiContentPost(request)
}

export async function GET(request: Request): Promise<Response> {
  return aiContentGet(request)
}
