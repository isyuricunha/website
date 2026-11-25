import { beforeEach, describe, expect, it } from 'vitest'

import {
  decodeConversationShare,
  encodeConversationShare,
  loadMascotChatState,
  saveMascotChatState,
  type ChatConversation,
  type ChatMessage
} from '@/utils/mascot-chat-storage'

describe('mascot-chat-storage', () => {
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

    const state = loadMascotChatState()

    expect(state.conversations).toHaveLength(1)
    expect(state.activeConversationId).toBe(state.conversations[0]?.id)
    expect(state.provider).toBe('auto')

    const conversation = state.conversations[0]
    expect(conversation?.title).toBe('Imported chat')
    expect(conversation?.messages).toEqual(legacy)

    expect(localStorage.getItem('yue_chat_history_v1')).toBeNull()
    expect(localStorage.getItem('yue_chat_conversations_v2')).toBeTruthy()
  })

  it('preserves existing v3 Yue conversations and the active selection', () => {
    const now = new Date().toISOString()
    const conversations: ChatConversation[] = [
      {
        id: 'first',
        title: 'Original',
        createdAt: now,
        updatedAt: now,
        messages: [{ id: 'message', text: 'Hello Yue', isUser: true, timestamp: now }]
      },
      { id: 'second', title: 'Another', createdAt: now, updatedAt: now, messages: [] }
    ]
    localStorage.setItem(
      'yue_chat_conversations_v2',
      JSON.stringify({
        version: 3,
        conversations,
        activeConversationId: 'second',
        provider: 'auto'
      })
    )
    const state = loadMascotChatState()
    expect(state.conversations).toEqual(conversations)
    expect(state.activeConversationId).toBe('second')
    saveMascotChatState(state)
    expect(loadMascotChatState()).toEqual(state)
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
