'use client'

import { useState } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { Input, Button } from '@isyuricunha/ui'
import { CheckCircle, AlertCircle, Send } from 'lucide-react'

const NewsletterSignupCompact = () => {
  const t = useTranslations('homepage.newsletter')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('error-default'))
      }

      setIsSubscribed(true)
      setEmail('')
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('error-default'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className='flex items-center gap-2 text-sm text-green-600'>
        <CheckCircle className='h-4 w-4' />
        <span>{t('success-compact')}</span>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <Input
        type='email'
        placeholder={t('placeholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className='border-input bg-background h-9 w-40 border px-3 py-2 text-sm'
        disabled={isLoading}
      />
      <Button
        type='submit'
        disabled={isLoading || !email.trim()}
        variant='outline'
        size='sm'
        className='h-9 gap-2 px-3 py-2'
        onClick={handleSubmit}
        aria-label={t('cta')}
      >
        {isLoading ? (
          <div className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
        ) : (
          <Send className='size-4' />
        )}
      </Button>

      {error && (
        <div className='text-destructive absolute mt-10 flex items-center gap-1 text-xs'>
          <AlertCircle className='h-3 w-3' />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default NewsletterSignupCompact
