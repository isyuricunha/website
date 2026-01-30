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
  BoxesIcon,
  HeartPulseIcon,
  MessageCircleMoreIcon,
  ScrollTextIcon
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
      },
      {
        titleKey: 'audit_logs',
        url: '/admin/audit-logs',
        icon: ScrollTextIcon
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
      }
    ]
  }
] as const

export type SidebarGroup = (typeof ADMIN_SIDEBAR_LINKS)[number]
export type SidebarLink = SidebarGroup['links'][number]
