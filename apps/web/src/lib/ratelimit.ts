import { Ratelimit } from '@upstash/ratelimit'

import { redis } from '@isyuricunha/kv'

export { ratelimit } from '@isyuricunha/kv'

export const contactRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true
})
