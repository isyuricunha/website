import { aiService } from '@isyuricunha/trpc-server/lib/ai/ai-service'

export const prerender = false

const PUBLIC_ASSISTANT_NAME = 'Yue AI'
const PUBLIC_ASSISTANT_DISPLAY_NAME = 'Yue Mizuki'

export async function GET(): Promise<Response> {
  const available = aiService.getAvailableProviders().length > 0

  return Response.json({
    available,
    status: available ? 'ready' : 'unavailable',
    assistant: PUBLIC_ASSISTANT_NAME,
    displayName: PUBLIC_ASSISTANT_DISPLAY_NAME,
    timestamp: new Date().toISOString()
  })
}
