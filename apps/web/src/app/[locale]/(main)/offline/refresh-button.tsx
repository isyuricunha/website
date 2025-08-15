'use client'

import { Button } from '@tszhong0411/ui'
import { RefreshCw } from 'lucide-react'

export default function RefreshButton() {
  return (
    <Button
      onClick={() => window.location.reload()}
      className='w-full gap-2'
    >
      <RefreshCw className='size-4' />
      Try Again
    </Button>
  )
}
