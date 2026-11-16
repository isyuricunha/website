import { getSession } from '../../lib/auth'
import { logger } from '../../lib/logger'
import { createPrivacyDataExport } from '../../lib/privacy/create-privacy-data-export'
import { rate_limit_keys } from '../../lib/rate-limit-keys'
import { ratelimit } from '../../lib/ratelimit'
import { getClientIp } from '../../lib/spam-detection'

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  Pragma: 'no-cache',
  'X-Content-Type-Options': 'nosniff'
}

export async function accountDataExportGet(request: Request): Promise<Response> {
  const session = await getSession(request.headers)

  if (!session?.user) {
    return Response.json(
      { error: 'Authentication required' },
      { status: 401, headers: privateHeaders }
    )
  }

  const ip = getClientIp(request.headers)
  const { success } = await ratelimit.limit(
    rate_limit_keys.privacy_data_export(session.user.id, ip)
  )

  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: privateHeaders }
    )
  }

  try {
    const document = await createPrivacyDataExport(session.user.id)
    const date = document.generatedAt.slice(0, 10)

    return new Response(JSON.stringify(document, null, 2), {
      status: 200,
      headers: {
        ...privateHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="yuricunha-data-${date}.json"`,
        'Content-Security-Policy': "default-src 'none'; sandbox"
      }
    })
  } catch (error) {
    logger.error('Failed to create privacy data export', error)
    return Response.json(
      { error: 'Unable to create data export' },
      { status: 500, headers: privateHeaders }
    )
  }
}
