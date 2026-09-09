import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  })
}))

describe('[locale]/[...rest] catch-all page', () => {
  it('triggers the not-found flow instead of rendering with HTTP 200', async () => {
    const { notFound } = await import('next/navigation')
    const { default: CatchAllPage } = await import('@/app/[locale]/[...rest]/page')

    await expect(
      (async () => {
        CatchAllPage()
      })()
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFound).toHaveBeenCalledOnce()
  })
})
