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
})
