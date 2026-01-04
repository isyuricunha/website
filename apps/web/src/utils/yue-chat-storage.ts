import { z } from 'zod'

import { base64urlDecodeToString, base64urlEncode } from './base64url'

export type ChatMessage = {
  id: string
  text: string
  isUser: boolean
  timestamp: string
  isError?: boolean
  type?: 'text'
  requestId?: string
  latencyMs?: number
  citations?: Array<{
    id: string
    title: string
    href: string
    excerpt?: string
    type: 'post' | 'project' | 'page'
  }>
  reactions?: {
    likes: number
    dislikes: number
    userReaction?: 'like' | 'dislike' | null
  }
}

export type ChatConversation = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

const legacyMessagesSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      text: z.string(),
      isUser: z.boolean(),
      timestamp: z.string(),
      isError: z.boolean().optional(),
      type: z.literal('text').optional(),
      requestId: z.string().optional(),
      latencyMs: z.number().int().min(0).optional(),
      citations: z
        .array(
          z.object({
            id: z.string().min(1),
            title: z.string().min(1),
            href: z.string().min(1),
            excerpt: z.string().optional(),
            type: z.enum(['post', 'project', 'page'])
          })
        )
        .max(10)
        .optional(),
      reactions: z
        .object({
          likes: z.number().int().min(0),
          dislikes: z.number().int().min(0),
          userReaction: z.enum(['like', 'dislike']).nullable().optional()
        })
        .optional()
    })
  )
  .max(200)

const conversationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  messages: legacyMessagesSchema
})

const storageSchema = z.object({
  version: z.literal(2),
  conversations: z.array(conversationSchema).max(50),
  activeConversationId: z.string().min(1).optional()
})

const sharePayloadSchema = z.object({
  version: z.literal(1),
  conversation: conversationSchema
})

const STORAGE_KEY_V2 = 'yue_chat_conversations_v2'
const LEGACY_STORAGE_KEY_V1 = 'yue_chat_history_v1'

const getNowIso = () => new Date().toISOString()

const createId = (): string => {
  try {
    return globalThis.crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

const safeGetLocalStorage = (): Storage | null => {
  try {
    if (globalThis.window === undefined) return null
    return localStorage
  } catch {
    return null
  }
}

export const createEmptyConversation = (title: string): ChatConversation => {
  const now = getNowIso()
  return {
    id: createId(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: []
  }
}

type YueChatState = {
  conversations: ChatConversation[]
  activeConversationId: string
}

const normalizeState = (input: YueChatState): YueChatState => {
  const first = input.conversations[0]
  const active =
    input.conversations.find((c) => c.id === input.activeConversationId)?.id ?? first?.id

  if (!active) {
    const created = createEmptyConversation('New chat')
    return { conversations: [created], activeConversationId: created.id }
  }

  return {
    conversations: input.conversations,
    activeConversationId: active
  }
}

export const loadYueChatState = (): YueChatState => {
  const storage = safeGetLocalStorage()
  if (!storage) {
    const created = createEmptyConversation('New chat')
    return { conversations: [created], activeConversationId: created.id }
  }

  const stored = storage.getItem(STORAGE_KEY_V2)
  if (stored) {
    try {
      const parsed = storageSchema.parse(JSON.parse(stored))
      return normalizeState({
        conversations: parsed.conversations,
        activeConversationId: parsed.activeConversationId ?? parsed.conversations[0]?.id ?? ''
      })
    } catch {
      // ignore corrupted storage
    }
  }

  const legacy = storage.getItem(LEGACY_STORAGE_KEY_V1)
  if (legacy) {
    try {
      const messages = legacyMessagesSchema.parse(JSON.parse(legacy))
      const migrated: ChatConversation = {
        id: createId(),
        title: 'Imported chat',
        createdAt: getNowIso(),
        updatedAt: getNowIso(),
        messages
      }

      const next = normalizeState({
        conversations: [migrated],
        activeConversationId: migrated.id
      })

      saveYueChatState(next)
      storage.removeItem(LEGACY_STORAGE_KEY_V1)
      return next
    } catch {
      // ignore corrupted legacy storage
    }
  }

  const created = createEmptyConversation('New chat')
  const initial = { conversations: [created], activeConversationId: created.id }
  saveYueChatState(initial)
  return initial
}

export const saveYueChatState = (state: YueChatState): void => {
  const storage = safeGetLocalStorage()
  if (!storage) return

  const normalized = normalizeState(state)

  const toStore = {
    version: 2 as const,
    conversations: normalized.conversations,
    activeConversationId: normalized.activeConversationId
  }

  try {
    storage.setItem(STORAGE_KEY_V2, JSON.stringify(toStore))
  } catch {
    // ignore storage errors
  }
}

export const encodeConversationShare = (conversation: ChatConversation): string => {
  const payload = sharePayloadSchema.parse({
    version: 1 as const,
    conversation
  })

  return base64urlEncode(JSON.stringify(payload))
}

export const decodeConversationShare = (encoded: string): ChatConversation | null => {
  try {
    const json = base64urlDecodeToString(encoded)
    const payload = sharePayloadSchema.parse(JSON.parse(json))
    return payload.conversation
  } catch {
    return null
  }
}
