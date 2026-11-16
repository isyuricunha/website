// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { reveal } from '#lib/actions/reveal.ts'

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void

const observers: Array<{
  callback: ObserverCallback
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}> = []

class FakeIntersectionObserver {
  callback: ObserverCallback
  observe = vi.fn()
  disconnect = vi.fn()

  constructor(callback: ObserverCallback) {
    this.callback = callback
    observers.push(this)
  }
}

describe('reveal action', () => {
  beforeEach(() => {
    observers.length = 0
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('marks the node pending immediately and reveals once when it intersects', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
    const node = document.createElement('div')
    const action = reveal(node)

    expect(node.classList.contains('yu-reveal-pending')).toBe(true)

    const observer = observers.at(0)
    expect(observer?.observe).toHaveBeenCalledWith(node)
    observer?.callback([{ isIntersecting: true }])

    expect(node.classList.contains('yu-reveal-in')).toBe(true)
    expect(node.classList.contains('yu-reveal-pending')).toBe(true)
    expect(observer?.disconnect).toHaveBeenCalled()
    action?.destroy?.()
  })

  it('never marks or observes when reduced motion is on', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const node = document.createElement('div')
    const action = reveal(node)

    expect(node.classList.contains('yu-reveal-pending')).toBe(false)
    expect(observers).toHaveLength(0)
    action?.destroy?.()
  })

  it('does nothing without a matchMedia implementation (server)', () => {
    vi.stubGlobal('matchMedia', undefined)
    const node = document.createElement('div')
    const action = reveal(node)

    expect(observers).toHaveLength(0)
    action?.destroy?.()
  })
})
