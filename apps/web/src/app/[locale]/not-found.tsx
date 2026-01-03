import type { Metadata } from 'next'

import { i18n } from '@isyuricunha/i18n/config'
import { getTranslations } from '@isyuricunha/i18n/server'

import GoToHomepage from '@/components/go-to-homepage'
import MainLayout from '@/components/main-layout'

type PageProps = {
  params?: Promise<{
    locale: string
  }>
}

export const generateMetadata = async (props: PageProps): Promise<Metadata> => {
  const locale = (await props.params)?.locale ?? i18n.defaultLocale
  const t = await getTranslations({ locale })

  return {
    title: t('not-found'),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false
      }
    }
  }
}

const NotFound = async (props: PageProps) => {
  const locale = (await props.params)?.locale ?? i18n.defaultLocale
  const t = await getTranslations({ locale })

  return (
    <MainLayout>
      <div className='mt-52 mb-40 flex flex-col items-center justify-center gap-12'>
        <h1 className='text-center text-6xl font-bold'>{t('not-found')}</h1>
        <GoToHomepage />
      </div>
    </MainLayout>
  )
}

export default NotFound
