'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { usePathname } from '@tszhong0411/i18n/routing'
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@tszhong0411/ui'
import { cn } from '@tszhong0411/utils'
import { MenuIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { HEADER_LINKS } from '@/config/links'

import Link from '../link'

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations()

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className='flex size-9 items-center justify-center p-0 md:hidden'
          aria-label={t('layout.toggle-menu')}
          variant='ghost'
        >
          <MenuIcon className='size-4' />
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-[85vw] max-w-80 p-0'>
        <SheetHeader className='border-b p-4 sm:p-6'>
          <SheetTitle className='text-left text-lg font-semibold'>
            {t('layout.navigation')}
          </SheetTitle>
        </SheetHeader>

        <nav className='flex flex-col p-4 sm:p-6'>
          <ul className='space-y-1'>
            {HEADER_LINKS.map((link, index) => {
              const isActive = link.href === pathname

              return (
                <motion.li
                  key={link.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      {
                        'bg-accent text-accent-foreground': isActive,
                        'text-muted-foreground': !isActive
                      }
                    )}
                  >
                    <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>
                      {link.icon}
                    </span>
                    <span className='flex-1'>{t(`layout.${link.key}`)}</span>
                    {isActive && (
                      <motion.div
                        layoutId='mobile-nav-indicator'
                        className='bg-primary h-2 w-2 rounded-full'
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.li>
              )
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
