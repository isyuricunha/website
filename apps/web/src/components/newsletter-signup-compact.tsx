'use client'

import { useState } from 'react'
import { Input, Button } from '@tszhong0411/ui'
import { CheckCircle, AlertCircle, Send } from 'lucide-react'

const NewsletterSignupCompact = () => {
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
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to subscribe')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className='flex items-center gap-2 text-sm text-green-600'>
        <CheckCircle className='h-4 w-4' />
        <span>Subscribed!</span>
      </div>
    )
  }

  return (
    <div className='flex gap-2 items-center'>
      <Input
        type='email'
        placeholder='email@domain.com'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className='w-40 text-sm h-9 px-3 py-2 border border-input bg-background'
        disabled={isLoading}
      />
      <Button 
        type='submit' 
        disabled={isLoading || !email.trim()}
        variant='outline'
        size='sm'
        className='gap-2 h-9 px-3 py-2'
        onClick={handleSubmit}
      >
        {isLoading ? (
          <div className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
        ) : (
          <Send className='size-4' />
        )}
      </Button>
      
      {error && (
        <div className='absolute mt-10 flex items-center gap-1 text-xs text-destructive'>
          <AlertCircle className='h-3 w-3' />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default NewsletterSignupCompact
