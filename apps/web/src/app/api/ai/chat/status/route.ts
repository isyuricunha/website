import { NextResponse } from 'next/server'

import { aiService } from '@/lib/ai/ai-service'
import { logger } from '@/lib/logger'

const PUBLIC_ASSISTANT_NAME = 'Nery AI'
const PUBLIC_ASSISTANT_DISPLAY_NAME = 'Nery Mizuki'

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
      assistant: PUBLIC_ASSISTANT_NAME,
      displayName: PUBLIC_ASSISTANT_DISPLAY_NAME,
      timestamp: new Date().toISOString()
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
