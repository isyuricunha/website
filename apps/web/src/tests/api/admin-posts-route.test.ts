import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock('@/lib/ratelimit', () => ({
  ratelimit: {
    limit: vi.fn()
  }
}))

vi.mock('@/lib/spam-detection', () => ({
  getClientIp: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn()
}))

vi.mock('@/lib/blog/blog-service', () => ({
  BlogService: {
    postExists: vi.fn(),
    savePost: vi.fn(),
    getPost: vi.fn(),
    deletePost: vi.fn()
  }
}))

describe('/api/admin/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    const { getSession } = await import('@/lib/auth')

    vi.mocked(getSession).mockResolvedValue(null as never)

    const { POST } = await import('@/app/api/admin/posts/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ slug: 'test', title: 'Test', content: 'Hello', locale: 'en' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    const { getSession } = await import('@/lib/auth')

    vi.mocked(getSession).mockResolvedValue({ user: { role: 'user' } } as never)

    const { POST } = await import('@/app/api/admin/posts/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ slug: 'test', title: 'Test', content: 'Hello', locale: 'en' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(403)
  })

  it('returns 429 when rate limited (POST)', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { getSession } = await import('@/lib/auth')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as never)
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as never)

    const { POST } = await import('@/app/api/admin/posts/route')

    const req = {
      headers: new Headers(),
      json: async () => ({
        slug: 'test',
        title: 'Test',
        content: 'Hello',
        locale: 'en'
      })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(429)
  })

  it('returns 400 on invalid payload (POST)', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { getSession } = await import('@/lib/auth')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as never)
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

    const { POST } = await import('@/app/api/admin/posts/route')

    const req = {
      headers: new Headers(),
      json: async () => ({ slug: '', title: '', content: '', locale: '' })
    } as unknown as Parameters<typeof POST>[0]

    const res = await POST(req)

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe('Invalid request format')
  })

  it('returns 400 on invalid query params (DELETE)', async () => {
    const { ratelimit } = await import('@/lib/ratelimit')
    const { getClientIp } = await import('@/lib/spam-detection')
    const { getSession } = await import('@/lib/auth')

    vi.mocked(getClientIp).mockReturnValue('1.2.3.4')
    vi.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as never)
    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as never)

    const { DELETE } = await import('@/app/api/admin/posts/route')

    const req = {
      headers: new Headers(),
      url: 'https://example.com/api/admin/posts'
    } as unknown as Parameters<typeof DELETE>[0]

    const res = await DELETE(req)

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe('Invalid request format')
  })
})
