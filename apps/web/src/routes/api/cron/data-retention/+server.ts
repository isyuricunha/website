import { runDataRetentionCron } from '@isyuricunha/trpc-server/server/cron/data-retention'

export const prerender = false

export async function GET({ request }: { request: Request }): Promise<Response> {
  return runDataRetentionCron(request.headers)
}
