import path from 'node:path'

import type { NextRequest } from 'next/server'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const ogImagePath = path.resolve(process.cwd(), 'public/images/og.png')

describe('site Open Graph image', () => {
  it('uses the standard 1200 by 630 social-card dimensions', async () => {
    const metadata = await sharp(ogImagePath).metadata()

    expect(metadata.width).toBe(1200)
    expect(metadata.height).toBe(630)
  })

  it('redirects legacy dynamic image URLs to the static card', async () => {
    const { GET } = await import('@/routes/og/+server')
    const request = new Request('https://example.com/og?locale=en') as NextRequest
    const response = await GET({ url: request.url } as never)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://example.com/images/og.png')
  })
})
