import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/constants', () => ({
  SITE_URL: 'https://example.com'
}))

describe('app robots.txt generator', () => {
  it('includes sitemap and host', async () => {
    const { default: robots } = await import('@/app/robots')

    const result = robots()

    expect(result.sitemap).toBe('https://example.com/sitemap.xml')
    expect(result.host).toBe('https://example.com')
  })
})
