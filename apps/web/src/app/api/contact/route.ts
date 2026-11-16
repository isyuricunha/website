import { contactPost } from '@/lib/contact'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  return contactPost(request)
}
