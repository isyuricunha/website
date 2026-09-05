import { createHash } from 'node:crypto'

/**
 * Salt used for one-way hashing of IP addresses before they are stored in
 * tables that never need the plaintext value back (currently only
 * `analytics_events`). Set a real secret in production via
 * `ANALYTICS_IP_HASH_SALT`; the fallback exists only so local/dev/test runs
 * without the env var configured still produce a stable (not reversible)
 * hash instead of throwing.
 */
const HASH_SALT = process.env.ANALYTICS_IP_HASH_SALT ?? 'yuricunha-analytics-dev-salt'

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
  return createHash('sha256').update(`${HASH_SALT}:${ip}`).digest('hex')
}
