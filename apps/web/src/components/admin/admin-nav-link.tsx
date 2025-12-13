import type { SidebarLink } from '@/config/admin-sidebar-links'

import { useTranslations } from '@isyuricunha/i18n/client'
import { usePathname } from '@isyuricunha/i18n/routing'
import { SidebarMenuButton, SidebarMenuItem } from '@isyuricunha/ui'

import Link from '../link'

type AdminNavLinkProps = SidebarLink

const AdminNavLink = (props: AdminNavLinkProps) => {
  const { titleKey, url, icon: Icon } = props
  const t = useTranslations()
  const pathname = usePathname()
  const isActive = url === pathname

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} asChild>
        <Link href={url}>
          <Icon />
          <span>{t(`admin.nav.${titleKey}`)}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default AdminNavLink
