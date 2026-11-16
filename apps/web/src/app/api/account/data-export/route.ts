import { accountDataExportGet } from '@/lib/account/data-export'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<Response> {
  return accountDataExportGet(request)
}
