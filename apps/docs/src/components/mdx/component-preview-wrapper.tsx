'use client'

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@isyuricunha/ui'
import { RotateCcwIcon } from 'lucide-react'
import { useState } from 'react'

type ComponentPreviewWrapperProps = {
  component: React.ReactNode
  children: React.ReactNode
}

const ComponentPreviewWrapper = (props: ComponentPreviewWrapperProps) => {
  const { component: Component, children } = props
  const [key, setKey] = useState(0)

  return (
    <Tabs defaultValue='preview' className='my-8'>
      <TabsList className='tab-group bg-transparent p-0'>
        <TabsTrigger value='preview'>Preview</TabsTrigger>
        <TabsTrigger value='code'>Code</TabsTrigger>
      </TabsList>
      <TabsContent value='preview' className='relative' key={key}>
        <Button
          className='absolute top-1.5 right-1.5 z-10'
          variant='outline'
          size='icon'
          onClick={() => setKey((prev) => prev + 1)}
          aria-label='Reload preview'
        >
          <RotateCcwIcon className='size-4' />
        </Button>
        <div className='app-window not-prose mt-3'>
          <div className='app-window-chrome'>
            <span className='window-dot' />
            <span className='window-dot' />
            <span className='window-dot' />
            <span className='label-mono ml-2 normal-case'>preview</span>
          </div>
          <div className='flex min-h-[350px] items-center justify-center px-10 py-12'>
            {Component}
          </div>
        </div>
      </TabsContent>
      <TabsContent value='code'>
        <div className='[&_figure]:m-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto'>{children}</div>
      </TabsContent>
    </Tabs>
  )
}

export default ComponentPreviewWrapper
