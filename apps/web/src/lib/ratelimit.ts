import { Ratelimit } from '@upstash/ratelimit'

import { redis } from '@isyuricunha/kv'

export { ratelimit } from '@isyuricunha/kv'

export const contactRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true
})

// Newsletter sends a real confirmation email per request (double opt-in);
// a dedicated tight window prevents third-party inbox flooding without
// sharing the loose global 50/10s limiter.
export const newsletterRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true
})
