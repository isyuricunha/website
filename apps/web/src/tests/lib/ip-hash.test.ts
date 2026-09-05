import { describe, expect, it } from 'vitest'

import { hashIpForAnalytics } from '@/lib/ip-hash'

describe('hashIpForAnalytics', () => {
  it('returns null for null/undefined/empty input', () => {
    expect(hashIpForAnalytics(null)).toBeNull()
    expect(hashIpForAnalytics(undefined)).toBeNull()
    expect(hashIpForAnalytics('')).toBeNull()
  })

  it('never returns the plaintext IP', () => {
    const ip = '203.0.113.10'
    const hashed = hashIpForAnalytics(ip)

    expect(hashed).not.toBeNull()
    expect(hashed).not.toBe(ip)
    expect(hashed).not.toContain(ip)
  })

  it('is deterministic for the same IP', () => {
    const ip = '203.0.113.10'

    expect(hashIpForAnalytics(ip)).toBe(hashIpForAnalytics(ip))
  })

  it('produces different hashes for different IPs', () => {
    expect(hashIpForAnalytics('203.0.113.10')).not.toBe(hashIpForAnalytics('203.0.113.11'))
  })

  it('returns a 64-character hex string (sha256)', () => {
    const hashed = hashIpForAnalytics('203.0.113.10')

    expect(hashed).toMatch(/^[a-f0-9]{64}$/)
  })
})
