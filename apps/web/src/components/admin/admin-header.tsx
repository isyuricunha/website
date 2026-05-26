'use client'

import { SidebarTrigger } from '@isyuricunha/ui'

import LocaleSwitcher from '../layout/locale-switcher'

import AdminProfileDropdown from './admin-profile-dropdown'

const AdminHeader = () => {
  return (
    <header className='bg-bg-base sticky top-0 z-40 flex items-center justify-between py-4'>
      <div className='flex items-center gap-3'>
        <SidebarTrigger variant='outline' />
        <span className='label-mono hidden sm:inline'>Admin</span>
      </div>
      <div className='flex items-center gap-3'>
        <LocaleSwitcher />
        <AdminProfileDropdown />
      </div>
    </header>
  )
}

export default AdminHeader
