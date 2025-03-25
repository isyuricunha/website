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
  Input,
  toast
} from '@tszhong0411/ui'
import { useEffect, useState } from 'react'

import { signIn, signUp } from '@/lib/auth-client'
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

const AnonIcon = () => {
  return (
    <svg
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 48 48'
      className='mr-3 size-6'
    >
      <path d='M 25 2 C 15.058594 2 7 4.6875 7 8 L 7 25 C 7 30.082031 12.417969 44.082031 25 47 C 37.582031 44.082031 43 30.082031 43 25 L 43 8 C 43 4.6875 34.941406 2 25 2 Z M 25 4 C 35.5 4 41 6.972656 41 8 L 41 25 C 41 29.136719 36.667969 40.523438 27 44.296875 L 27 38 L 23 38 L 23 44.296875 C 13.332031 40.523438 9 29.136719 9 25 L 9 8 C 9 6.972656 14.5 4 25 4 Z M 17 11 C 15.003906 11 12.855469 11.878906 11 15 C 12.953125 13.640625 14.613281 13 16 13 C 18.6875 13 20.027344 16.148438 20.4375 16.5625 C 21.023438 17.148438 21.972656 17.148438 22.5625 16.5625 C 23.148438 15.976563 23.148438 15.027344 22.5625 14.4375 C 22.195313 14.074219 20.4375 11 17 11 Z M 33 11 C 29.5625 11 27.804688 14.074219 27.4375 14.4375 C 26.851563 15.027344 26.851563 15.976563 27.4375 16.5625 C 28.027344 17.148438 28.976563 17.148438 29.5625 16.5625 C 29.972656 16.148438 31.3125 13 34 13 C 35.386719 13 37.046875 13.640625 39 15 C 37.144531 11.878906 34.996094 11 33 11 Z M 16 17 C 14.359375 17 12.917969 17.59375 12 18.5 C 12.917969 19.40625 14.359375 20 16 20 C 17.640625 20 19.082031 19.40625 20 18.5 C 19.082031 17.59375 17.640625 17 16 17 Z M 34 17 C 32.359375 17 30.917969 17.59375 30 18.5 C 30.917969 19.40625 32.359375 20 34 20 C 35.640625 20 37.082031 19.40625 38 18.5 C 37.082031 17.59375 35.640625 17 34 17 Z M 11 26 L 16 34 L 23 34 L 25 32 L 27 34 L 34 34 L 39 26 L 33 31 L 29 31 L 26 28 L 24 28 L 21 31 L 17 31 Z' />
    </svg>
  )
}

