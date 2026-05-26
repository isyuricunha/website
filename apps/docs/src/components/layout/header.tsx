import { Link } from '@isyuricunha/ui'

import { HEADER_LINKS } from '@/config/links'

import MobileNav from './mobile-nav'
import Search from './search'

const Header = () => {
  return (
    <header className='bg-bg-base sticky top-0 z-50 w-full border-b-[0.5px] border-[var(--border-faint)]'>
      <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8'>
        <div className='flex items-center gap-2 font-medium md:gap-6'>
          <MobileNav />
          <Link href='/' className='font-medium tracking-tighter max-md:hidden'>
            @isyuricunha/docs
          </Link>
          <nav>
            <ul className='flex gap-4 text-sm lg:gap-6'>
              {HEADER_LINKS.map((link) => (
                <li
                  key={link.text}
                  className='text-text-secondary hover:text-text-primary transition-colors'
                >
                  <Link href={link.href}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className='flex items-center gap-1 sm:gap-3'>
          <Search />
        </div>
      </div>
    </header>
  )
}

export default Header
