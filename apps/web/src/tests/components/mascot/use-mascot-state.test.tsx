import { NextIntlClientProvider } from '@isyuricunha/i18n/client'
import messages from '@isyuricunha/i18n/messages/en.json'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMascotState } from '@/components/mascot/hooks/use-mascot-state'

const DISMISSED_KEY = 'vc_mascot_dismissed'
const HIDDEN_KEY = 'vc_mascot_hidden'

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale='en' messages={messages}>
    {children}
  </NextIntlClientProvider>
)

const installMatchMedia = () => {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
}

const installLatestPostFetch = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({})
    }))
  )
}

describe('useMascotState', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    installMatchMedia()
    installLatestPostFetch()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('restores persisted hidden and dismissed flags', async () => {
    localStorage.setItem(HIDDEN_KEY, '1')
    sessionStorage.setItem(DISMISSED_KEY, '1')

    const { result } = renderHook(() => useMascotState(), { wrapper })

    await waitFor(() => expect(result.current.mounted).toBe(true))

    expect(result.current.state.isHiddenPref).toBe(true)
    expect(result.current.state.isDismissed).toBe(true)

    act(() => {
      result.current.restoreMascot()
    })

    expect(result.current.state.isHiddenPref).toBe(false)
    expect(result.current.state.isDismissed).toBe(false)
    expect(localStorage.getItem(HIDDEN_KEY)).toBeNull()
    expect(sessionStorage.getItem(DISMISSED_KEY)).toBeNull()
  })

  it('separates session dismiss from hide until restored', async () => {
    const { result } = renderHook(() => useMascotState(), { wrapper })

    await waitFor(() => expect(result.current.mounted).toBe(true))

    act(() => {
      result.current.handleDismissMascot()
    })

    expect(result.current.state.isDismissed).toBe(true)
    expect(result.current.state.isHiddenPref).toBe(false)
    expect(sessionStorage.getItem(DISMISSED_KEY)).toBe('1')
    expect(localStorage.getItem(HIDDEN_KEY)).toBeNull()

    act(() => {
      result.current.restoreMascot()
      result.current.handleHideMascot()
    })

    expect(result.current.state.isDismissed).toBe(false)
    expect(result.current.state.isHiddenPref).toBe(true)
    expect(sessionStorage.getItem(DISMISSED_KEY)).toBeNull()
    expect(localStorage.getItem(HIDDEN_KEY)).toBe('1')
  })
})
