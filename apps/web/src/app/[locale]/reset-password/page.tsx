'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@isyuricunha/ui'
import { useTranslations } from '@isyuricunha/i18n/client'

import { toast } from 'sonner'
import { api } from '@/trpc/react'
import { useDialogsStore } from '@/store/dialogs'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { setIsSignInOpen } = useDialogsStore()
  const t = useTranslations('reset-password')

  const resetPasswordMutation = api.users.resetPassword.useMutation({
    onSuccess: () => {
      toast.success(t('messages.success'))
      setIsSuccess(true)
    },
    onError: (error) => {
      toast.error(error.message || t('messages.failed'))
    },
    onSettled: () => {
      setIsLoading(false)
    }
  })

  if (isSuccess) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>{t('success.title')}</CardTitle>
            <CardDescription>{t('success.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button
              onClick={() => {
                setIsSignInOpen(true)
              }}
              className='w-full'
            >
              {t('actions.sign-in')}
            </Button>
            <Button onClick={() => router.push('/')} className='w-full' variant='outline'>
              {t('actions.back-home')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error(t('messages.invalid-token'))
      return
    }

    if (password !== confirmPassword) {
      toast.error(t('messages.passwords-do-not-match'))
      return
    }

    if (password.length < 8) {
      toast.error(t('messages.password-too-short'))
      return
    }

    setIsLoading(true)
    resetPasswordMutation.mutate({
      token,
      newPassword: password
    })
  }

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>{t('invalid.title')}</CardTitle>
            <CardDescription>{t('invalid.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setIsSignInOpen(true)
              }}
              className='w-full'
            >
              {t('actions.sign-in')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>{t('form.title')}</CardTitle>
          <CardDescription>{t('form.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label htmlFor='password' className='mb-2 block text-sm font-medium'>
                {t('form.new-password.label')}
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('form.new-password.placeholder')}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor='confirmPassword' className='mb-2 block text-sm font-medium'>
                {t('form.confirm-password.label')}
              </label>
              <Input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('form.confirm-password.placeholder')}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
            <Button
              type='submit'
              className='w-full'
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? t('form.submit.pending') : t('form.submit.default')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  const t = useTranslations('reset-password')

  return (
    <Suspense
      fallback={<div className='flex min-h-screen items-center justify-center'>{t('loading')}</div>}
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
