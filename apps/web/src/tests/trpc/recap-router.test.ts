import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@isyuricunha/env', () => {
  return {
    flags: {
      comment: false,
      auth: false,
      stats: false,
      spotify: false,
      spotifyImport: false,
      gemini: false,
      analytics: false,
      guestbookNotification: false,
      likeButton: false,
      turnstile: false
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://user:***@localhost:5432/test',
      UPSTASH_REDIS_REST_URL: 'https://example.com',
      UPSTASH_REDIS_REST_TOKEN: 'token',
      RESEND_API_KEY: 'token',
      WAKATIME_API_KEY: 'waka_test'
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

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(async () => null)
}))

vi.mock('@isyuricunha/kv', () => ({
  ratelimit: {
    limit: vi.fn(async () => ({ success: true }))
  }
}))

const MILLIS_PER_DAY = 24 * 60 * 60 * 1000

// Dates relative to the real clock so the rolling window stays valid over time.
const daysAgo = (days: number) => new Date(Date.now() - days * MILLIS_PER_DAY).toISOString()

vi.mock('content-collections', () => {
  return {
    allPosts: [
      { slug: 'within-window', locale: 'en', title: 'Within (en)', date: daysAgo(30) },
      { slug: 'within-window', locale: 'pt', title: 'Within (pt)', date: daysAgo(30) },
      { slug: 'old-post', locale: 'en', title: 'Old', date: '2020-01-01T00:00:00Z' },
      { slug: 'recent-pt-only', locale: 'pt', title: 'Recent PT', date: daysAgo(10) },
      { slug: 'liked-post', locale: 'fr', title: 'Aimé', date: '2025-01-01T00:00:00Z' }
    ]
  }
})

const createDbMock = (rows: Array<Record<string, unknown>>) => {
  const select = vi.fn(() => {
    return {
      from: vi.fn(() => {
        return {
          where: vi.fn(() => {
            return {
              orderBy: vi.fn(() => {
                return {
                  limit: vi.fn(async () => rows)
                }
              })
            }
          })
        }
      })
    }
  })

  return { select }
}

const createCaller = async (rows: Array<Record<string, unknown>> = []) => {
  const { recapRouter } = await import('@/trpc/routers/recap')

  return recapRouter.createCaller({
    db: createDbMock(rows) as unknown,
    headers: new Headers()
  } as unknown as Parameters<typeof recapRouter.createCaller>[0])
}

describe('recapRouter', () => {
  it('summary dedupes translations by slug and applies the rolling window', async () => {
    const caller = await createCaller()

    const result = await caller.summary()

    expect(result.totalPosts).toBe(4)
    expect(result.postsLastTwelveMonths).toBe(2)
  })

  it('topViewed prefers the requested locale and drops rows without a document', async () => {
    const caller = await createCaller([
      { slug: 'within-window', views: 30 },
      { slug: 'deleted-post', views: 5 }
    ])

    const result = await caller.topViewed({ locale: 'pt', limit: 5 })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      slug: 'within-window',
      locale: 'pt',
      title: 'Within (pt)',
      views: 30
    })
  })

  it('topLiked falls back to another translation when the requested locale is missing', async () => {
    const caller = await createCaller([{ slug: 'liked-post', likes: 7 }])

    const result = await caller.topLiked({ locale: 'en', limit: 5 })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      slug: 'liked-post',
      locale: 'fr',
      title: 'Aimé',
      likes: 7
    })
  })
})

describe('wakatimeRouter.getStats', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps the last_year stats payload and prefers including-other-language totals', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: {
            is_up_to_date: true,
            range: 'last_year',
            total_seconds: 100,
            total_seconds_including_other_language: 200,
            human_readable_total: '1 hr',
            human_readable_total_including_other_language: '2 hrs',
            daily_average: 10,
            daily_average_including_other_language: 20,
            human_readable_daily_average: '20 secs',
            human_readable_daily_average_including_other_language: '20 secs',
            languages: [
              { name: 'TypeScript', percent: 50.25, text: '1 hr' },
              { name: 'Other', percent: 9.5, text: '2 mins' }
            ],
            projects: [{ name: 'website', percent: 24.58, text: '2 hrs' }]
          }
        })
      }))
    )

    const { wakatimeRouter } = await import('@/trpc/routers/wakatime')

    const caller = wakatimeRouter.createCaller({
      db: {} as unknown,
      headers: new Headers()
    } as unknown as Parameters<typeof wakatimeRouter.createCaller>[0])

    const result = await caller.getStats()

    expect(result).not.toBeNull()
    expect(result?.humanReadableTotal).toBe('2 hrs')
    expect(result?.totalSeconds).toBe(200)
    expect(result?.humanReadableDailyAverage).toBe('20 secs')
    expect(result?.languages).toHaveLength(2)
    expect(result?.languages[0]).toMatchObject({ name: 'TypeScript', percent: 50.25 })
    expect(result?.projects[0]).toMatchObject({ name: 'website' })
  })

  it('returns null instead of throwing when the API request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        json: async () => ({ errors: ['Unauthorized.'] })
      }))
    )

    const { wakatimeRouter } = await import('@/trpc/routers/wakatime')

    const caller = wakatimeRouter.createCaller({
      db: {} as unknown,
      headers: new Headers()
    } as unknown as Parameters<typeof wakatimeRouter.createCaller>[0])

    await expect(caller.getStats()).resolves.toBeNull()
  })
})
