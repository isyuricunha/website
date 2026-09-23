import { env } from '@isyuricunha/env'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN
})

/**
 * The @upstash/ratelimit library resolves { success: true, reason: 'timeout' }
 * when Redis exceeds the configured timeout (default 5s): a degraded datastore
 * silently lets every request through, disabling all site rate limits at once.
 * This wrapper converts a timeout into a denial so limits fail CLOSED instead.
 */
export const withFailClosed = (limiter: Ratelimit): Ratelimit => {
  const originalLimit = limiter.limit.bind(limiter)

  const limit = async (identifier: string, req?: Parameters<Ratelimit['limit']>[1]) => {
    const result = await originalLimit(identifier, req)
    return result.reason === 'timeout' ? { ...result, success: false } : result
  }

  return new Proxy(limiter, {
    get(target, prop, receiver) {
      if (prop === 'limit') {
        return limit
      }
      return Reflect.get(target, prop, receiver)
    }
  })
}

// A short timeout keeps fail-closed denials snappy during Redis degradation.
export const ratelimit = withFailClosed(
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '10 s'),
    analytics: true,
    timeout: 2000
  })
)

export const redisKeys = {
  postViews: (slug: string) => `post:views:${slug}`,
  postViewCount: 'post:views:count',
  postLikes: (slug: string) => `post:likes:${slug}`,
  postLikeCount: 'post:likes:count',
  currentUserLikes: (slug: string, sessionId: string) =>
    `post:likes:${slug}:current-user-likes:${sessionId}`,
  newsletterConfirm: (token: string) => `newsletter:confirm:${token}`
}
