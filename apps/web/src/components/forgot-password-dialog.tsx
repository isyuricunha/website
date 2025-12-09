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
        {!isSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <DialogTitle className='text-left text-xl font-semibold'>
                    Forgot Password?
                  </DialogTitle>
                  <DialogDescription className='text-left text-sm'>
                    No worries, we'll send you reset instructions.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={requestResetMutation.isPending}
                  className="w-full h-11"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl font-semibold" 
                disabled={requestResetMutation.isPending || !email}
              >
                {requestResetMutation.isPending ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full h-11 rounded-xl font-medium"
                onClick={handleClose}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <DialogTitle className='text-xl font-semibold mb-2'>
                    Check Your Email
                  </DialogTitle>
                  <DialogDescription className='text-sm leading-relaxed'>
                    We've sent a password reset link to <strong className="font-medium text-foreground">{email}</strong>.
                    <br />
                    Please check your inbox and follow the instructions.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <p className="text-xs text-center text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl font-medium"
                onClick={handleClose}
              >
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
