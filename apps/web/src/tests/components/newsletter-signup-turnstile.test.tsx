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

const subscribePath = '/api/newsletter/subscribe'

const fetchMock = vi.fn(
  async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
    Response.json({ ok: true })
)

const subscribeRequestBody = (): Record<string, unknown> => {
  const call = fetchMock.mock.calls[0]
  const init = call?.[1]
  if (init?.body === undefined || typeof init.body !== 'string') {
    throw new Error('expected a JSON string subscribe request body')
  }
  return JSON.parse(init.body) as Record<string, unknown>
}

describe('<NewsletterSignup /> with Turnstile enabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    turnstileState.onSuccess = null
    turnstileState.onError = null
    turnstileState.onExpire = null
    turnstileState.reset.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  const renderSignup = async () => {
    const { default: NewsletterSignup } = await import('@/components/newsletter-signup')

    return render(
      <NextIntlClientProvider locale='en' messages={messages}>
        <NewsletterSignup />
      </NextIntlClientProvider>
    )
  }

  it('renders the Turnstile widget when the flag and site key are present', async () => {
    await renderSignup()

    expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument()
  })

  it('keeps the submit disabled until a Turnstile token is produced', async () => {
    await renderSignup()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } })

    const button = screen.getByRole('button', { name: /subscribe/i })
    expect(button).toBeDisabled()

    turnstileState.onSuccess?.('fresh-token')

    await waitFor(() => {
      expect(button).toBeEnabled()
    })
  })

  it('sends the Turnstile token in the subscribe request body', async () => {
    await renderSignup()
    turnstileState.onSuccess?.('token-abc')

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        subscribePath,
        expect.objectContaining({ method: 'POST' })
      )
    })

    const body = subscribeRequestBody()
    expect(body.email).toBe('alice@example.com')
    expect(body.turnstileToken).toBe('token-abc')
  })

  it('clears the token and resets the widget when the subscribe request fails', async () => {
    fetchMock.mockImplementationOnce(async () =>
      Response.json({ error: 'nope' }, { status: 403 })
    )

    await renderSignup()
    turnstileState.onSuccess?.('single-use-token')

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    // The 403 consumed the single-use token: the widget must reset and the
    // submit must go back to disabled so the retry carries a fresh token.
    expect(turnstileState.reset).toHaveBeenCalled()

    const button = screen.getByRole('button', { name: /subscribe/i })
    expect(button).toBeDisabled()

    // A fresh token re-enables the retry and goes out in the new request.
    turnstileState.onSuccess?.('token-xyz')
    await waitFor(() => {
      expect(button).toBeEnabled()
    })

    fireEvent.click(button)
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    const call = fetchMock.mock.calls[1]
    const init = call?.[1]
    if (init?.body === undefined || typeof init.body !== 'string') {
      throw new Error('expected a JSON string subscribe request body')
    }
    const body = JSON.parse(init.body) as Record<string, unknown>
    expect(body.turnstileToken).toBe('token-xyz')

    vi.unstubAllGlobals()
  })
})