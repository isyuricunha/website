import { useTranslations } from '@isyuricunha/i18n/client'
import { Button } from '@isyuricunha/ui'

import { useDialogsStore } from '@/store/dialogs'

const UnauthorizedOverlay = () => {
  const t = useTranslations()
  const { setIsSignInOpen } = useDialogsStore()

  return (
    <div className='bg-bg-base/70 absolute inset-0 flex items-center justify-center rounded-lg'>
      <Button size='sm' onClick={() => setIsSignInOpen(true)}>
        {t('common.sign-in')}
      </Button>
    </div>
  )
}

export default UnauthorizedOverlay
