import type { Metadata } from 'next'
import { WifiOff, Home } from 'lucide-react'
import Link from 'next/link'

import RefreshButton from './refresh-button'

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
          <RefreshButton />

          <Link
            href='/'
            className='ring-offset-background inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          >
            <Home className='size-4' />
            Go Home
          </Link>
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
