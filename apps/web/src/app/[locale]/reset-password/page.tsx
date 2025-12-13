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
} from '@tszhong0411/ui'

import { toast } from 'sonner'
import { api } from '@/trpc/react'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const resetPasswordMutation = api.users.resetPassword.useMutation({
    onSuccess: () => {
      toast.success('Password reset successfully! You can now sign in with your new password.')
      router.push('/sign-in')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password')
    },
    onSettled: () => {
      setIsLoading(false)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
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
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>This password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/sign-in')} className='w-full'>
              Back to Sign In
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
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label htmlFor='password' className='mb-2 block text-sm font-medium'>
                New Password
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your new password'
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor='confirmPassword' className='mb-2 block text-sm font-medium'>
                Confirm New Password
              </label>
              <Input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm your new password'
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
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className='flex min-h-screen items-center justify-center'>Loading...</div>}
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
