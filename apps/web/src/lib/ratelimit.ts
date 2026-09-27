import { Ratelimit } from '@upstash/ratelimit'

import { redis, withFailClosed } from '@isyuricunha/kv'

export { ratelimit, telemetryRatelimit } from '@isyuricunha/kv'

export const contactRatelimit = withFailClosed(
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    timeout: 2000
  })
)

// Newsletter sends a real confirmation email per request (double opt-in);
// a dedicated tight window prevents third-party inbox flooding without
// sharing the loose global 50/10s limiter.
export const newsletterRatelimit = withFailClosed(
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    timeout: 2000
  })
)

// Password-protected destructive operations (disabling 2FA) get a tight
// window so a stolen session cannot brute-force the account password.
export const securityRatelimit = withFailClosed(
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    timeout: 2000
  })
)
