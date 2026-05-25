import type { Metadata } from 'next'
import { WifiOff, Home } from 'lucide-react'
import { getTranslations, setRequestLocale } from '@isyuricunha/i18n/server'

import Link from '@/components/link'
import RefreshButton from './refresh-button'

type PageProps = {
  params: Promise<{
    locale: string
  }>
}

export const generateMetadata = async (props: PageProps): Promise<Metadata> => {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'offline' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    robots: 'noindex, nofollow'
  }
}

export default async function OfflinePage(props: PageProps) {
  const { locale } = await props.params
  setRequestLocale(locale)
  const t = await getTranslations('offline')

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
      <div className='mx-auto max-w-md space-y-6'>
        <WifiOff className='text-muted-foreground mx-auto size-16' />

        <div className='space-y-2'>
          <h1 className='text-2xl font-medium tracking-tighter'>{t('title')}</h1>
          <p className='text-muted-foreground'>{t('description')}</p>
        </div>

        <div className='space-y-3'>
          <RefreshButton />

          <Link
            href='/'
            className='text-text-secondary hover:bg-bg-hover hover:text-text-primary focus-visible:ring-offset-bg-base inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--border-default)] bg-transparent px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:border-[var(--border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50'
          >
            <Home className='size-4' />
            {t('go-home')}
          </Link>
        </div>

        <div className='text-muted-foreground space-y-1 text-sm'>
          <p>{t('available.title')}</p>
          <ul className='list-inside list-disc space-y-1'>
            <li>{t('available.cached-pages')}</li>
            <li>{t('available.loaded-content')}</li>
            <li>{t('available.search')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
