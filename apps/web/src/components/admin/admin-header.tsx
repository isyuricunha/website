'use client'

import { SidebarTrigger } from '@isyuricunha/ui'

import LocaleSwitcher from '../layout/locale-switcher'

import AdminProfileDropdown from './admin-profile-dropdown'

const AdminHeader = () => {
  return (
    <header className='flex items-center justify-between py-4'>
      <SidebarTrigger variant='outline' />
      <div className='flex items-center gap-3'>
        <LocaleSwitcher />
        <AdminProfileDropdown />
      </div>
    </header>
  )
}

export default AdminHeader
