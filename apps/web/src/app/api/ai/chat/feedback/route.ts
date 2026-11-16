import { aiFeedbackPost } from '@/lib/ai/feedback'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  return aiFeedbackPost(request)
}
