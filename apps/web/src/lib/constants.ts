import { env } from '@isyuricunha/env'

export const isProduction = env.NODE_ENV === 'production'

export const SITE_URL = (env.NEXT_PUBLIC_WEBSITE_URL ??
  (isProduction ? 'https://yuricunha.com' : 'http://localhost:3000'))
  .replace(/\/$/, '')

export const GITHUB_USERNAME = 'isyuricunha'

export const SITE_NAME = 'Yuri Cunha'
export const SITE_DESCRIPTION =
  'Yuri Cunha — Senior Cloud & Infrastructure Architect. Sharing projects, articles, and notes on web development.'
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
