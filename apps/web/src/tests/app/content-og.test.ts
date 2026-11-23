import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  getContentOgCard,
  getContentOgParams,
  getContentOgPath,
  getLegacyContentOgPath
} from '@/lib/content-og'

vi.mock('content-collections', () => ({
  allPosts: [
    {
      locale: 'en',
      slug: 'shared',
      title: 'Title',
      date: '2024-02-03T00:00:00Z',
      summary: 'Summary'
    },
    { locale: 'pt', slug: 'shared', title: 'Título', date: '2024-02-03', summary: 'Resumo' }
  ],
  allSnippets: [
    {
      locale: 'en',
      slug: 'shared',
      title: 'Snippet',
      date: '2024-02-03',
      description: 'Description'
    }
  ]
}))

describe('static content Open Graph cards', () => {
  it('has finite distinct localized and typed paths and resolves their content', () => {
    const params = getContentOgParams()
    expect(params).toHaveLength(3)
    expect(new Set(params.map((p) => p.key)).size).toBe(3)
    for (const p of params) {
      const card = getContentOgCard(p.locale, p.kind, p.key)
      expect(card).toBeDefined()
      if (!card) throw new Error('Missing card')
      expect(getContentOgPath(p.locale, card.kind, card.slug)).toBe(
        '/og/content/' + p.locale + '/' + p.kind + '/' + p.key
      )
    }
  })
  it('uses a generic static image for unknown content and invalid keys', () => {
    expect(getContentOgPath('en', 'post', 'unknown')).toBe('/images/og.png')
    expect(getContentOgCard('en', 'post', 'unknown')).toBeUndefined()
    expect(getLegacyContentOgPath('en', 'snippet', 'shared')).not.toBe(
      getLegacyContentOgPath('en', 'post', 'shared')
    )
  })
  it('redirects legacy links without rendering arbitrary query text', async () => {
    const { GET } = await import('@/app/og/[id]/route')
    const call = (text: string) =>
      GET(new NextRequest('https://example.com/og/shared?locale=pt&type=post&title=' + text), {
        params: Promise.resolve({ id: 'shared' })
      })
    const a = await call('first')
    const b = await call('second')
    expect(a.status).toBe(307)
    expect(a.headers.get('location')).toBe(
      'https://example.com' + getContentOgPath('pt', 'post', 'shared')
    )
    expect(b.headers.get('location')).toBe(a.headers.get('location'))
  })
})
