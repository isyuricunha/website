const isProduction = process.env.NODE_ENV === 'production'

export const SITE_URL = isProduction ? 'https://docs.yuricunha.com' : 'http://localhost:3002'
export const SITE_TITLE = 'Docs | Yuri Cunha — Infrastructure & Platform Engineer'
export const SITE_DESCRIPTION =
  "Documentation and resources for Yuri's projects, systems, and experiments."
export const SITE_KEYWORDS = [
  'isyuricunha',
  'Web Development',
  'Programming',
  'UI/UX Design',
  'GitHub projects',
  'Documentation'
]
