import { describe, expect, it, vi } from 'vitest'

/*
 * The telemetry limiter must fail OPEN. Every other limiter in the app is
 * wrapped in withFailClosed (a degraded Redis must deny access to a protected
 * resource), but telemetry is the inverse case: if Redis is slow we would
 * rather keep writing observability rows than lose the data needed to debug
 * whatever is degrading Redis.
 *
 * This suite exercises the REAL withFailClosed wrapper and the REAL
 * telemetryRatelimit export from @isyuricunha/kv against a stubbed
 * @upstash/ratelimit, so wrapping telemetryRatelimit in withFailClosed by
 * mistake fails the build. Mocking the module that exports it would hide
 * exactly that regression.
 */

const limitResult = vi.hoisted(() => ({
  value: { success: true, reason: 'timeout' }
}))

vi.mock('@upstash/ratelimit', () => {
  class FakeRatelimit {
    static slidingWindow(tokens: number, window: string) {
      return { tokens, window }
    }

    constructor(public config: Record<string, unknown>) {}

    async limit(_identifier: string) {
      return limitResult.value
    }
  }
  return { Ratelimit: FakeRatelimit }
})

vi.mock('@upstash/redis', () => ({
  Redis: class {
    constructor(public config: Record<string, unknown>) {}
  }
}))

vi.mock('@isyuricunha/env', () => ({
  env: {
    UPSTASH_REDIS_REST_URL: 'https://example.com',
    UPSTASH_REDIS_REST_TOKEN: 'token',
    NODE_ENV: 'test'
  },
  flags: {}
}))

describe('telemetry limiter degradation policy', () => {
  it('keeps telemetry allowed when upstash reports a timeout (fail open)', async () => {
    limitResult.value = { success: true, reason: 'timeout' }
    const { telemetryRatelimit } = await import('@isyuricunha/kv')

    const result = await telemetryRatelimit.limit('trpc:telemetry:203.0.113.7')

    // withFailClosed would flip this to false and silently kill telemetry
    // during the exact incident we need it for.
    expect(result.success).toBe(true)
  })

  it('still denies when the window is genuinely exhausted', async () => {
    limitResult.value = { success: false, reason: 'denied' }
    const { telemetryRatelimit } = await import('@isyuricunha/kv')

    const result = await telemetryRatelimit.limit('trpc:telemetry:203.0.113.7')

    expect(result.success).toBe(false)
  })

  it('keeps the shared resource limiter fail-CLOSED on timeout', async () => {
    limitResult.value = { success: true, reason: 'timeout' }
    const { ratelimit } = await import('@isyuricunha/kv')

    const result = await ratelimit.limit('probe')

    expect(result.success).toBe(false)
  })
})
