'use client'

import { Toaster, TooltipProvider } from '@isyuricunha/ui'

import { TRPCReactProvider } from '@/trpc/react'

type ProvidesProps = {
  children: React.ReactNode
}

const Providers = (props: ProvidesProps) => {
  const { children } = props

  return (
    <TRPCReactProvider>
      <TooltipProvider>
        {children}
        <Toaster
          toastOptions={{
            duration: 2500
          }}
          visibleToasts={5}
          expand
        />
      </TooltipProvider>
    </TRPCReactProvider>
  )
}

export default Providers
