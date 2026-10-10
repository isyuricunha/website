/**
 * Placeholder-secret detection for server secrets.
 *
 * `.env.example` documents `change-me-*` placeholders that satisfy the
 * `min(16)` schema gate, so a deployment copied from the example validates
 * while running on publicly-known values. Build-time validation deliberately
 * does NOT reject them (a hard error would break deploys); instead, security
 * boundaries treat placeholder-like values as unset at runtime (fail closed).
 */
export const is_placeholder_secret = (value: string | null | undefined): boolean => {
  if (!value) return true
  const normalized = value.trim().toLowerCase()
  return normalized.length === 0 || normalized.includes('change-me')
}
