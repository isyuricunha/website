import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import messages from '@isyuricunha/i18n/messages/en.json'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const turnstileState = vi.hoisted(() => ({
  onSuccess: null as null | ((token: string) => void),
  onError: null as null | (() => void),
  onExpire: null as null | (() => void),
  reset: vi.fn()
}))

vi.mock('@isyuricunha/env', () => ({
  flags: { turnstile: true },
  env: { NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-site-key' }
}))

// React 19 passes `ref` as a regular prop; no forwardRef wrapper needed.
vi.mock('@marsidev/react-turnstile', () => {
  const React = require('react') as typeof import('react')

  const TurnstileMock = (props: any) => {
    React.useEffect(() => {
      turnstileState.onSuccess = props.onSuccess ?? null
      turnstileState.onError = props.onError ?? null
      turnstileState.onExpire = props.onExpire ?? null
    })

    React.useImperativeHandle(props.ref, () => ({ reset: turnstileState.reset }))

    return React.createElement('div', { 'data-testid': 'turnstile-widget' })
  }

  return { Turnstile: TurnstileMock }
})

vi.mock('@/hooks/use-sound', () => ({
  useSound: () => ({
    play: vi.fn(),
    stop: vi.fn(),
    isPlaying: false,
    volume: 0.5,
    setVolume: vi.fn()
  })
}))

const chatPath = '/api/ai/chat'
const statusPath = '/api/ai/chat/status'

const fetchMock = vi.fn(
  async (input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    if (input === statusPath) {
      return Response.json({ available: true })
    }
    if (input === chatPath) {
      return Response.json({
        message: 'response',
        requestId: 'req-1',
        timestamp: new Date().toISOString()
      })
    }
    return new Response(null, { status: 404 })
  }
)

const chatRequestBody = (): Record<string, unknown> => {
  const call = fetchMock.mock.calls.find(([input]) => input === chatPath)
  const init = call?.[1]
  if (init?.body === undefined || typeof init.body !== 'string') {
    throw new Error('expected a JSON string chat request body')
  }
  return JSON.parse(init.body) as Record<string, unknown>
}

const chatRequested = (): boolean =>
  fetchMock.mock.calls.some(([input]) => input === chatPath)

describe('<AIChatInterface /> with Turnstile enabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    turnstileState.onSuccess = null
    turnstileState.reset.mockReset()
    sessionStorage.clear()
    vi.stubGlobal('fetch', fetchMock)
  })

  const renderChat = async () => {
    const { default: AIChatInterface } = await import('@/components/mascot/ai-chat-interface')

    return render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <AIChatInterface isOpen onClose={vi.fn()} onMessageSent={vi.fn()} />
      </NextIntlClientProvider>
    )
  }

  it('sends the Turnstile token in the chat request body when armed', async () => {
    await renderChat()
    turnstileState.onSuccess?.('token-abc')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(statusPath, expect.anything())
    })

    fireEvent.change(screen.getByPlaceholderText(/ask/i), { target: { value: 'hello' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(chatPath, expect.objectContaining({ method: 'POST' }))
    })

    expect(chatRequestBody().message).toBe('hello')
    expect(chatRequestBody().turnstileToken).toBe('token-abc')
  })

  it('does not swallow the message when the token is missing: shows an error bubble and keeps the draft', async () => {
    await renderChat()

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(statusPath, expect.anything())
    })

    // No token has been produced: sending must be rejected visibly, not silently.
    fireEvent.change(screen.getByPlaceholderText(/ask/i), { target: { value: 'donut lose me' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(screen.getByText(/security verification pending/i)).toBeInTheDocument()
    })

    expect(chatRequested()).toBe(false)

    // The draft is restored so the user never loses their message.
    expect(screen.getByPlaceholderText(/ask/i)).toHaveValue('donut lose me')
  })

  it('keeps a pending prompt un-consumed until a token arrives, then sends it', async () => {
    sessionStorage.setItem('yue_pending_prompt', 'explain the selection')
    await renderChat()

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(statusPath, expect.anything())
    })

    // No token yet: the pending prompt must survive the rejection.
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(sessionStorage.getItem('yue_pending_prompt')).toBe('explain the selection')
    expect(chatRequested()).toBe(false)

    // The widget arms: the pending prompt is now dispatched with a token.
    turnstileState.onSuccess?.('token-pending')

    await waitFor(() => {
      expect(chatRequested()).toBe(true)
    })

    expect(chatRequestBody().turnstileToken).toBe('token-pending')
    expect(sessionStorage.getItem('yue_pending_prompt')).toBeNull()
  })
})