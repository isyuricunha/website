import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => {
  return {
    getSession: vi.fn(async () => null)
  }
})

vi.mock('@isyuricunha/env', () => {
  return {
    flags: {
      comment: false,
      auth: false,
      stats: false,
      spotify: false,
      spotifyImport: false,
      gemini: false,
      groq: false,
      hf: false,
      hfLocal: false,
      ollama: false,
      analytics: false,
      guestbookNotification: false,
      likeButton: false,
      turnstile: false
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/test',
      UPSTASH_REDIS_REST_URL: 'https://example.com',
      UPSTASH_REDIS_REST_TOKEN: 'token',
      RESEND_API_KEY: 'token'
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

type UserRow = {
  id: string
  username: string | null
  name: string
  image: string | null
  bio: string | null
  isPublic: boolean
  nameColor: string | null
  nameEffect: 'none' | 'rays' | 'glow'
  role: 'user' | 'admin'
}

type CommentRow = {
  id: string
  body: string
  createdAt: Date
  postId: string
  parentId: string | null
  post?: {
    title: string | null
    slug: string
  } | null
}

describe('usersRouter public profile', () => {
  it('getPublicProfile resolves by username (case-insensitive) and returns image fallback', async () => {
    const { usersRouter } = await import('@/trpc/routers/users')

    const user: UserRow = {
      id: 'user-1',
      username: 'Yuri',
      name: 'Yuri Cunha',
      image: null,
      bio: 'hello',
      isPublic: true,
      nameColor: '#ff0000',
      nameEffect: 'glow',
      role: 'user'
    }

    const db = {
      query: {
        users: {
          findFirst: vi
            .fn()
            .mockResolvedValueOnce(user) // username lookup
            .mockResolvedValueOnce(null) // id lookup fallback not used
        }
      }
    }

    const caller = usersRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-locale': 'en' })
    } as unknown as Parameters<typeof usersRouter.createCaller>[0])

    const result = await caller.getPublicProfile({ handle: 'yuri' })

    expect(result.id).toBe('user-1')
    expect(result.username).toBe('Yuri')
    expect(result.image).toBe('/api/avatar/user-1')
  })

  it('getPublicProfile resolves by id when username not found', async () => {
    const { usersRouter } = await import('@/trpc/routers/users')

    const user: UserRow = {
      id: 'user-2',
      username: null,
      name: 'Someone',
      image: 'https://example.com/a.png',
      bio: null,
      isPublic: true,
      nameColor: null,
      nameEffect: 'none',
      role: 'user'
    }

    const db = {
      query: {
        users: {
          findFirst: vi
            .fn()
            .mockResolvedValueOnce(null) // username lookup
            .mockResolvedValueOnce(user) // id lookup
        }
      }
    }

    const caller = usersRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-locale': 'en' })
    } as unknown as Parameters<typeof usersRouter.createCaller>[0])

    const result = await caller.getPublicProfile({ handle: 'user-2' })
    expect(result.id).toBe('user-2')
    expect(result.image).toBe('https://example.com/a.png')
  })

  it('getInfiniteUserComments returns mapped comments and cursor', async () => {
    const { usersRouter } = await import('@/trpc/routers/users')

    const now = new Date('2025-01-01T00:00:00.000Z')
    const earlier = new Date('2024-12-31T00:00:00.000Z')

    const db = {
      query: {
        users: {
          findFirst: vi.fn().mockResolvedValueOnce({ id: 'user-1' })
        },
        comments: {
          findMany: vi.fn(async () => {
            const rows: CommentRow[] = [
              {
                id: 'c1',
                body: 'hello',
                createdAt: now,
                postId: 'my-post',
                parentId: null,
                post: { slug: 'my-post', title: 'My Post' }
              },
              {
                id: 'c2',
                body: 'reply',
                createdAt: earlier,
                postId: 'my-post',
                parentId: 'c1',
                post: { slug: 'my-post', title: 'My Post' }
              }
            ]

            return rows as unknown as any
          })
        }
      }
    }

    const caller = usersRouter.createCaller({
      db: db as unknown,
      headers: new Headers({ 'x-locale': 'en' })
    } as unknown as Parameters<typeof usersRouter.createCaller>[0])

    const result = await caller.getInfiniteUserComments({
      handle: 'user-1',
      limit: 10
    })

    expect(result.comments).toHaveLength(2)
    expect(result.comments[0]?.post.url).toContain('/blog/my-post')
    expect(result.nextCursor).toEqual(earlier)
    expect(result.comments[0]?.type).toBe('comment')
    expect(result.comments[1]?.type).toBe('reply')
  })
})
