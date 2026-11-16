import { newsletterSubscribePost } from '@/lib/newsletter/subscribe'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  return newsletterSubscribePost(request)
}
