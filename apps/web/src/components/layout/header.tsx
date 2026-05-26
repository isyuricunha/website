'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { useRouter } from '@isyuricunha/i18n/routing'
import { Button, Logo } from '@isyuricunha/ui'
import { LayoutDashboard } from 'lucide-react'

import CommandMenu from '@/components/command-menu'
import SiteSearch from '@/components/site-search'
import { useSession } from '@/lib/auth-client'

import Link from '../link'

import AccountDropdown from './account-dropdown'
import LocaleSwitcher from './locale-switcher'
import MobileNav from './mobile-nav'
import Navbar from './navbar'
import NotificationsDropdown from './notifications-dropdown'

const Header = () => {
  const t = useTranslations()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const is_admin = !isPending && session?.user.role === 'admin'

  return (
    <header className='bg-bg-base fixed inset-x-0 top-0 z-40 border-b border-[var(--border-faint)]'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8'>
        <a
          href='#skip-nav'
          className='bg-bg-elevated focus-visible:ring-ring fixed top-4 left-4 -translate-y-20 rounded-sm border border-[var(--border-default)] p-2 text-sm font-medium transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2'
        >
          <span>{t('layout.skip-to-main-content')}</span>
        </a>
        <Link
          href='/'
          className='focus-visible:ring-ring flex items-center justify-center gap-1 rounded-lg p-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
          aria-label={t('layout.home')}
        >
          <Logo width={24} height={24} className='sm:h-7 sm:w-7' aria-hidden='true' />
        </Link>
        <div className='flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2'>
          <div className='hidden w-64 shrink-0 md:block'>
            <SiteSearch />
          </div>
          <Navbar />
          {is_admin ? (
            <Button
              variant='ghost'
              className='size-9 p-0'
              aria-label={t('layout.admin')}
              title={t('layout.admin')}
              onClick={() => router.push('/admin')}
            >
              <LayoutDashboard className='size-4' />
            </Button>
          ) : null}
          <NotificationsDropdown />
          <LocaleSwitcher />
          <AccountDropdown />
          <CommandMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header
