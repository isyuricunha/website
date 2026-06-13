import { NextResponse } from 'next/server'

import { aiService } from '@/lib/ai/ai-service'

const PUBLIC_ASSISTANT_NAME = 'Yue AI'
const PUBLIC_ASSISTANT_DISPLAY_NAME = 'Yue Mizuki'

export function GET() {
  const available = aiService.getAvailableProviders().length > 0

  return NextResponse.json({
    available,
    status: available ? 'ready' : 'unavailable',
    assistant: PUBLIC_ASSISTANT_NAME,
    displayName: PUBLIC_ASSISTANT_DISPLAY_NAME,
    timestamp: new Date().toISOString()
  })
}
