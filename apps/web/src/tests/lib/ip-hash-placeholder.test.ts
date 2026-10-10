import { describe, expect, it, vi } from 'vitest'

import { hashIpForAnalytics } from '@/lib/ip-hash'

vi.mock('@isyuricunha/env', () => ({
  env: {
    NODE_ENV: 'production',
    ANALYTICS_IP_HASH_SALT: 'change-me-to-a-random-string'
  }
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}))

describe('hashIpForAnalytics with a placeholder salt in production', () => {
  it('treats the public placeholder exactly like a missing salt', () => {
    expect(hashIpForAnalytics('203.0.113.10')).toBeNull()
  })
})
