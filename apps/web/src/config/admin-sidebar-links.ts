import { 
  MessagesSquareIcon, 
  UsersIcon, 
  ShieldIcon, 
  MailIcon, 
  ActivityIcon, 
  DatabaseIcon,
  BarChart3Icon,
  SettingsIcon
} from 'lucide-react'

export const ADMIN_SIDEBAR_LINKS = [
  {
    titleKey: 'general',
    links: [
      {
        titleKey: 'dashboard',
        url: '/admin',
        icon: BarChart3Icon
      },
      {
        titleKey: 'users',
        url: '/admin/users',
        icon: UsersIcon
      },
      {
        titleKey: 'comments',
        url: '/admin/comments',
        icon: MessagesSquareIcon
      }
    ]
  },
  {
    titleKey: 'security',
    links: [
      {
        titleKey: 'security_management',
        url: '/admin/security',
        icon: ShieldIcon
      }
    ]
  },
  {
    titleKey: 'communication',
    links: [
      {
        titleKey: 'communication_management',
        url: '/admin/communication',
        icon: MailIcon
      }
    ]
  },
  {
    titleKey: 'monitoring',
    links: [
      {
        titleKey: 'monitoring_dashboard',
        url: '/admin/monitoring',
        icon: ActivityIcon
      }
    ]
  },
  {
    titleKey: 'data',
    links: [
      {
        titleKey: 'data_management',
        url: '/admin/data-management',
        icon: DatabaseIcon
      }
    ]
  }
] as const

export type SidebarGroup = (typeof ADMIN_SIDEBAR_LINKS)[number]
export type SidebarLink = SidebarGroup['links'][number]
