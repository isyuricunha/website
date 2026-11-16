import { runDataRetentionCron } from '@/lib/cron/data-retention'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<Response> {
  return runDataRetentionCron(request.headers)
}
