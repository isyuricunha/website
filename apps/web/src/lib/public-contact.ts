// Public channels shown on the contact page; never derive these from private configuration.
export const publicContact = {
  email: 'me@yuricunha.com',
  github: 'https://github.com/isyuricunha',
  twitter: 'https://x.com/isyuricunha',
  linkedin: 'https://linkedin.com/in/isyuricunha'
} as const

export const publicContactHrefs = new Set<string>([
  `mailto:${publicContact.email}`,
  publicContact.github,
  publicContact.twitter,
  publicContact.linkedin
])

export const isPublicRepositoryHref = (href: string) =>
  /^https:\/\/github\.com\/isyuricunha\/[a-zA-Z0-9][a-zA-Z0-9_.-]*$/u.test(href)
