import {
  type IconType,
  SiGithub,
  SiPixelfed,
  SiMastodon,
  SiYoutube
} from '@icons-pack/react-simple-icons'
import {
  BarChartIcon,
  FlameIcon,
  MessageCircleIcon,
  MonitorIcon,
  PencilIcon,
  UserCircleIcon
} from 'lucide-react'

import {
  // SITE_FACEBOOK_URL,
  SITE_GITHUB_URL,
  SITE_PIXELFED_URL,
  SITE_MASTODON_URL,
  SITE_YOUTUBE_URL
} from '@/lib/constants'

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
    icon: <BarChartIcon className='size-3.5' />,
    href: '/dashboard',
    key: 'dashboard'
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
  }
] as const

export const FOOTER_LINKS = [
  {
    id: 1,
    links: [
      { href: '/', key: 'home' },
      { href: '/blog', key: 'blog' },
      { href: '/about', key: 'about' },
      { href: '/dashboard', key: 'dashboard' }
    ]
  },
  {
    id: 2,
    links: [
      { href: '/guestbook', key: 'guestbook' },
      { href: '/uses', key: 'uses' },
      { href: '/projects', key: 'projects' },
      { href: 'https://links.yuricunha.com', key: 'links' }
    ]
  },
  {
    id: 3,
    links: [
      // { href: SITE_FACEBOOK_URL, key: 'facebook' },
      { href: SITE_PIXELFED_URL, key: 'pixelfed' },
      { href: SITE_GITHUB_URL, key: 'github' },
      { href: SITE_YOUTUBE_URL, key: 'youtube' }
    ]
  }
] as const

export const SOCIAL_LINKS: SocialLinks = [
  {
    href: SITE_GITHUB_URL,
    title: 'GitHub',
    icon: SiGithub
  },
  // {
  //   href: SITE_FACEBOOK_URL,
  //   title: 'Facebook',
  //   icon: SiFacebook
  // },
  {
    href: SITE_PIXELFED_URL,
    title: 'Pixelfed',
    icon: SiPixelfed
  },
  {
    href: SITE_MASTODON_URL,
    title: 'X',
    icon: SiMastodon
  },
  {
    href: SITE_YOUTUBE_URL,
    title: 'YouTube',
    icon: SiYoutube
  }
]
