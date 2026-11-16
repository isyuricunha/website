import { newsletterUnsubscribePost } from '@/lib/newsletter/unsubscribe'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  return newsletterUnsubscribePost(request)
}
