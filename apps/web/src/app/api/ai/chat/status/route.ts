import { NextResponse } from 'next/server'

import { aiService } from '@/lib/ai/ai-service'
import { logger } from '@/lib/logger'

import { NERY_IDENTITY } from '@/lib/ai/nery-identity'

export const dynamic = 'force-dynamic'

export async function GET() {
  let available = false
  try {
    available = (await aiService.getAvailableProviders()).length > 0
  } catch {
    logger.warn('AI runtime configuration could not be checked')
  }

  return NextResponse.json(
    {
      available,
      status: available ? 'ready' : 'unavailable',
      assistant: NERY_IDENTITY.assistant,
      displayName: NERY_IDENTITY.name,
      profile: NERY_IDENTITY.profile,
      profileId: NERY_IDENTITY.profileId,
      timestamp: new Date().toISOString()
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
