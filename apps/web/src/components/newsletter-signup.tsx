'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button } from '@tszhong0411/ui'
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setIsSubscribed(true)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <CheckCircle className='h-12 w-12 mx-auto text-green-500 mb-4' />
          <h3 className='text-base sm:text-lg font-semibold mb-2'>Thanks for subscribing!</h3>
          <p className='text-xs sm:text-sm text-muted-foreground'>
            You'll receive updates about new posts and projects.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
          <Mail className='h-5 w-5' />
          Stay Updated
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          Get notified about new blog posts and project updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
              <AlertCircle className='h-4 w-4 flex-shrink-0' />
              <span>{error}</span>
            </div>
          )}
          <div className='flex flex-col sm:flex-row gap-2'>
            <Input
              type='email'
              placeholder='Enter your email'
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
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <Send className='h-4 w-4' />
              )}
              Subscribe
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>
            No spam, unsubscribe at any time. Privacy policy applies.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default NewsletterSignup
