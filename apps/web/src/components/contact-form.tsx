'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button, Textarea } from '@tszhong0411/ui'
import { Send, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  website: string // honeypot field
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
    message: '',
    website: '' // honeypot field - bots usually fill this
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [formStartTime, setFormStartTime] = useState<number>(0)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Check if Turnstile is enabled
  const isTurnstileEnabled = 
    process.env.NEXT_PUBLIC_FLAG_TURNSTILE === 'true' && 
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  // Track when form was loaded (to prevent instant submissions)
  useEffect(() => {
    setFormStartTime(Date.now())
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

    // Anti-bot check: honeypot field should be empty
    if (formData.website) {
      console.warn('Honeypot field was filled - likely a bot')
      // Silently fail for bots (don't show error message)
      setSubmitStatus('success')
      setSubmitMessage(t('contact.form.success'))
      return
    }

    // Anti-bot check: form should take at least 3 seconds to fill
    const timeTaken = Date.now() - formStartTime
    if (timeTaken < 3000) {
      setSubmitStatus('error')
      setSubmitMessage(t('contact.form.too-fast') || 'Please take your time to fill the form.')
      return
    }

    // Check Turnstile token if enabled
    if (isTurnstileEnabled && !turnstileToken) {
      setSubmitStatus('error')
      setSubmitMessage(t('contact.form.turnstile-required') || 'Please complete the security verification.')
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
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          timestamp: formStartTime,
          ...(isTurnstileEnabled && { turnstileToken })
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage(result.message || t('contact.form.success'))
        setFormData({ name: '', email: '', subject: '', message: '', website: '' })
        setFormStartTime(Date.now()) // Reset timestamp
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
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
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
        <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
          <MessageSquare className='h-5 w-5' />
          {t('contact.form.title')}
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          {t('contact.form.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitStatus === 'success' && (
          <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800'>
            <CheckCircle className='h-4 w-4' />
            <span className='text-sm'>{submitMessage}</span>
          </div>
        )}
        
        {submitStatus === 'error' && submitMessage && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800'>
            <AlertCircle className='h-4 w-4' />
            <span className='text-sm'>{submitMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='name' className='block text-xs sm:text-sm font-medium mb-2'>
                {t('contact.form.name.label')} *
              </label>
              <Input
                id='name'
                type='text'
                placeholder={t('contact.form.name.placeholder')}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`text-sm ${errors.name ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className='text-xs text-red-600 mt-1'>{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor='email' className='block text-xs sm:text-sm font-medium mb-2'>
                {t('contact.form.email.label')} *
              </label>
              <Input
                id='email'
                type='email'
                placeholder={t('contact.form.email.placeholder')}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`text-sm ${errors.email ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className='text-xs text-red-600 mt-1'>{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor='subject' className='block text-xs sm:text-sm font-medium mb-2'>
              {t('contact.form.subject.label')} *
            </label>
            <Input
              id='subject'
              type='text'
              placeholder={t('contact.form.subject.placeholder')}
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`text-sm ${errors.subject ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.subject && (
              <p className='text-xs text-red-600 mt-1'>{errors.subject}</p>
            )}
          </div>

          <div>
            <label htmlFor='message' className='block text-xs sm:text-sm font-medium mb-2'>
              {t('contact.form.message.label')} *
            </label>
            <Textarea
              id='message'
              placeholder={t('contact.form.message.placeholder')}
              rows={6}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className={`text-sm resize-none ${errors.message ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className='text-xs text-red-600 mt-1'>{errors.message}</p>
            )}
            <p className='text-xs text-gray-500 mt-1'>
              {t('contact.form.message.character-count', { count: formData.message.length })}
            </p>
          </div>

          {/* Cloudflare Turnstile (optional) */}
          {isTurnstileEnabled && (
            <div className='flex justify-center'>
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null)
                  setSubmitStatus('error')
                  setSubmitMessage(t('contact.form.turnstile-error') || 'Security verification failed. Please try again.')
                }}
                onExpire={() => setTurnstileToken(null)}
                options={{
                  theme: 'auto',
                  size: 'normal'
                }}
              />
            </div>
          )}

          {/* Honeypot field - hidden from users, but bots will fill it */}
          <div className='absolute' style={{ left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden='true'>
            <label htmlFor='website'>Website (do not fill)</label>
            <Input
              id='website'
              name='website'
              type='text'
              tabIndex={-1}
              autoComplete='off'
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          <Button 
            type='submit' 
            className='w-full flex items-center justify-center gap-2 text-sm'
            disabled={isSubmitting}
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
