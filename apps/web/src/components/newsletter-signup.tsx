'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Turnstile } from '@marsidev/react-turnstile'
import { env, flags } from '@isyuricunha/env'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button
} from '@isyuricunha/yutheme'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useRef, useState } from 'react'

const NewsletterSignup = () => {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [isTurnstileEnabled] = useState(
    () => flags.turnstile && !!env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  )
  const turnstileRef = useRef<React.ElementRef<typeof Turnstile>>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    if (isTurnstileEnabled && !turnstileToken) {
      setError(t('homepage.newsletter.turnstile-required'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          ...(isTurnstileEnabled && { turnstileToken })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('homepage.newsletter.error-default'))
      }

      setIsSubscribed(true)
      setEmail('')
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('homepage.newsletter.error-default'))
      // A single-use token is consumed server-side on a 4xx; the retry must
      // carry a fresh token or it loops into the same rejection forever.
      setTurnstileToken(null)
      turnstileRef.current?.reset()
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
            <div
              id='newsletter-email-error'
              role='alert'
              className='text-accent-earth-text flex items-center gap-2 rounded-md border border-[var(--accent-border)] bg-[var(--accent-dim)] p-3 text-sm'
            >
              <AlertCircle aria-hidden='true' className='h-4 w-4 flex-shrink-0' />
              <span>{error}</span>
            </div>
          )}
          <div className='flex flex-col gap-2 sm:flex-row'>
            <label htmlFor='newsletter-email' className='sr-only'>
              {t('homepage.newsletter.email-label')}
            </label>
            <Input
              id='newsletter-email'
              type='email'
              placeholder={t('homepage.newsletter.placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'newsletter-email-error' : undefined}
              className='flex-1 text-sm'
              disabled={isLoading}
            />
            <Button
              type='submit'
              disabled={isLoading || !email.trim() || (isTurnstileEnabled && !turnstileToken)}
              className='flex items-center gap-2 text-sm'
            >
              {isLoading ? (
                <div
                  aria-hidden='true'
                  className='h-4 w-4 animate-spin rounded-full border border-current border-t-transparent'
                />
              ) : (
                <Send aria-hidden='true' className='h-4 w-4' />
              )}
              {t('homepage.newsletter.cta')}
            </Button>
          </div>
          {isTurnstileEnabled && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className='flex justify-center'>
              <Turnstile
                ref={turnstileRef}
                siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token: string) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null)
                  turnstileRef.current?.reset()
                  setError(t('homepage.newsletter.turnstile-error'))
                }}
                onExpire={() => {
                  setTurnstileToken(null)
                  turnstileRef.current?.reset()
                }}
                options={{
                  theme: 'auto',
                  size: 'normal'
                }}
              />
            </div>
          )}
          <p className='text-muted-foreground text-xs'>{t('homepage.newsletter.disclaimer')}</p>
        </form>
      </CardContent>
    </Card>
  )
}

export default NewsletterSignup
