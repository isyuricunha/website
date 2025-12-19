import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/env', () => {
  return {
    flags: {
      comment: false,
      auth: false,
      stats: false,
      spotify: true,
      spotifyImport: false,
      gemini: false,
      analytics: false,
      guestbookNotification: false,
      likeButton: false,
      turnstile: false
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/test',
      UPSTASH_REDIS_REST_URL: 'https://example.com',
      UPSTASH_REDIS_REST_TOKEN: 'token',
      RESEND_API_KEY: 'token',
      SPOTIFY_CLIENT_ID: 'client-id',
      SPOTIFY_CLIENT_SECRET: 'client-secret',
      SPOTIFY_REFRESH_TOKEN: 'refresh-token'
    }
  }
})

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock('@isyuricunha/kv', () => {
  return {
    ratelimit: {
      limit: vi.fn(async () => ({ success: true }))
    }
  }
})

vi.mock('@/utils/get-ip', () => {
  return {
    getIp: () => '203.0.113.10'
  }
})

const getFetchUrl = (input: unknown): string | null => {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.url
  }

  if (typeof input === 'object' && input !== null && 'url' in input) {
    const url = (input as { url?: unknown }).url
    return typeof url === 'string' ? url : null
  }

  return null
}

describe('spotifyRouter', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it('retries once on 401 by clearing cached token', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = getFetchUrl(input)
      if (!url) return new Response('invalid url', { status: 400 })

      if (url === 'https://accounts.spotify.com/api/token') {
        const token = fetchMock.mock.calls.filter((c) => getFetchUrl(c[0]) === url).length
        const access = token === 1 ? 'token-1' : 'token-2'
        return new Response(JSON.stringify({ access_token: access }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (url === 'https://api.spotify.com/v1/me/player/currently-playing') {
        const calls = fetchMock.mock.calls.filter((c) => getFetchUrl(c[0]) === url).length
        if (calls === 1) {
          return new Response(JSON.stringify({ error: { message: 'expired' } }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        return new Response(
          JSON.stringify({
            is_playing: true,
            item: {
              name: 'song',
              external_urls: { spotify: 'https://open.spotify.com/track/x' },
              artists: [{ name: 'artist' }]
            }
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response('not found', { status: 404 })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { spotifyRouter } = await import('@/trpc/routers/spotify')

    const caller = spotifyRouter.createCaller({
      db: {} as unknown,
      headers: new Headers()
    } as unknown as Parameters<typeof spotifyRouter.createCaller>[0])

    const result = await caller.get()

    expect(result.isPlaying).toBe(true)
    expect(result.songUrl).toBe('https://open.spotify.com/track/x')

    const tokenCalls = fetchMock.mock.calls.filter(
      (c) => getFetchUrl(c[0]) === 'https://accounts.spotify.com/api/token'
    )
    const nowPlayingCalls = fetchMock.mock.calls.filter(
      (c) => getFetchUrl(c[0]) === 'https://api.spotify.com/v1/me/player/currently-playing'
    )

    expect(tokenCalls).toHaveLength(2)
    expect(nowPlayingCalls).toHaveLength(2)
  })

  it('returns safe fallback for audio features summary when spotify responds 403', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = getFetchUrl(input)
      if (!url) return new Response('invalid url', { status: 400 })

      if (url === 'https://accounts.spotify.com/api/token') {
        return new Response(JSON.stringify({ access_token: 'token-1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (url.startsWith('https://api.spotify.com/v1/me/top/tracks')) {
        return new Response(JSON.stringify({ error: { message: 'forbidden' } }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response('not found', { status: 404 })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { spotifyRouter } = await import('@/trpc/routers/spotify')

    const caller = spotifyRouter.createCaller({
      db: {} as unknown,
      headers: new Headers()
    } as unknown as Parameters<typeof spotifyRouter.createCaller>[0])

    const result = await caller.getAudioFeaturesSummaryByRange({ time_range: 'short_term' })

    expect(result.sampleSize).toBe(0)
    expect(result.danceability).toBeNull()

    const audioFeaturesCalls = fetchMock.mock.calls.filter((c) => {
      const callUrl = getFetchUrl(c[0])
      return typeof callUrl === 'string' && callUrl.includes('/audio-features')
    })
    expect(audioFeaturesCalls).toHaveLength(0)
  })

  it('returns [] for getTopArtistsByRange when spotify responds 403', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = getFetchUrl(input)
      if (!url) return new Response('invalid url', { status: 400 })

      if (url === 'https://accounts.spotify.com/api/token') {
        return new Response(JSON.stringify({ access_token: 'token-1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (url.startsWith('https://api.spotify.com/v1/me/top/artists')) {
        return new Response(JSON.stringify({ error: { message: 'forbidden' } }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response('not found', { status: 404 })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { spotifyRouter } = await import('@/trpc/routers/spotify')

    const caller = spotifyRouter.createCaller({
      db: {} as unknown,
      headers: new Headers()
    } as unknown as Parameters<typeof spotifyRouter.createCaller>[0])

    const result = await caller.getTopArtistsByRange({ time_range: 'short_term' })
    expect(result).toEqual([])
  })
})
