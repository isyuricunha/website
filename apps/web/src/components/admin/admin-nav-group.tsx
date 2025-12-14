import type { SidebarGroup as SidebarGroupConfig } from '@/config/admin-sidebar-links'

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@isyuricunha/ui'

import AdminNavLink from './admin-nav-link'

const humanize_title_key = (titleKey: string) => {
  return titleKey
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

type AdminNavGroupProps = SidebarGroupConfig

const AdminNavGroup = (props: AdminNavGroupProps) => {
  const { titleKey, links } = props
  const label = humanize_title_key(titleKey)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {links.map((link) => (
            <AdminNavLink key={link.titleKey} {...link} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default AdminNavGroup
