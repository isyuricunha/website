import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import messages from '@isyuricunha/i18n/messages/en.json'
import { describe, expect, it, vi } from 'vitest'

import AIChatInterface from '@/components/mascot/ai-chat-interface'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/utils/yue-chat-storage', () => {
  return {
    loadYueChatState: () => {
      return {
        conversations: [
          {
            id: 'c1',
            title: 'Chat',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [
              {
                id: 'welcome',
                text: 'welcome',
                isUser: false,
                timestamp: new Date().toISOString(),
                type: 'text'
              },
              {
                id: 'm1',
                text: 'assistant message',
                isUser: false,
                timestamp: new Date().toISOString(),
                type: 'text',
                requestId: 'r1',
                reactions: {
                  likes: 0,
                  dislikes: 0,
                  userReaction: null
                }
              }
            ]
          }
        ],
        activeConversationId: 'c1',
        provider: 'auto'
      }
    },
    saveYueChatState: vi.fn(),
    createEmptyConversation: (title: string) => {
      const now = new Date().toISOString()
      return { id: 'new', title, createdAt: now, updatedAt: now, messages: [] }
    },
    decodeConversationShare: () => null,
    encodeConversationShare: () => 'share'
  }
})

describe('<AIChatInterface /> feedback', () => {
  it('submits like feedback on thumbs up click', async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({})
      } as Response
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <AIChatInterface isOpen onClose={vi.fn()} currentPage='home' pagePath='/en' />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Thumbs up' })[0]!)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const call = fetchMock.mock.calls[0]
    expect(call).toBeTruthy()
    const [url, init] = call as unknown as [string, RequestInit]
    expect(url).toBe('/api/ai/chat/feedback')
    expect(init.method).toBe('POST')

    const parsed = JSON.parse(init.body as string) as Record<string, unknown>
    expect(parsed.requestId).toBe('r1')
    expect(parsed.messageId).toBe('m1')
    expect(parsed.rating).toBe('like')
    expect(parsed.pagePath).toBe('/en')
    expect(parsed.locale).toBe('en')
  })

  it('opens comment box on thumbs down and submits dislike feedback with comment', async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({})
      } as Response
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <AIChatInterface isOpen onClose={vi.fn()} currentPage='home' pagePath='/en' />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Thumbs down' })[0]!)

    const textarea = await screen.findByPlaceholderText('Tell me what went wrong (optional)')
    fireEvent.change(textarea, { target: { value: ' not helpful ' } })

    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const call = fetchMock.mock.calls[0]
    expect(call).toBeTruthy()
    const [url, init] = call as unknown as [string, RequestInit]
    expect(url).toBe('/api/ai/chat/feedback')

    const parsed = JSON.parse(init.body as string) as Record<string, unknown>
    expect(parsed.requestId).toBe('r1')
    expect(parsed.messageId).toBe('m1')
    expect(parsed.rating).toBe('dislike')
    expect(parsed.comment).toBe('not helpful')
  })
})
