import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/constants', () => ({
  SITE_URL: 'https://example.com'
}))

describe('app robots.txt generator', () => {
  it('includes sitemap, host, and Content-Signal', async () => {
    const { GET } = await import('@/app/robots.txt/route')

    const response = GET()
    const body = await response.text()

    expect(response.headers.get('Content-Type')).toBe('text/plain')
    expect(body).toContain('Sitemap: https://example.com/sitemap.xml')
    expect(body).toContain('Host: https://example.com')
    expect(body).toContain('Content-Signal: ai-train=no, search=yes, ai-input=yes')
    expect(body).toContain('User-agent: *')
    expect(body).toContain('Allow: /')
    expect(body).toContain('Disallow: /api/')
  })
})
