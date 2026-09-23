import { describe, expect, it } from 'vitest'

import { getClientIp } from '@/lib/spam-detection'

describe('getClientIp', () => {
  it('trusts x-vercel-forwarded-for (platform-set header)', () => {
    const headers = new Headers({
      'x-vercel-forwarded-for': '203.0.113.10'
    })

    expect(getClientIp(headers)).toBe('203.0.113.10')
  })

  it('ignores all client-suppliable headers when no Cloudflare transit proof exists', () => {
    const headers = new Headers({
      'cf-connecting-ip': '203.0.113.10',
      'true-client-ip': '203.0.113.11',
      'x-forwarded-for': '198.51.100.1, 203.0.113.10',
      'x-real-ip': '203.0.113.12',
      'x-client-ip': '203.0.113.13'
    })

    expect(getClientIp(headers)).toBe('unknown')
  })

  it('trusts cf-connecting-ip only when cf-ray proves Cloudflare transit', () => {
    const headers = new Headers({
      'cf-connecting-ip': '203.0.113.10',
      'cf-ray': 'abc123-FRA'
    })

    expect(getClientIp(headers)).toBe('203.0.113.10')
  })

  it('prefers cf-connecting-ip over x-vercel-forwarded-for when transit is proven', () => {
    const headers = new Headers({
      'cf-connecting-ip': '203.0.113.10',
      'cf-ray': 'abc123-FRA',
      'x-vercel-forwarded-for': '198.51.100.1'
    })

    expect(getClientIp(headers)).toBe('203.0.113.10')
  })

  it('returns unknown when no trusted headers are present', () => {
    expect(getClientIp(new Headers())).toBe('unknown')
  })

  it.each([
    ['strips the port from an ipv4 value', '203.0.113.10:1234', '203.0.113.10'],
    ['strips the port from a bracketed ipv6 value', '[2001:db8::1]:1234', '2001:db8::1'],
    ['strips the port from a genuine ipv4:port pair', '203.0.113.10:8443', '203.0.113.10']
  ])('%s', (_name, headerValue, expected) => {
    const headers = new Headers({ 'x-vercel-forwarded-for': headerValue })

    expect(getClientIp(headers)).toBe(expected)
  })

  it('does not truncate an IPv4-mapped IPv6 address', () => {
    // Regression: `.includes('.') && .includes(':')` matched this shape too,
    // wrongly treating it as "IPv4 with a port" and truncating it to `null`.
    const headers = new Headers({
      'x-vercel-forwarded-for': '::ffff:192.168.1.1'
    })

    expect(getClientIp(headers)).toBe('::ffff:192.168.1.1')
  })

  it('does not truncate a NAT64 address with an embedded IPv4 suffix', () => {
    // Regression: the same broad heuristic reduced this to the garbage
    // fragment "64" (everything before the first colon).
    const headers = new Headers({
      'x-vercel-forwarded-for': '64:ff9b::203.0.113.5'
    })

    expect(getClientIp(headers)).toBe('64:ff9b::203.0.113.5')
  })
})