// Node runtime detection without the Next-specific env package; the shared
// env package migration (PUBLIC_ prefixed variables) lands with the backend
// stage.
export const isProduction = process.env.NODE_ENV === 'production'

export const SITE_URL = (isProduction ? 'https://yuricunha.com' : 'http://localhost:3010').replace(
  /\/$/,
  ''
)

export const GITHUB_USERNAME = 'isyuricunha'

export const SITE_NAME = 'Yuri Cunha'
export const SITE_DESCRIPTION =
  'Yuri Cunha — Infrastructure & Platform Engineer. Building and operating systems from hardware to services.'
export const SITE_KEYWORDS = [
  'isyuricunha',
  'Yuri Cunha',
  'TypeScript',
  'Node.js',
  'Infrastructure'
]

export const SITE_GITHUB_URL = 'https://github.com/isyuricunha'
export const SITE_X_URL = 'https://x.com/isyuricunha'
