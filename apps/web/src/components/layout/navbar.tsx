'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { usePathname } from '@isyuricunha/i18n/routing'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@isyuricunha/ui'
import { cn } from '@isyuricunha/utils'
import { MenuIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { HEADER_LINKS } from '@/config/links'
import { calculate_visible_count } from '@/utils/navbar-overflow'

import Link from '../link'

const Navbar = () => {
  const pathname = usePathname()
  const t = useTranslations()

  const [visibleCount, setVisibleCount] = useState<number>(HEADER_LINKS.length)
  const containerRef = useRef<HTMLUListElement | null>(null)
  const measureLinksRef = useRef<HTMLUListElement | null>(null)
  const measureMoreRef = useRef<HTMLLIElement | null>(null)

  const { visibleLinks, overflowLinks } = useMemo(() => {
    return {
      visibleLinks: HEADER_LINKS.slice(0, visibleCount),
      overflowLinks: HEADER_LINKS.slice(visibleCount)
    }
  }, [visibleCount])

  const isOverflowActive = useMemo(() => {
    return overflowLinks.some((link) => link.href === pathname)
  }, [overflowLinks, pathname])

  useEffect(() => {
    const container = containerRef.current
    const measureLinks = measureLinksRef.current
    const measureMore = measureMoreRef.current

    if (!container || !measureLinks || !measureMore) {
      return
    }

    const gapPx = 8

    const recalc = () => {
      const availableWidth = container.getBoundingClientRect().width

      const itemWidths = Array.from(measureLinks.children).map(
        (el) => el.getBoundingClientRect().width
      )
      const moreWidth = measureMore.getBoundingClientRect().width

      const nextVisibleCount = calculate_visible_count({
        availableWidth,
        itemWidths,
        moreWidth,
        gapPx
      })
      setVisibleCount((prev) => (prev === nextVisibleCount ? prev : nextVisibleCount))
    }

    recalc()

    const ro = new ResizeObserver(() => recalc())
    ro.observe(container)

    return () => ro.disconnect()
  }, [t])

  return (
    <nav className='hidden min-w-0 flex-1 items-center md:flex'>
      <ul ref={containerRef} className='flex w-full min-w-0 justify-end gap-2 overflow-hidden'>
        {visibleLinks.map((link) => {
          const isActive = link.href === pathname

          return (
            <li key={link.key} className='flex h-16 items-center justify-center'>
              <Link
                className={cn('px-3 py-2 text-sm font-normal whitespace-nowrap transition-colors', {
                  'text-muted-foreground hover:text-foreground': !isActive,
                  'text-accent-earth-text': isActive
                })}
                href={link.href}
              >
                {t(`layout.${link.key}`)}
              </Link>
            </li>
          )
        })}

        {overflowLinks.length > 0 ? (
          <li className='flex h-16 items-center justify-center'>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className={cn(
                    'h-auto rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-transparent',
                    'focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none',
                    {
                      'text-muted-foreground hover:text-foreground': !isOverflowActive,
                      'text-accent-earth-text': isOverflowActive
                    }
                  )}
                  aria-label={t('layout.more')}
                >
                  <MenuIcon className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {overflowLinks.map((link) => {
                  const isActive = link.href === pathname

                  return (
                    <DropdownMenuItem
                      key={link.key}
                      asChild
                      className={cn({
                        'bg-accent text-accent-foreground': isActive
                      })}
                    >
                      <Link href={link.href} className='w-full'>
                        {t(`layout.${link.key}`)}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ) : null}
      </ul>

      <div className='pointer-events-none fixed top-0 left-0 -z-50 opacity-0' aria-hidden='true'>
        <ul ref={measureLinksRef} className='flex gap-2'>
          {HEADER_LINKS.map((link) => (
            <li key={link.key} className='flex h-16 items-center justify-center'>
              <span className='rounded-sm px-3 py-2 text-sm font-normal whitespace-nowrap'>
                {t(`layout.${link.key}`)}
              </span>
            </li>
          ))}
        </ul>
        <ul className='flex gap-2'>
          <li ref={measureMoreRef} className='flex h-16 items-center justify-center'>
            <span className='h-auto rounded-sm px-3 py-2 text-sm font-normal'>
              <MenuIcon className='size-4' />
            </span>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
