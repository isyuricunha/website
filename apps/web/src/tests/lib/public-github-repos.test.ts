import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublicGithubRepos } from '@/lib/public-github-repos'

vi.mock('@isyuricunha/env', () => ({
  env: { GITHUB_TOKEN: 'test-token' }
}))
vi.mock('@/lib/constants', () => ({
  GITHUB_USERNAME: 'isyuricunha'
}))

describe('public GitHub repository cache', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('uses one cached fetch and filters private repositories', async () => {
    const fakeFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'public',
          description: 'description',
          html_url: 'https://example.com',
          stargazers_count: 5,
          language: 'TypeScript',
          private: false
        },
        {
          name: 'private',
          description: '',
          html_url: 'https://example.com/private',
          stargazers_count: 2,
          language: 'Go',
          private: true
        }
      ]
    } as Response)

    const repos = await getPublicGithubRepos()
    expect(repos).toHaveLength(1)
    expect(repos[0]?.name).toBe('public')
    expect(fakeFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/isyuricunha/repos?per_page=100'),
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })

  it('does not make public page rendering fail when GitHub is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('upstream unavailable'))
    await expect(getPublicGithubRepos()).resolves.toEqual([])
  })
})
