'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  toast
} from '@tszhong0411/ui'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

import { api } from '@/trpc/react'

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const requestResetMutation = api.users.requestPasswordReset.useMutation({
    onSuccess: () => {
      setIsSuccess(true)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reset email')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email address')
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
                  <DialogTitle className='mb-2 text-xl font-semibold'>Check Your Email</DialogTitle>
                  <DialogDescription className='text-sm leading-relaxed'>
                    We've sent a password reset link to{' '}
                    <strong className='text-foreground font-medium'>{email}</strong>.
                    <br />
                    Please check your inbox and follow the instructions.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='mt-2 space-y-3'>
              <p className='text-muted-foreground text-center text-xs'>
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <Button
                variant='outline'
                className='h-11 w-full rounded-xl font-medium'
                onClick={handleClose}
              >
                Back to Sign In
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
                    Forgot Password?
                  </DialogTitle>
                  <DialogDescription className='text-left text-sm'>
                    No worries, we'll send you reset instructions.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
              <div>
                <label htmlFor='email' className='mb-2 block text-sm font-medium'>
                  Email Address
                </label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your email'
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
                {requestResetMutation.isPending ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                type='button'
                variant='ghost'
                className='h-11 w-full rounded-xl font-medium'
                onClick={handleClose}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Sign In
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
