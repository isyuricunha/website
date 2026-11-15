// Header/footer link config without the React icon elements: icons are
// lucide SVG path strings rendered by the components that need them.
type HeaderLink = {
  href: string
  key: string
  icon: string
}

const iconPaths = {
  pencil:
    'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.108a.5.5 0 0 0 .623.622l4.108-1.32a2 2 0 0 0 .83-.497z|m15 5 4 4',
  code: 'm16 18 6-6-6-6|m8 6-6 6 6 6',
  messageCircle: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
  flame:
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  userCircle:
    'M18 20a6 6 0 0 0-12 0|M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
  calendar:
    'M8 2v4|M16 2v4|M3 10h18|M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  monitor:
    'M8 21h8|M12 17v4|M3 5h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  music: 'M9 18V5l12-2v13|M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z|M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  sparkles:
    'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z|M20 3v4|M22 5h-4|M4 17v2|M5 18H3'
}

export const HEADER_LINKS: Array<HeaderLink> = [
  { href: '/blog', key: 'blog', icon: iconPaths.pencil },
  { href: '/snippet', key: 'snippets', icon: iconPaths.code },
  { href: '/guestbook', key: 'guestbook', icon: iconPaths.messageCircle },
  { href: '/projects', key: 'projects', icon: iconPaths.flame },
  { href: '/about', key: 'about', icon: iconPaths.userCircle },
  { href: '/now', key: 'now', icon: iconPaths.calendar },
  { href: '/uses', key: 'uses', icon: iconPaths.monitor },
  { href: '/music', key: 'music', icon: iconPaths.music },
  { href: '/recap', key: 'recap', icon: iconPaths.sparkles }
]

export type FooterLink = { href: string; key: string }

export const FOOTER_LINKS: Array<{ id: number; links: Array<FooterLink> }> = [
  {
    id: 1,
    links: [
      { href: '/', key: 'home' },
      { href: '/blog', key: 'blog' },
      { href: '/snippet', key: 'snippets' },
      { href: '/about', key: 'about' },
      { href: '/contact', key: 'contact' }
    ]
  },
  {
    id: 2,
    links: [
      { href: '/guestbook', key: 'guestbook' },
      { href: '/now', key: 'now' },
      { href: '/uses', key: 'uses' },
      { href: '/projects', key: 'projects' },
      { href: '/music', key: 'music' },
      { href: '/recap', key: 'recap' },
      { href: '/sitemap', key: 'sitemap' },
      { href: '/privacy', key: 'privacy' }
    ]
  },
  {
    id: 3,
    links: [
      { href: 'https://github.com/isyuricunha', key: 'github' },
      { href: 'https://links.yuricunha.com', key: 'links' }
    ]
  }
]
