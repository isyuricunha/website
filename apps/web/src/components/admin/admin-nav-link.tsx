import type { SidebarLink } from '@/config/admin-sidebar-links'

import { usePathname } from '@isyuricunha/i18n/routing'
import { SidebarMenuButton, SidebarMenuItem } from '@isyuricunha/ui'

import Link from '../link'

const humanize_title_key = (titleKey: string) => {
  return titleKey
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

type AdminNavLinkProps = SidebarLink

const AdminNavLink = (props: AdminNavLinkProps) => {
  const { titleKey, url, icon: Icon } = props
  const pathname = usePathname()
  const isActive = url === pathname
  const label = humanize_title_key(titleKey)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} asChild>
        <Link href={url}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default AdminNavLink
