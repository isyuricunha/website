import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
    mkdir: vi.fn()
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

describe('BlogService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getPostsByLocale returns empty array and does not log error when locale directory does not exist', async () => {
    const fs = (await import('fs/promises')).default
    const { logger } = await import('@/lib/logger')
    const { BlogService } = await import('@/lib/blog/blog-service')

    const err = Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' })
    vi.mocked(fs.readdir).mockRejectedValue(err as never)

    const posts = await BlogService.getPostsByLocale('fr')

    expect(posts).toEqual([])
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('getPost returns null and does not log error when post file does not exist', async () => {
    const fs = (await import('fs/promises')).default
    const { logger } = await import('@/lib/logger')
    const { BlogService } = await import('@/lib/blog/blog-service')

    const err = Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' })
    vi.mocked(fs.readFile).mockRejectedValue(err as never)

    const post = await BlogService.getPost('missing', 'fr')

    expect(post).toBeNull()
    expect(logger.error).not.toHaveBeenCalled()
  })
})
