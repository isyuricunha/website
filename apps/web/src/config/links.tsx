import { type IconType, SiGithub, SiX } from '@icons-pack/react-simple-icons'
import {
  FlameIcon,
  MessageCircleIcon,
  MonitorIcon,
  MusicIcon,
  PencilIcon,
  UserCircleIcon
} from 'lucide-react'

import { SITE_GITHUB_URL, SITE_X_URL } from '@/lib/constants'

type SocialLinks = Array<{
  href: string
  title: string
  icon: IconType
}>

export const HEADER_LINKS = [
  {
    icon: <PencilIcon className='size-3.5' />,
    href: '/blog',
    key: 'blog'
  },
  {
    icon: <MessageCircleIcon className='size-3.5' />,
    href: '/guestbook',
    key: 'guestbook'
  },

  {
    icon: <FlameIcon className='size-3.5' />,
    href: '/projects',
    key: 'projects'
  },
  {
    icon: <UserCircleIcon className='size-3.5' />,
    href: '/about',
    key: 'about'
  },
  {
    icon: <MonitorIcon className='size-3.5' />,
    href: '/uses',
    key: 'uses'
  },
  {
    icon: <MusicIcon className='size-3.5' />,
    href: '/spotify',
    key: 'spotify'
  }
] as const

export const FOOTER_LINKS = [
  {
    id: 1,
    links: [
      { href: '/', key: 'home' },
      { href: '/blog', key: 'blog' },
      { href: '/about', key: 'about' },
      { href: '/contact', key: 'contact' }
    ]
  },
  {
    id: 2,
    links: [
      { href: '/guestbook', key: 'guestbook' },
      { href: '/uses', key: 'uses' },
      { href: '/projects', key: 'projects' },
      { href: '/spotify', key: 'spotify' },
      { href: '/sitemap', key: 'sitemap' }
    ]
  },
  {
    id: 3,
    links: [
      { href: SITE_GITHUB_URL, key: 'github' },
      { href: 'https://links.yuricunha.com', key: 'links' }
    ]
  }
] as const

export const SOCIAL_LINKS: SocialLinks = [
  {
    href: SITE_GITHUB_URL,
    title: 'GitHub',
    icon: SiGithub
  },
  {
    href: SITE_X_URL,
    title: 'X',
    icon: SiX
  }
]
