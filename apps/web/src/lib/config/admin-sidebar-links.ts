// Admin sidebar navigation config. Icons are referenced by id and resolved by
// the shared lucide-style icon component.
export type SidebarLink = {
  titleKey?: string
  title?: string
  url: string
  icon: string
}

export type SidebarGroup = {
  titleKey: string
  links: SidebarLink[]
}

export const ADMIN_SIDEBAR_LINKS: SidebarGroup[] = [
  {
    titleKey: 'general',
    links: [
      { titleKey: 'dashboard', url: '/admin', icon: 'bar-chart-3' },
      { title: 'AI Settings', url: '/admin/configuration', icon: 'settings-2' },
      { titleKey: 'users', url: '/admin/users', icon: 'users' },
      { titleKey: 'comments', url: '/admin/comments', icon: 'messages-square' }
    ]
  },
  {
    titleKey: 'security',
    links: [
      { titleKey: 'security_management', url: '/admin/security', icon: 'shield' },
      { titleKey: 'audit_logs', url: '/admin/audit-logs', icon: 'scroll-text' }
    ]
  },
  {
    titleKey: 'communication',
    links: [
      { titleKey: 'communication', url: '/admin/communication', icon: 'message-circle-more' },
      { titleKey: 'email_marketing', url: '/admin/email-marketing', icon: 'send' },
      { titleKey: 'announcements', url: '/admin/announcements', icon: 'megaphone' },
      { titleKey: 'notifications', url: '/admin/notifications', icon: 'bell' }
    ]
  },
  {
    titleKey: 'monitoring',
    links: [
      { titleKey: 'monitoring_dashboard', url: '/admin/monitoring', icon: 'activity' },
      { titleKey: 'system_health', url: '/admin/system-health', icon: 'heart-pulse' }
    ]
  },
  {
    titleKey: 'data',
    links: [
      { titleKey: 'data_management', url: '/admin/data-management', icon: 'database' },
      { titleKey: 'bulk_operations', url: '/admin/bulk-operations', icon: 'boxes' }
    ]
  }
]
