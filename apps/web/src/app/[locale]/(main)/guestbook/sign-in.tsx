'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Button } from '@isyuricunha/ui'

import { useDialogsStore } from '@/store/dialogs'

const SignIn = () => {
  const t = useTranslations()
  const { setIsSignInOpen } = useDialogsStore()

  return (
    <>
      <Button
        className='bg-email-button text-primary-foreground inline-block font-extrabold'
        onClick={() => setIsSignInOpen(true)}
      >
        {t('common.sign-in')}
      </Button>
      <span className='ml-2'>{t('guestbook.signin.description')}</span>
    </>
  )
}

export default SignIn
