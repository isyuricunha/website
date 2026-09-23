import { withFailClosed } from '@isyuricunha/kv'
import { Ratelimit } from '@upstash/ratelimit'
import { describe, expect, it, vi } from 'vitest'

// The kv package instantiates the Upstash Redis client at module load, so the
// env mock must provide the UPSTASH vars before the kv module is imported.
// vitest hoists this mock above the imports automatically.
vi.mock('@isyuricunha/env', () => ({
  env: {
    UPSTASH_REDIS_REST_URL: 'https://example.com',
    UPSTASH_REDIS_REST_TOKEN: 'token'
  },
  flags: {}
}))

// A redis that never resolves: simulates a degraded/slow Upstash where the
// limiter's script call hangs past the configured timeout.
const hangingRedis = {
  eval: () => new Promise(() => { /* never settles: simulates a degraded Upstash */ }),
  evalsha: () => new Promise(() => { /* never settles */ })
}

const makeRaw = () =>
  new Ratelimit({
    redis: hangingRedis as never,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    timeout: 100,
    analytics: false
  })

describe('rate limiter fail-closed on Redis timeout', () => {
  it('documents the upstream bug: raw limiter lets a timed-out request through', async () => {
    const result = await makeRaw().limit('key')

    // The library resolves success:true with reason "timeout" when Redis
    // exceeds the configured timeout: a degraded Redis silently disables
    // every limiter on the site (fail-open).
    expect(result.success).toBe(true)
    expect(result.reason).toBe('timeout')
  }, 5000)

  it('denies a request when Redis times out (fail closed)', async () => {
    const limiter = withFailClosed(makeRaw())

    const result = await limiter.limit('key')

    expect(result.success).toBe(false)
    expect(result.reason).toBe('timeout')
  }, 5000)

  it('passes through non-timeout responses unchanged', async () => {
    const fakeLimiter = {
      limit: async () => ({
        success: true,
        limit: 10,
        remaining: 5,
        reset: 1_700_000_000_000,
        pending: Promise.resolve()
      })
    }

    const result = await withFailClosed(fakeLimiter as never).limit('key')

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(5)
  })
})