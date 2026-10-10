import { createHash } from 'node:crypto'

import { env } from '@isyuricunha/env'

import { logger } from '@/lib/logger'
import { is_placeholder_secret } from '@/lib/secrets'

/**
 * Salt used for one-way hashing of IP addresses before they are stored in
 * tables that never need the plaintext value back (currently only
 * `analytics_events`). Must be a real secret in production: hashing with a
 * publicly-known salt would make IPs trivially reversible. In production a
 * missing salt disables IP hashing (returns null) instead of using a
 * guessable value; the static fallback keeps local/dev/test runs working.
 */
const DEV_FALLBACK_SALT = 'yuricunha-analytics-dev-salt'

/**
 * One-way, deterministic hash for an IP address destined for a
 * statistics-only table (e.g. `analytics_events`).
 *
 * This is intentionally NOT used for tables the admin dashboard reads IPs
 * from to take action (`security_events`, `login_attempts`,
 * `ip_access_control`, `error_logs`) — those need the real address so an
 * admin can copy it into an IP block rule or correlate a login-attempt
 * pattern. Hashing there would break that workflow. See the Privacy Notice
 * (`/privacy`) for the user-facing explanation of this split.
 *
 * Deterministic (same IP -> same hash) so aggregate queries like "unique
 * visitors" still work without ever storing the plaintext address.
 */
export const hashIpForAnalytics = (ip: string | null | undefined): string | null => {
  if (!ip) return null

  const is_production = env.NODE_ENV === 'production'
  const configured = env.ANALYTICS_IP_HASH_SALT
  // A publicly-known placeholder salt makes hashes trivially reversible, so
  // in production it is treated exactly like a missing salt (fail closed).
  let salt: string | null = null
  if (configured && !(is_production && is_placeholder_secret(configured))) {
    salt = configured
  } else if (!is_production) {
    salt = DEV_FALLBACK_SALT
  }

  if (!salt) {
    logger.warn(
      'ANALYTICS_IP_HASH_SALT is not set (or is still the documented placeholder) in production: analytics IP hashing is disabled.'
    )
    return null
  }

  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}
