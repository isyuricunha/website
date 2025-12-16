import { beforeEach, describe, expect, it } from 'vitest'

import {
  decodeConversationShare,
  encodeConversationShare,
  loadYueChatState,
  type ChatConversation,
  type ChatMessage
} from '@/utils/yue-chat-storage'

describe('yue-chat-storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('migrates legacy yue_chat_history_v1 to yue_chat_conversations_v2', () => {
    const legacy: ChatMessage[] = [
      {
        id: 'welcome',
        text: 'hello',
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'text'
      },
      {
        id: 'u1',
        text: 'hi',
        isUser: true,
        timestamp: new Date().toISOString(),
        type: 'text'
      }
    ]

    localStorage.setItem('yue_chat_history_v1', JSON.stringify(legacy))

    const state = loadYueChatState()

    expect(state.conversations.length).toBe(1)
    expect(state.activeConversationId).toBe(state.conversations[0]?.id)

    const conversation = state.conversations[0]
    expect(conversation?.title).toBe('Imported chat')
    expect(conversation?.messages).toEqual(legacy)

    expect(localStorage.getItem('yue_chat_history_v1')).toBeNull()
    expect(localStorage.getItem('yue_chat_conversations_v2')).toBeTruthy()
  })

  it('encodes and decodes a share payload', () => {
    const now = new Date().toISOString()

    const conversation: ChatConversation = {
      id: 'c1',
      title: 'Shared chat',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'a1',
          text: 'hello',
          isUser: true,
          timestamp: now,
          type: 'text'
        }
      ]
    }

    const encoded = encodeConversationShare(conversation)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)

    const decoded = decodeConversationShare(encoded)
    expect(decoded).toEqual(conversation)
  })

  it('returns null when share payload is invalid', () => {
    expect(decodeConversationShare('not-valid')).toBeNull()
  })
})