const SignInDialog = () => {
  const { isSignInOpen, setIsSignInOpen } = useDialogsStore()
  const [isPending, setIsPending] = useState(false)
  const [lastUsedProvider, setLastUsedProvider] = useState<Provider | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isEmailPending, setIsEmailPending] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const t = useTranslations()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      const provider = localStorage.getItem('last-used-provider') as Provider | null
      setLastUsedProvider(provider)
    }
  }, [])

  const handleSocialSignIn = async (provider: Provider) => {
    localStorage.setItem('last-used-provider', provider)
    await signIn.social({
      provider,
      callbackURL: pathname,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true)
        },
        onSuccess: () => {
          setIsPending(false)
          toast.success(t('common.sign-in-success'))
        },
        onError: () => {
          setIsPending(false)
          toast.error(t('common.sign-in-error'))
        }
      }
    })
  }

  const handleAnonymousSignIn = async () => {
    try {
      const user =
        await // eslint-disable-next-line @typescript-eslint/no-explicit-any -- need to work
        (signIn as any).anonymous({
          callbackURL: pathname,
          fetchOptions: {
            onRequest: () => {
              setIsPending(true)
            },
            onSuccess: () => {
              setIsPending(false)
              toast.success(t('common.sign-in-success'))
              setIsSignInOpen(false)
            },
            onError: () => {
              setIsPending(false)
              toast.error(t('common.sign-in-error'))
            }
          }
        })
      console.log('Anonymous user:', user)
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknow error'
      toast.error(errorMsg)
      setIsPending(false)
    }
  }

  const handleEmailSignIn = async () => {
    setIsEmailPending(true)
    try {
      const { error } = await signIn.email(
        {
          email,
          password,
          callbackURL: pathname
        },
        {
          onRequest: () => setIsEmailPending(true),
          onSuccess: () => {
            setIsEmailPending(false)
            toast.success(t('common.sign-in-success'))
          },
          onError: () => {
            setIsEmailPending(false)
            toast.error(t('common.sign-in-error'))
          }
        }
      )
      if (error) {
        toast.error(error.message)
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknow error'
      toast.error(errorMsg)
    } finally {
      setIsEmailPending(false)
    }
  }

  const handleEmailSignUp = async () => {
    setIsEmailPending(true)
    try {
      const { error } = await signUp.email(
        {
          email,
          password,
          name,
          callbackURL: pathname
        },
        {
          onRequest: () => setIsEmailPending(true),
          onSuccess: () => {
            setIsEmailPending(false)
            toast.success(t('common.sign-in-success'))
            setIsSignup(false)
          },
          onError: () => {
            setIsEmailPending(false)
            toast.error(t('common.sign-up-error'))
          }
        }
      )
      if (error) {
        toast.error(error.message)
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknow Error'
      toast.error(errorMsg)
    } finally {
      setIsEmailPending(false)
    }
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
          <DialogTitle className='text-left text-2xl'>
            {isSignup ? t('common.sign-up') : t('common.sign-in')}
          </DialogTitle>
          <DialogDescription className='text-left'>
            {isSignup ? t('dialog.sign-up.description') : t('dialog.sign-in.description')}
          </DialogDescription>
        </DialogHeader>

        {!isSignup && (
          <div className='my-6 flex flex-col gap-4'>
            <Button
              className='relative h-10 rounded-xl font-semibold'
              onClick={() => handleSocialSignIn('github')}
              isPending={isPending}
            >
              {isPending ? null : <SiGithub className='mr-3' />}
              {t('dialog.sign-in.continue-with', { provider: 'GitHub' })}
              {lastUsedProvider === 'github' && <LastUsed />}
            </Button>
            <Button
              className='relative h-10 rounded-xl border font-semibold'
              variant='ghost'
              onClick={() => handleSocialSignIn('google')}
              isPending={isPending}
            >
              {isPending ? null : <GoogleIcon />}
              {t('dialog.sign-in.continue-with', { provider: 'Google' })}
              {lastUsedProvider === 'google' && <LastUsed />}
            </Button>
            <Button
              className='relative h-10 w-full rounded-xl border font-semibold'
              onClick={handleAnonymousSignIn}
              isPending={isPending}
            >
              {isPending ? null : <AnonIcon />}
              {t('dialog.sign-in.anonymous')}
            </Button>
          </div>
        )}

        {/* Divider */}
        <div className='flex items-center gap-2'>
          <div className='h-px flex-1 bg-gray-300' />
          <span className='text-sm text-gray-500'>{t('dialog.sign-in.or')}</span>
          <div className='h-px flex-1 bg-gray-300' />
        </div>

        {/* Formulário de Email & Senha */}
        <div className='my-6 flex flex-col gap-4'>
          {isSignup && (
            <Input
              placeholder='Name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full'
            />
          )}
          <Input
            placeholder='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full'
          />
          <Input
            placeholder='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full'
          />
          <Button
            className='relative h-10 rounded-xl font-semibold'
            onClick={isSignup ? handleEmailSignUp : handleEmailSignIn}
            isPending={isEmailPending}
          >
            {t('dialog.sign-in.continue-with', { provider: isSignup ? 'Sign Up' : 'Email' })}
          </Button>
        </div>

        {/* Alternar entre Login e Cadastro */}
        <div className='mt-4 text-center'>
          {isSignup ? (
            <span>
              {t('dialog.already-have-account')}{' '}
              <Button variant='link' onClick={() => setIsSignup(false)}>
                {t('dialog.sign-in.here')}
              </Button>
            </span>
          ) : (
            <span>
              {t('dialog.dont-have-account')}{' '}
              <Button variant='link' onClick={() => setIsSignup(true)}>
                {t('dialog.sign-up.here')}
              </Button>
            </span>
          )}
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
