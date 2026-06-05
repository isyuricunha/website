'use client'

import { Sidebar, SidebarContent, SidebarHeader } from '@isyuricunha/ui'
import { useTranslations } from '@isyuricunha/i18n/client'

import { ADMIN_SIDEBAR_LINKS } from '@/config/admin-sidebar-links'

import AdminNavGroup from './admin-nav-group'

const AdminSidebar = () => {
  const t = useTranslations()

  return (
    <Sidebar collapsible='icon' variant='floating'>
      <SidebarHeader className='border-b-[0.5px] border-[var(--border-faint)] px-3 py-4'>
        <span className='label-mono'>{t('admin.sidebar.control')}</span>
      </SidebarHeader>
      <SidebarContent>
        {ADMIN_SIDEBAR_LINKS.map((group) => (
          <AdminNavGroup key={group.titleKey} {...group} />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

export default AdminSidebar
