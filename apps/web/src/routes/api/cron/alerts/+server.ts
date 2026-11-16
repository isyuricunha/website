import { runAlertsCron } from '@isyuricunha/trpc-server/server/cron/alerts'

export const prerender = false

export async function GET({ request }: { request: Request }): Promise<Response> {
  return runAlertsCron(request.headers)
}
