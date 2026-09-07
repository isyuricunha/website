import path from 'node:path'

import type { NextRequest } from 'next/server'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const ogImagePath = path.resolve(process.cwd(), 'apps/web/public/images/og.png')

describe('site Open Graph image', () => {
  it('uses the standard 1200 by 630 social-card dimensions', async () => {
    const metadata = await sharp(ogImagePath).metadata()

    expect(metadata.width).toBe(1200)
    expect(metadata.height).toBe(630)
  })

  it('redirects legacy dynamic image URLs to the static card', async () => {
    const { GET } = await import('@/app/og/route')
    const request = new Request('https://example.com/og?locale=en') as NextRequest
    const response = GET(request)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://example.com/images/og.png')
  })
})
