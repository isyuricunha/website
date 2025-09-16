import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@tszhong0411/kv'

export const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})
