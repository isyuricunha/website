import { describe, expect, it } from 'vitest'

import { getClientIp } from '@/lib/spam-detection'

describe('getClientIp', () => {
  it('prefers cf-connecting-ip when present', () => {
    const headers = new Headers({
      'cf-connecting-ip': '203.0.113.10',
      'x-forwarded-for': '198.51.100.1'
    })

    expect(getClientIp(headers)).toBe('203.0.113.10')
  })

  it('uses the first IP from x-forwarded-for list', () => {
    const headers = new Headers({
      'x-forwarded-for': '198.51.100.1, 203.0.113.10'
    })

    expect(getClientIp(headers)).toBe('198.51.100.1')
  })

  it('strips port from ipv4 value', () => {
    const headers = new Headers({
      'x-forwarded-for': '198.51.100.1:1234'
    })

    expect(getClientIp(headers)).toBe('198.51.100.1')
  })

  it('strips port from bracketed ipv6 value', () => {
    const headers = new Headers({
      'x-forwarded-for': '[2001:db8::1]:1234'
    })

    expect(getClientIp(headers)).toBe('2001:db8::1')
  })

  it('returns unknown when no known headers are present', () => {
    const headers = new Headers()

    expect(getClientIp(headers)).toBe('unknown')
  })

  it('does not truncate an IPv4-mapped IPv6 address', () => {
    // Regression: `.includes('.') && .includes(':')` matched this shape too,
    // wrongly treating it as "IPv4 with a port" and truncating it to `null`.
    const headers = new Headers({
      'x-forwarded-for': '::ffff:192.168.1.1'
    })

    expect(getClientIp(headers)).toBe('::ffff:192.168.1.1')
  })

  it('does not truncate a NAT64 address with an embedded IPv4 suffix', () => {
    // Regression: the same broad heuristic reduced this to the garbage
    // fragment "64" (everything before the first colon).
    const headers = new Headers({
      'x-forwarded-for': '64:ff9b::203.0.113.5'
    })

    expect(getClientIp(headers)).toBe('64:ff9b::203.0.113.5')
  })

  it('still strips the port from a genuine IPv4:port pair', () => {
    const headers = new Headers({
      'true-client-ip': '203.0.113.10:8443'
    })

    expect(getClientIp(headers)).toBe('203.0.113.10')
  })
})
