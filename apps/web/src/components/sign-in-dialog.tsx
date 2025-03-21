'use client'

import { SiGithub } from '@icons-pack/react-simple-icons'
import { useTranslations } from '@tszhong0411/i18n/client'
import { usePathname } from '@tszhong0411/i18n/routing'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  toast
} from '@tszhong0411/ui'
import { useEffect, useState } from 'react'

import { signIn } from '@/lib/auth-client'
import { useDialogsStore } from '@/store/dialogs'

type Provider = 'github' | 'google'

const GoogleIcon = () => {
  return (
    <svg
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 48 48'
      className='mr-3 size-6'
    >
      <path
        fill='#EA4335'
        d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
      />
      <path
        fill='#4285F4'
        d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
      />
      <path
        fill='#FBBC05'
        d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
      />
      <path
        fill='#34A853'
        d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
      />
      <path fill='none' d='M0 0h48v48H0z' />
    </svg>
  )
}

const SignInDialog = () => {
  const { isSignInOpen, setIsSignInOpen } = useDialogsStore()
  const [isPending, setIsPending] = useState(false)
  const [lastUsedProvider, setLastUsedProvider] = useState<Provider | null>(null)
  const t = useTranslations()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      const provider = localStorage.getItem('last-used-provider') as Provider | null
      setLastUsedProvider(provider)
    }
  }, [])

  const handleSignIn = async (provider: Provider) => {
    localStorage.setItem('last-used-provider', provider)
    await signIn.social({
      provider,
      callbackURL: pathname,
      fetchOptions: {
        onSuccess: () => {
          setIsPending(false)
        },
        onError: () => {
          setIsPending(false)
          toast.error(t('common.sign-in-error'))
        },
        onRequest: () => {
          setIsPending(true)
        }
      }
    })
  }

  return (
    <Dialog
      open={isSignInOpen}
      onOpenChange={(v) => {
        setIsSignInOpen(v)
      }}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='text-left text-2xl'>{t('common.sign-in')}</DialogTitle>
          <DialogDescription className='text-left'>
            {t('dialog.sign-in.description')}
          </DialogDescription>
        </DialogHeader>
        <div className='my-6 flex flex-col gap-4'>
          <Button
            className='relative h-10 rounded-xl font-semibold'
            onClick={() => handleSignIn('github')}
            isPending={isPending}
          >
            {isPending ? null : <SiGithub className='mr-3' />}
            {t('dialog.sign-in.continue-with', { provider: 'GitHub' })}
            {lastUsedProvider === 'github' && <LastUsed />}
          </Button>
          <Button
            className='relative h-10 rounded-xl border font-semibold'
            variant='ghost'
            onClick={() => handleSignIn('google')}
            isPending={isPending}
          >
            {isPending ? null : <GoogleIcon />}
            {t('dialog.sign-in.continue-with', { provider: 'Google' })}
            {lastUsedProvider === 'google' && <LastUsed />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const LastUsed = () => {
  return (
    <Badge variant='outline' className='bg-background absolute -right-2 -top-2'>
      Last used
    </Badge>
  )
}

export default SignInDialog
