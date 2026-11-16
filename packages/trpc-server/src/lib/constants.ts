import { env } from '@isyuricunha/env'

export const isProduction = env.NODE_ENV === 'production'

export const SITE_URL = (
  globalThis.window === undefined
    ? (env.NEXT_PUBLIC_WEBSITE_URL ??
      (isProduction ? 'https://yuricunha.com' : 'http://localhost:3000'))
    : location.origin
).replace(/\/$/, '')

export const GITHUB_USERNAME = 'isyuricunha'
