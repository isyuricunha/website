'use client'

import { useState } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  toast
} from '@isyuricunha/ui'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

import { api } from '@/trpc/react'

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const t = useTranslations()

  const requestResetMutation = api.users.requestPasswordReset.useMutation({
    onSuccess: () => {
      setIsSuccess(true)
    },
    onError: (error) => {
      toast.error(error.message || t('dialog.forgot-password.errors.send-failed'))
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error(t('dialog.forgot-password.errors.no-email'))
      return
    }

    requestResetMutation.mutate({ email })
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after dialog closes
    setTimeout(() => {
      setEmail('')
      setIsSuccess(false)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[440px]'>
        {isSuccess ? (
          <>
            <DialogHeader>
              <div className='flex flex-col items-center space-y-4 py-4 text-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10'>
                  <CheckCircle2 className='h-8 w-8 text-emerald-600 dark:text-emerald-400' />
                </div>
                <div>
                  <DialogTitle className='mb-2 text-xl font-semibold'>
                    {t('dialog.forgot-password.success.title')}
                  </DialogTitle>
                  <DialogDescription className='text-sm leading-relaxed'>
                    {t('dialog.forgot-password.success.sent')}{' '}
                    <strong className='text-foreground font-medium'>{email}</strong>.
                    <br />
                    {t('dialog.forgot-password.success.instructions')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='mt-2 space-y-3'>
              <p className='text-muted-foreground text-center text-xs'>
                {t('dialog.forgot-password.success.tip')}
              </p>

              <Button
                variant='outline'
                className='h-11 w-full rounded-xl font-medium'
                onClick={handleClose}
              >
                {t('dialog.forgot-password.back')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className='mb-2 flex items-center gap-3'>
                <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl'>
                  <Mail className='text-primary h-6 w-6' />
                </div>
                <div className='flex-1'>
                  <DialogTitle className='text-left text-xl font-semibold'>
                    {t('dialog.forgot-password.title')}
                  </DialogTitle>
                  <DialogDescription className='text-left text-sm'>
                    {t('dialog.forgot-password.description')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
              <div>
                <label htmlFor='email' className='mb-2 block text-sm font-medium'>
                  {t('dialog.forgot-password.email.label')}
                </label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('dialog.forgot-password.email.placeholder')}
                  required
                  disabled={requestResetMutation.isPending}
                  className='h-11 w-full'
                />
              </div>

              <Button
                type='submit'
                className='h-11 w-full rounded-xl font-semibold'
                disabled={requestResetMutation.isPending || !email}
              >
                {requestResetMutation.isPending
                  ? t('dialog.forgot-password.submit.pending')
                  : t('dialog.forgot-password.submit.default')}
              </Button>

              <Button
                type='button'
                variant='ghost'
                className='h-11 w-full rounded-xl font-medium'
                onClick={handleClose}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                {t('dialog.forgot-password.back')}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
