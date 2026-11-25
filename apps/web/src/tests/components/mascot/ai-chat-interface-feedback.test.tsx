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

vi.mock('@/utils/mascot-chat-storage', () => {
  return {
    loadMascotChatState: () => {
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
    saveMascotChatState: vi.fn(),
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
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const inputUrl = typeof input === 'string' ? input : ''
      if (inputUrl === '/api/ai/chat/status') {
        return Response.json(
          { available: true },
          {
            status: 200,
            headers: { 'content-type': 'application/json' }
          }
        )
      }

      return Response.json(
        {},
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      )
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

    const call = fetchMock.mock.calls.find(([url]) => url === '/api/ai/chat/feedback')
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
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const inputUrl = typeof input === 'string' ? input : ''
      if (inputUrl === '/api/ai/chat/status') {
        return Response.json(
          { available: true },
          {
            status: 200,
            headers: { 'content-type': 'application/json' }
          }
        )
      }

      return Response.json(
        {},
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      )
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

    const call = fetchMock.mock.calls.find(([url]) => url === '/api/ai/chat/feedback')
    expect(call).toBeTruthy()
    const [url, init] = call as unknown as [string, RequestInit]
    expect(url).toBe('/api/ai/chat/feedback')

    const parsed = JSON.parse(init.body as string) as Record<string, unknown>
    expect(parsed.requestId).toBe('r1')
    expect(parsed.messageId).toBe('m1')
    expect(parsed.rating).toBe('dislike')
    expect(parsed.comment).toBe('not helpful')
  })

  it('shows contextual quick prompts and sends the selected prompt without exposing the provider', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const inputUrl = typeof input === 'string' ? input : ''
      if (inputUrl === '/api/ai/chat/status') {
        return Response.json(
          { available: true },
          {
            status: 200,
            headers: { 'content-type': 'application/json' }
          }
        )
      }

      return Response.json(
        {
          message: 'ok',
          provider: 'Nery AI',
          timestamp: new Date().toISOString()
        },
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      )
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <AIChatInterface
          isOpen
          onClose={vi.fn()}
          currentPage='blogPost'
          pagePath='/en/blog/hello'
        />
      </NextIntlClientProvider>
    )

    expect(await screen.findByText('Nery AI ready')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Summarize this' }))

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => url === '/api/ai/chat')).toBe(true)
    })

    const call = fetchMock.mock.calls.find(([url]) => url === '/api/ai/chat')
    expect(call).toBeTruthy()
    const [, init] = call as unknown as [string, RequestInit]
    const parsed = JSON.parse(init.body as string) as Record<string, unknown>

    expect(parsed.message).toBe('Summarize this page in a few bullet points.')
    expect(parsed.provider).toBeUndefined()
    expect(JSON.stringify(parsed)).not.toContain('mistral')
  })

  it('blocks sends when the runtime configuration is unavailable', async () => {
    const fetchMock = vi.fn(async () => Response.json({ available: false }))
    vi.stubGlobal('fetch', fetchMock)

    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <AIChatInterface isOpen onClose={vi.fn()} currentPage='home' pagePath='/en' />
      </NextIntlClientProvider>
    )

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/ai/chat/status', expect.anything())
    )
    expect(screen.getByPlaceholderText('Ask me anything...')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries a failed HTTP request without duplicating the user message', async () => {
    let requests = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (input === '/api/ai/chat/status') return Response.json({ available: true })
      requests += 1
      if (requests === 1) {
        return Response.json(
          { error: 'private provider error' },
          {
            status: 500,
            headers: { 'x-request-id': 'retry-request' }
          }
        )
      }
      return Response.json({ message: 'retry succeeded' })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <AIChatInterface isOpen onClose={vi.fn()} currentPage='home' pagePath='/en' />
      </NextIntlClientProvider>
    )

    expect(await screen.findByText('Nery AI ready')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Ask me anything...'), {
      target: { value: 'retry this once' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    fireEvent.click(await screen.findByRole('button', { name: messages.mascot.aiChat.retry }))
    expect(await screen.findByText('retry succeeded')).toBeInTheDocument()
    expect(screen.getAllByText('retry this once')).toHaveLength(1)
    expect(screen.queryByText('private provider error')).not.toBeInTheDocument()
    expect(requests).toBe(2)
  })

  it('cancels an in-flight chat response', async () => {
    let chatSignal: AbortSignal | null | undefined

    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const inputUrl = typeof input === 'string' ? input : ''
      if (inputUrl === '/api/ai/chat/status') {
        return Promise.resolve(
          Response.json(
            { available: true },
            {
              status: 200,
              headers: { 'content-type': 'application/json' }
            }
          )
        )
      }

      chatSignal = init?.signal ?? undefined

      return new Promise<Response>((_, reject) => {
        chatSignal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <AIChatInterface isOpen onClose={vi.fn()} currentPage='home' pagePath='/en' />
      </NextIntlClientProvider>
    )

    expect(await screen.findByText('Nery AI ready')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Ask me anything...'), {
      target: { value: 'hello' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => expect(chatSignal).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Cancel response' }))

    await screen.findByText('Response canceled.')
    expect(chatSignal?.aborted).toBe(true)
  })
})
