import { runAlertsCron } from '@/lib/cron/alerts'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<Response> {
  return runAlertsCron(request.headers)
}
