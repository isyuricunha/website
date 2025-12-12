import { type NextRequest } from 'next/server'

import { POST as ai_chat_post } from '../../ai/chat/route'

export async function POST(req: NextRequest) {
  return ai_chat_post(req)
}
