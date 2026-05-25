import type { SidebarGroup as SidebarGroupConfig } from '@/config/admin-sidebar-links'

import { useTranslations } from '@isyuricunha/i18n/client'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@isyuricunha/ui'

import AdminNavLink from './admin-nav-link'

type AdminNavGroupProps = SidebarGroupConfig

const AdminNavGroup = (props: AdminNavGroupProps) => {
  const { titleKey, links } = props
  const t = useTranslations('admin.nav')
  const label = t(titleKey)

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
