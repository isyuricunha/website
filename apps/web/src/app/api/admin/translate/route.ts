import { adminTranslatePost } from '@/lib/admin/translate'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  return adminTranslatePost(request)
}
