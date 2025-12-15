'use client'

import { flags } from '@isyuricunha/env'
import { useFormatter, useTranslations } from '@isyuricunha/i18n/client'
import { linkVariants } from '@isyuricunha/ui'
import { StarIcon } from 'lucide-react'

import { FOOTER_LINKS } from '@/config/links'
import { api } from '@/trpc/react'

import Link from '../link'

import NowPlaying from './now-playing'

const Footer = () => {
  const { status, data } = api.github.getRepoStars.useQuery(undefined, {
    staleTime: 1000 * 60 * 60
  })
  const t_layout = useTranslations('layout')
  const t_common = useTranslations('common')
  const format = useFormatter()

  return (
    <footer className='bg-background/30 shadow-xs relative mx-auto mb-6 flex w-full max-w-5xl flex-col rounded-2xl p-8 saturate-100 backdrop-blur-[10px]'>
      {flags.spotify ? <NowPlaying /> : null}
      <div className='mt-12 grid grid-cols-2 sm:grid-cols-3'>
        {FOOTER_LINKS.map((list) => (
          <div key={list.id} className='mb-10 flex flex-col items-start gap-4 pr-4'>
            {list.links.map((link) => {
              const { href, key } = link

              return (
                <Link key={href} href={href} className={linkVariants({ variant: 'muted' })}>
                  {t_layout(key)}
                </Link>
              )
            })}
          </div>
        ))}
      </div>
      <div className='mt-20 flex items-center justify-between text-xs sm:text-sm'>
        <div>Yuri Cunha | &copy; {new Date().getFullYear()}</div>
        <Link
          href='https://github.com/isyuricunha/website'
          className='flex items-center justify-center overflow-hidden rounded-md border'
        >
          <div className='bg-muted flex h-8 items-center gap-2 border-r px-2'>
            <StarIcon className='size-4' />
            <span className='font-medium'>{t_layout('star')}</span>
          </div>
          <div className='bg-background flex h-8 items-center px-3'>
            {status === 'pending' ? '--' : null}
            {status === 'error' ? t_common('error') : null}
            {status === 'success'
              ? format.number(data, {
                notation: 'compact',
                minimumFractionDigits: 0,
                maximumFractionDigits: 1
              })
              : null}
          </div>
        </Link>
      </div>
    </footer>
  )
}

export default Footer
