'use client'

import { useState, useEffect } from 'react'
import { env, flags } from '@isyuricunha/env'
import { useTranslations } from '@isyuricunha/i18n/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Textarea
} from '@isyuricunha/ui'
import { Send, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
  general?: string
}

export default function ContactForm() {
  const t = useTranslations()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [isTurnstileEnabled, setIsTurnstileEnabled] = useState(false)

  // Check Turnstile availability
  useEffect(() => {
    // Check if Turnstile is enabled (client-side only to avoid hydration issues)
    setIsTurnstileEnabled(flags.turnstile && !!env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.name.required')
    } else if (formData.name.length > 100) {
      newErrors.name = t('contact.form.name.max-length')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.email.required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.email.invalid')
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.subject.required')
    } else if (formData.subject.length > 200) {
      newErrors.subject = t('contact.form.subject.max-length')
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.message.required')
    } else if (formData.message.length < 10) {
      newErrors.message = t('contact.form.message.min-length')
    } else if (formData.message.length > 2000) {
      newErrors.message = t('contact.form.message.max-length')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Check Turnstile token if enabled
    if (isTurnstileEnabled && !turnstileToken) {
      setSubmitStatus('error')
      setSubmitMessage(
        t('contact.form.turnstile-required') || 'Please complete the security verification.'
      )
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrors({})

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-locale': document.documentElement.lang
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          ...(isTurnstileEnabled && { turnstileToken })
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage(result.message || t('contact.form.success'))
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTurnstileToken(null) // Reset Turnstile token
      } else {
        setSubmitStatus('error')
        if (result.details) {
          // Handle validation errors from server
          const serverErrors: FormErrors = {}
          result.details.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              serverErrors[error.path[0] as keyof FormErrors] = error.message
            }
          })
          setErrors(serverErrors)
        } else {
          setSubmitMessage(result.error || t('contact.form.error'))
        }
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
      setSubmitMessage(t('contact.form.network-error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Clear submit status when user makes changes
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle')
      setSubmitMessage('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
          <MessageSquare className='h-5 w-5' />
          {t('contact.form.title')}
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          {t('contact.form.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitStatus === 'success' && (
          <div className='bg-primary/10 border-primary/20 text-primary mb-4 flex items-center gap-2 rounded-lg border p-3'>
            <CheckCircle className='h-4 w-4' />
            <span className='text-sm'>{submitMessage}</span>
          </div>
        )}

        {submitStatus === 'error' && submitMessage && (
          <div className='border-destructive/20 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-lg border p-3'>
            <AlertCircle className='h-4 w-4' />
            <span className='text-sm'>{submitMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <label htmlFor='name' className='mb-2 block text-xs font-medium sm:text-sm'>
                {t('contact.form.name.label')} *
              </label>
              <Input
                id='name'
                type='text'
                placeholder={t('contact.form.name.placeholder')}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`text-sm ${errors.name ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
              />
              {errors.name && <p className='text-destructive mt-1 text-xs'>{errors.name}</p>}
            </div>
            <div>
              <label htmlFor='email' className='mb-2 block text-xs font-medium sm:text-sm'>
                {t('contact.form.email.label')} *
              </label>
              <Input
                id='email'
                type='email'
                placeholder={t('contact.form.email.placeholder')}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`text-sm ${errors.email ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
              />
              {errors.email && <p className='text-destructive mt-1 text-xs'>{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor='subject' className='mb-2 block text-xs font-medium sm:text-sm'>
              {t('contact.form.subject.label')} *
            </label>
            <Input
              id='subject'
              type='text'
              placeholder={t('contact.form.subject.placeholder')}
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`text-sm ${errors.subject ? 'border-destructive' : ''}`}
              disabled={isSubmitting}
            />
            {errors.subject && <p className='text-destructive mt-1 text-xs'>{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor='message' className='mb-2 block text-xs font-medium sm:text-sm'>
              {t('contact.form.message.label')} *
            </label>
            <Textarea
              id='message'
              placeholder={t('contact.form.message.placeholder')}
              rows={6}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className={`resize-none text-sm ${errors.message ? 'border-destructive' : ''}`}
              disabled={isSubmitting}
            />
            {errors.message && <p className='text-destructive mt-1 text-xs'>{errors.message}</p>}
            <p className='text-muted-foreground mt-1 text-xs'>
              {t('contact.form.message.character-count', { count: formData.message.length })}
            </p>
          </div>

          {/* Cloudflare Turnstile (optional) */}
          {isTurnstileEnabled && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className='flex justify-center'>
              <Turnstile
                siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token: string) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null)
                  setSubmitStatus('error')
                  setSubmitMessage(
                    t('contact.form.turnstile-error') ||
                      'Security verification failed. Please try again.'
                  )
                }}
                onExpire={() => setTurnstileToken(null)}
                options={{
                  theme: 'auto',
                  size: 'normal'
                }}
              />
            </div>
          )}

          <Button
            type='submit'
            className='flex w-full items-center justify-center gap-2 text-sm'
            disabled={isSubmitting || (isTurnstileEnabled && !turnstileToken)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {t('contact.form.submitting')}
              </>
            ) : (
              <>
                <Send className='h-4 w-4' />
                {t('contact.form.submit')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
