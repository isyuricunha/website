'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Button } from '@isyuricunha/ui'
import { RefreshCw } from 'lucide-react'

export default function RefreshButton() {
  const t = useTranslations('offline')

  return (
    <Button onClick={() => location.reload()} className='w-full gap-2'>
      <RefreshCw className='size-4' />
      {t('try-again')}
    </Button>
  )
}
