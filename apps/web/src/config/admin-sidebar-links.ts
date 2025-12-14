import {
  MessagesSquareIcon,
  UsersIcon,
  ShieldIcon,
  ActivityIcon,
  DatabaseIcon,
  BarChart3Icon,
  MegaphoneIcon,
  BellIcon,
  SendIcon,
  FileTextIcon,
  FilesIcon,
  BoxesIcon,
  WrenchIcon,
  HeartPulseIcon,
  MessageCircleMoreIcon
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
        titleKey: 'posts',
        url: '/admin/posts',
        icon: FileTextIcon
      },
      {
        titleKey: 'content',
        url: '/admin/content',
        icon: FilesIcon
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
        titleKey: 'communication',
        url: '/admin/communication',
        icon: MessageCircleMoreIcon
      },
      {
        titleKey: 'email_marketing',
        url: '/admin/email-marketing',
        icon: SendIcon
      },
      {
        titleKey: 'announcements',
        url: '/admin/announcements',
        icon: MegaphoneIcon
      },
      {
        titleKey: 'notifications',
        url: '/admin/notifications',
        icon: BellIcon
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
      },
      {
        titleKey: 'system_health',
        url: '/admin/system-health',
        icon: HeartPulseIcon
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
      },
      {
        titleKey: 'bulk_operations',
        url: '/admin/bulk-operations',
        icon: BoxesIcon
      },
      {
        titleKey: 'configuration',
        url: '/admin/configuration',
        icon: WrenchIcon
      }
    ]
  }
] as const

export type SidebarGroup = (typeof ADMIN_SIDEBAR_LINKS)[number]
export type SidebarLink = SidebarGroup['links'][number]
