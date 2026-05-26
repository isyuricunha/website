'use client'

import { Link, ScrollArea } from '@isyuricunha/ui'
import { cva } from 'class-variance-authority'
import { usePathname } from 'next/navigation'

import { SIDEBAR_LINKS } from '../../config/links'

const sidebarLinkVariants = cva('block rounded-md px-3 py-2 transition-colors', {
  variants: {
    active: {
      true: 'bg-bg-surface text-text-primary border-[0.5px] border-[var(--border-subtle)] font-medium',
      false: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
    }
  }
})

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className='sticky top-14 max-h-[calc(100vh-3.5rem)] w-full py-8 text-sm max-md:hidden'>
      <ScrollArea className='h-full pr-4'>
        {SIDEBAR_LINKS.map((section) => (
          <div key={section.title} className='mb-8'>
            <div className='label-mono px-3'>{section.title}</div>
            <ul className='flex flex-col gap-1.5 py-4 text-sm font-normal'>
              {section.links.map((link) => (
                <li key={link.text}>
                  <Link
                    href={link.href}
                    className={sidebarLinkVariants({
                      active: pathname === link.href
                    })}
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </ScrollArea>
    </aside>
  )
}

export default Sidebar
