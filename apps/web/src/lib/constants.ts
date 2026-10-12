import { env } from '@isyuricunha/env'

export const isProduction = env.NODE_ENV === 'production'

export const SITE_URL = (
  globalThis.window === undefined
    ? env.NEXT_PUBLIC_WEBSITE_URL ??
      (isProduction ? 'https://yuricunha.com' : 'http://localhost:3000')
    : location.origin
).replace(/\/$/, '')

export const GITHUB_USERNAME = 'isyuricunha'

export const SITE_NAME = 'Yuri Cunha'
export const SITE_DESCRIPTION =
  'Yuri Cunha — Infrastructure & Platform Engineer. Building and operating systems from hardware to services.'
export const SITE_KEYWORDS = [
  'isyuricunha',
  'Yuri Cunha',
  'Next.js',
  'React',
  'TypeScript',
  'Node.js'
]

export const SITE_GITHUB_URL = 'https://github.com/isyuricunha'
export const SITE_X_URL = 'https://x.com/isyuricunha'
