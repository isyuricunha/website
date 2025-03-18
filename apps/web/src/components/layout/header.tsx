'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Logo } from '@tszhong0411/ui'
import { cn } from '@tszhong0411/utils'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import CommandMenu from '@/components/command-menu'

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
        'bg-background/30 shadow-xs fixed inset-x-0 top-4 z-40 mx-auto flex h-[60px] max-w-5xl items-center justify-between rounded-2xl px-8 saturate-100 backdrop-blur-[10px] transition-colors',
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
        className='flex items-center justify-center gap-1'
        aria-label={t('layout.home')}
      >
        <Logo width={28} height={28} aria-hidden='true' />
      </Link>
      <div className='flex items-center gap-2'>
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
