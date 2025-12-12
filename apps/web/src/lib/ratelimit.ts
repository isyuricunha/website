import { Ratelimit } from '@upstash/ratelimit'

import { ratelimit, redis } from '@tszhong0411/kv'

export { ratelimit }

export const contactRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true
})
