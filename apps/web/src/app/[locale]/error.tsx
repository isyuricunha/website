'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Button } from '@isyuricunha/ui'

import MainLayout from '@/components/main-layout'

type PageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const Page = (props: PageProps) => {
  const { error, reset } = props
  const t = useTranslations()

  return (
    <MainLayout>
      <div className='space-y-4 px-2 py-8'>
        <h1 className='text-2xl font-medium tracking-tighter'>{t('error.something-went-wrong')}</h1>
        <Button onClick={reset}>{t('error.try-again')}</Button>
        <p className='bg-bg-surface rounded-md border border-[var(--border-subtle)] p-4 break-words'>
          {error.message}
        </p>
      </div>
    </MainLayout>
  )
}

export default Page
