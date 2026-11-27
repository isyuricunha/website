import { Octokit } from '@octokit/rest'
import { env } from '@isyuricunha/env'
import { ratelimit } from '@isyuricunha/kv'

import { GITHUB_USERNAME } from '@/lib/constants'
import { getPublicGithubRepos } from '@/lib/public-github-repos'
import { getIp } from '@/utils/get-ip'

import { enforceRateLimit } from '../rate-limit'
import { createTRPCRouter, publicProcedure } from '../trpc'

const getKey = (id: string) => `github:${id}`

// The isyuricunha account is spam-flagged upstream, so GitHub API lookups of it can 404 (and rate limits happen): failures here can be upstream conditions, not site bugs.
export const githubRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    await enforceRateLimit(ratelimit, getKey(ip))

    const octokit = new Octokit({ auth: env.GITHUB_TOKEN })

    const { data: repos } = await octokit.request('GET /users/{username}/repos', {
      username: GITHUB_USERNAME,
      per_page: 100
    })

    const { data: user } = await octokit.request('GET /users/{username}', {
      username: GITHUB_USERNAME
    })

    const stars = repos
      .filter((repo) => !repo.fork)
      .reduce((acc, repo) => acc + (repo.stargazers_count ?? 0), 0)

    const followers = user.followers

    return { stars, followers }
  }),

  getRepoStars: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    await enforceRateLimit(ratelimit, getKey(ip))

    const repos = await getPublicGithubRepos()
    return repos.find((repo) => repo.name === 'website')?.stargazersCount ?? 0
  }),

  getRepos: publicProcedure.query(async ({ ctx }) => {
    const ip = getIp(ctx.headers)
    await enforceRateLimit(ratelimit, getKey(ip))

    return getPublicGithubRepos()
  })
})
