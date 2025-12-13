'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Logo } from '@tszhong0411/ui'
import { cn } from '@tszhong0411/utils'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import CommandMenu from '@/components/command-menu'
import SiteSearch from '@/components/site-search'

import Link from '../link'

import LocaleSwitcher from './locale-switcher'
import MobileNav from './mobile-nav'
import Navbar from './navbar'
import ThemeSwitcher from './theme-switcher'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    const changeBackground = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    document.addEventListener('scroll', changeBackground)

    return () => document.removeEventListener('scroll', changeBackground)
  }, [])

  return (
    <motion.header
      className={cn(
        'bg-background/30 shadow-xs fixed inset-x-0 top-2 z-40 mx-2 flex h-[56px] max-w-5xl items-center justify-between rounded-xl px-4 saturate-100 backdrop-blur-[10px] transition-colors sm:top-4 sm:mx-auto sm:h-[60px] sm:rounded-2xl sm:px-6 lg:px-8',
        isScrolled && 'bg-background/80'
      )}
      initial={{
        y: -100
      }}
      animate={{
        y: 0
      }}
      transition={{
        duration: 0.3
      }}
    >
      <a
        href='#skip-nav'
        className='bg-background focus-visible:ring-ring rounded-xs shadow-xs focus-visible:ring-3 fixed left-4 top-4 -translate-y-20 border p-2 font-medium transition-transform focus-visible:translate-y-0 focus-visible:ring-offset-2'
      >
        <span>{t('layout.skip-to-main-content')}</span>
      </a>
      <Link
        href='/'
        className='focus-visible:ring-ring flex items-center justify-center gap-1 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
        aria-label={t('layout.home')}
      >
        <Logo width={24} height={24} className='sm:h-7 sm:w-7' aria-hidden='true' />
      </Link>
      <div className='flex items-center gap-1 sm:gap-2'>
        <div className='hidden w-64 md:block'>
          <SiteSearch />
        </div>
        <Navbar />
        <ThemeSwitcher />
        <LocaleSwitcher />
        <CommandMenu />
        <MobileNav />
      </div>
    </motion.header>
  )
}

export default Header
