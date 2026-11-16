import { fileURLToPath } from 'node:url'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

// Resolve against this file so the suite also passes when the root vitest
// config loads projects with cwd at the monorepo root.
const ogImagePath = fileURLToPath(new URL('../../../public/images/og.png', import.meta.url))

describe('site Open Graph image', () => {
  it('uses the standard 1200 by 630 social-card dimensions', async () => {
    const metadata = await sharp(ogImagePath).metadata()

    expect(metadata.width).toBe(1200)
    expect(metadata.height).toBe(630)
  })

  it('redirects legacy dynamic image URLs to the static card', async () => {
    const { GET } = await import('@/routes/og/+server')
    const request = new Request('https://example.com/og?locale=en')
    const response = await GET({ url: request.url } as never)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://example.com/images/og.png')
  })
})
