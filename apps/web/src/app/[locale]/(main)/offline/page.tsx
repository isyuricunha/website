import type { Metadata } from 'next'
import { Button } from '@tszhong0411/ui'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Offline - Yuri Cunha',
  description: 'You are currently offline. Please check your internet connection.',
  robots: 'noindex, nofollow'
}

export default function OfflinePage() {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-4'>
      <div className='max-w-md mx-auto space-y-6'>
        <WifiOff className='size-16 text-muted-foreground mx-auto' />
        
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold'>You're offline</h1>
          <p className='text-muted-foreground'>
            It looks like you've lost your internet connection. Some features may not work until you're back online.
          </p>
        </div>

        <div className='space-y-3'>
          <Button
            onClick={() => window.location.reload()}
            className='w-full gap-2'
          >
            <RefreshCw className='size-4' />
            Try Again
          </Button>
          
          <Button
            asChild
            variant='outline'
            className='w-full gap-2'
          >
            <Link href='/'>
              <Home className='size-4' />
              Go Home
            </Link>
          </Button>
        </div>

        <div className='text-sm text-muted-foreground space-y-1'>
          <p>While offline, you can still:</p>
          <ul className='list-disc list-inside space-y-1'>
            <li>Browse cached pages</li>
            <li>Read previously loaded content</li>
            <li>Use the search functionality</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
