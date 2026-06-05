'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button
} from '@isyuricunha/ui'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const NewsletterSignup = () => {
  const t = useTranslations()
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
        throw new Error(data.error || t('homepage.newsletter.error-default'))
      }

      setIsSubscribed(true)
      setEmail('')
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('homepage.newsletter.error-default'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <CheckCircle className='text-status-success mx-auto mb-4 h-12 w-12' />
          <h3 className='mb-2 text-base font-medium sm:text-lg'>
            {t('homepage.newsletter.success-title')}
          </h3>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            {t('homepage.newsletter.success-description')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
          <Mail className='h-5 w-5' />
          {t('homepage.newsletter.title')}
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          {t('homepage.newsletter.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='text-accent-earth-text flex items-center gap-2 rounded-md border border-[var(--accent-border)] bg-[var(--accent-dim)] p-3 text-sm'>
              <AlertCircle className='h-4 w-4 flex-shrink-0' />
              <span>{error}</span>
            </div>
          )}
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Input
              type='email'
              placeholder={t('homepage.newsletter.placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='flex-1 text-sm'
              disabled={isLoading}
            />
            <Button
              type='submit'
              disabled={isLoading || !email.trim()}
              className='flex items-center gap-2 text-sm'
            >
              {isLoading ? (
                <div className='h-4 w-4 animate-spin rounded-full border border-current border-t-transparent' />
              ) : (
                <Send className='h-4 w-4' />
              )}
              {t('homepage.newsletter.cta')}
            </Button>
          </div>
          <p className='text-muted-foreground text-xs'>{t('homepage.newsletter.disclaimer')}</p>
        </form>
      </CardContent>
    </Card>
  )
}

export default NewsletterSignup
