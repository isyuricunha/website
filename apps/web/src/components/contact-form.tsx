'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button, Textarea } from '@tszhong0411/ui'
import { Send, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    } else if (formData.subject.length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    } else if (formData.message.length > 2000) {
      newErrors.message = 'Message must be less than 2000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
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
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage(result.message || 'Message sent successfully!')
        setFormData({ name: '', email: '', subject: '', message: '' })
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
          setSubmitMessage(result.error || 'Failed to send message. Please try again.')
        }
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
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
          Send a Message
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          Fill out the form below and I'll get back to you soon
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
                Name *
              </label>
              <Input
                id='name'
                type='text'
                placeholder='Your name'
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
                Email *
              </label>
              <Input
                id='email'
                type='email'
                placeholder='your@email.com'
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
              Subject *
            </label>
            <Input
              id='subject'
              type='text'
              placeholder='What is this about?'
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
              Message *
            </label>
            <Textarea
              id='message'
              placeholder='Tell me more about your project, question, or idea...'
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
              {formData.message.length}/2000 characters
            </p>
          </div>

          <Button 
            type='submit' 
            className='w-full flex items-center justify-center gap-2 text-sm'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              <>
                <Send className='h-4 w-4' />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
