import { newsletterConfirmGet } from '@/lib/newsletter/confirm'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<Response> {
  return newsletterConfirmGet(request)
}
