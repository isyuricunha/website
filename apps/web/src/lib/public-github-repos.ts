import { env } from '@isyuricunha/env'

import { GITHUB_USERNAME } from '@/lib/constants'

type GithubRepo = {
  name: string
  description: string | null
  html_url: string
  stargazers_count: number | null
  language: string | null
  private: boolean
}

// Public GitHub data is the same for every visitor. The Next.js Data Cache
// prevents a server-side GitHub request for every page view / tRPC query.
export const getPublicGithubRepos = async () => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(env.GITHUB_TOKEN && { Authorization: `Bearer ${env.GITHUB_TOKEN}` })
        },
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub returned HTTP ${response.status}`)
    }

    const data = (await response.json()) as GithubRepo[]
    if (!Array.isArray(data)) {
      throw new TypeError('Unexpected GitHub repository response')
    }

    return data
      .filter((repo) => !repo.private)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stargazersCount: repo.stargazers_count,
        language: repo.language
      }))
  } catch {
    // An upstream outage should not break the pre-rendered public portfolio.
    return []
  }
}
