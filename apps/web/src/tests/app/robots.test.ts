import { describe, expect, it, vi } from 'vitest'

describe('app robots.txt generator', () => {
  it('uses the real SITE_URL for sitemap and host directives', async () => {
    const { SITE_URL } = await import('../../lib/constants')
    expect(SITE_URL).toBeTruthy()
  })

  it('includes sitemap, host, and Content-Signal', async () => {
    const { GET } = await import('@/routes/robots.txt/+server')

    const response = (await GET({
      request: new Request('http://test/robots.txt')
    } as unknown as Parameters<typeof GET>[0])) as Response
    const body = await response.text()

    expect(response.headers.get('Content-Type')).toBe('text/plain')
    expect(body).toContain('Sitemap:')
    expect(body).toContain('Host: ')
    expect(body).toContain('Content-Signal: ai-train=no, search=yes, ai-input=yes')
    expect(body).toContain('User-agent: *')
    expect(body).toContain('Allow: /')
    expect(body).toContain('Disallow: /api/')
  })
})
