import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { createPrivacyDataExport } from '@/lib/privacy/create-privacy-data-export'
import { rate_limit_keys } from '@/lib/rate-limit-keys'
import { ratelimit } from '@/lib/ratelimit'
import { getClientIp } from '@/lib/spam-detection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  Pragma: 'no-cache',
  'X-Content-Type-Options': 'nosniff'
}

export const GET = async (request: Request) => {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401, headers: privateHeaders }
    )
  }

  const ip = getClientIp(request.headers)
  const { success } = await ratelimit.limit(
    rate_limit_keys.privacy_data_export(session.user.id, ip)
  )

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: privateHeaders }
    )
  }

  try {
    const document = await createPrivacyDataExport(session.user.id)
    const date = document.generatedAt.slice(0, 10)

    return new NextResponse(JSON.stringify(document, null, 2), {
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
    return NextResponse.json(
      { error: 'Unable to create data export' },
      { status: 500, headers: privateHeaders }
    )
  }
}
