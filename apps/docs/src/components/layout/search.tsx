'use client'

import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandFooterTrigger,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Kbd,
  Logo
} from '@tszhong0411/ui'
import { cn } from '@tszhong0411/utils'
import { ComponentIcon, MoonIcon, SearchIcon, SunIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Fragment, useEffect, useState } from 'react'

import { SIDEBAR_LINKS } from '@/config/links'

const Search = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  const { setTheme } = useTheme()
  const router = useRouter()

  const runCommand = (command: () => void) => {
    setIsOpen(false)
    command()
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [])

  const isSelectingTheme = value === 'Light' || value === 'Dark'

  return (
    <>
      <Button
        variant='outline'
        className={cn(
          'bg-muted/50 text-muted-foreground hidden h-10 items-center justify-between gap-3 rounded-lg pr-2 font-normal sm:flex lg:w-64'
        )}
        onClick={() => setIsOpen(true)}
      >
        <span>Search documentation</span>
        <kbd className='bg-muted flex select-none gap-1 rounded-sm border px-1.5 font-mono text-xs font-medium'>
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='sm:hidden'
        onClick={() => setIsOpen(true)}
        aria-label='Search documentation'
      >
        <SearchIcon className='size-5' />
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} value={value} onValueChange={setValue}>
        <CommandInput placeholder='Type a command or search...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {SIDEBAR_LINKS.map((group) => (
            <Fragment key={group.title}>
              <CommandGroup heading={group.title}>
                {group.links.map((link) => (
                  <CommandItem
                    key={link.href}
                    value={link.text}
                    onSelect={() => runCommand(() => router.push(link.href))}
                  >
                    <ComponentIcon />
                    {link.text}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </Fragment>
          ))}
          <CommandGroup heading='Theme'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <SunIcon />
              Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <MoonIcon />
              Dark
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <Logo className='size-4' />
          <CommandFooterTrigger triggerKey={<Kbd keys={['enter']} className='py-0' />}>
            {isSelectingTheme ? 'Switch Theme' : 'Open Link'}
          </CommandFooterTrigger>
        </CommandFooter>
      </CommandDialog>
    </>
  )
}

export default Search
