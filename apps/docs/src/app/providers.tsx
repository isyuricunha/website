'use client'

import { Toaster } from '@isyuricunha/ui'

type ProvidesProps = {
  children: React.ReactNode
}

const Providers = (props: ProvidesProps) => {
  const { children } = props

  return (
    <>
      {children}
      <Toaster
        toastOptions={{
          duration: 2500
        }}
        visibleToasts={5}
        expand
      />
    </>
  )
}

export default Providers
