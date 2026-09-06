import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn()
}))

vi.mock('@/lib/privacy/create-privacy-data-export', () => ({
  createPrivacyDataExport: vi.fn()
}))

vi.mock('@/lib/ratelimit', () => ({
  ratelimit: { limit: vi.fn() }
}))

vi.mock('@/lib/spam-detection', () => ({
  getClientIp: vi.fn()
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn() }
}))

describe('/api/account/data-export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without an authenticated session', async () => {
    const { getSession } = await import('@/lib/auth')
    const { createPrivacyDataExport } = await import('@/lib/privacy/create-privacy-data-export')
    vi.mocked(getSession).mockResolvedValue(null)

    const { GET } = await import('@/app/api/account/data-export/route')
    const response = await GET(new Request('https://yuricunha.com/api/account/data-export'))

    expect(response.status).toBe(401)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(createPrivacyDataExport).not.toHaveBeenCalled()
  })

  it('returns 429 when the authenticated user is rate limited', async () => {
    const { getSession } = await import('@/lib/auth')
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'user-1' } } as never)
    vi.mocked(getClientIp).mockReturnValue('203.0.113.1')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

    const { GET } = await import('@/app/api/account/data-export/route')
    const response = await GET(new Request('https://yuricunha.com/api/account/data-export'))

    expect(response.status).toBe(429)
    expect(ratelimit.limit).toHaveBeenCalledWith('privacy:data-export:user-1:203.0.113.1')
  })

  it('downloads a non-cacheable JSON document for only the session user', async () => {
    const { getSession } = await import('@/lib/auth')
    const { createPrivacyDataExport } = await import('@/lib/privacy/create-privacy-data-export')
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')

    vi.mocked(getSession).mockResolvedValue({ user: { id: 'user-1' } } as never)
    vi.mocked(getClientIp).mockReturnValue('203.0.113.1')
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(createPrivacyDataExport).mockResolvedValue({
      schemaVersion: 1,
      generatedAt: '2026-09-06T16:00:00.000Z',
      account: { email: 'alice@example.com' }
    } as never)

    const { GET } = await import('@/app/api/account/data-export/route')
    const response = await GET(new Request('https://yuricunha.com/api/account/data-export'))

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8')
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="yuricunha-data-2026-09-06.json"'
    )
    expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0')
    expect(response.headers.get('pragma')).toBe('no-cache')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('content-security-policy')).toBe("default-src 'none'; sandbox")
    expect(await response.json()).toEqual({
      schemaVersion: 1,
      generatedAt: '2026-09-06T16:00:00.000Z',
      account: { email: 'alice@example.com' }
    })
    expect(createPrivacyDataExport).toHaveBeenCalledWith('user-1')
  })
})
