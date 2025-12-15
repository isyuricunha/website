'use client'

import { flags } from '@isyuricunha/env'
import { useTranslations } from '@isyuricunha/i18n/client'
import { ClockIcon } from 'lucide-react'

import { api } from '@/trpc/react'

const CodingHours = () => {
  const { status, data } = api.wakatime.get.useQuery(undefined, {
    enabled: flags.stats
  })
  const t = useTranslations()

  const hours = status === 'success' ? Math.round(data.seconds / 60 / 60) : 0

  return (
    <div className='shadow-feature-card flex flex-col gap-4 rounded-xl p-4 sm:gap-6 sm:p-5 lg:p-6'>
      <div className='flex items-center gap-2'>
        <ClockIcon className='size-[18px]' />
        <h2 className='text-sm sm:text-base'>{t('homepage.about-me.coding-hours')}</h2>
      </div>
      <div className='flex grow items-center justify-center text-3xl font-semibold sm:text-4xl'>
        {status === 'pending' ? '--' : null}
        {status === 'error' ? t('common.error') : null}
        {status === 'success' ? t('homepage.about-me.coding-hours-value', { count: hours }) : null}
      </div>
    </div>
  )
}

export default CodingHours
