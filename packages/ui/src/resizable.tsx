import { cn } from '@isyuricunha/utils'
import type * as React from 'react'
import { GripVerticalIcon } from 'lucide-react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { Orientation } from 'react-resizable-panels'

type ResizablePanelGroupProps = Omit<React.ComponentProps<typeof Group>, 'orientation'> & {
  direction?: Orientation
  orientation?: Orientation
}

const ResizablePanelGroup = (props: ResizablePanelGroupProps) => {
  const { className, direction, orientation, ...rest } = props

  return (
    <Group
      className={cn('flex size-full data-[panel-group-direction=vertical]:flex-col', className)}
      orientation={orientation ?? direction}
      {...rest}
    />
  )
}

const ResizablePanel = Panel

type ResizableHandleProps = {
  withHandle?: boolean
} & React.ComponentProps<typeof Separator>

const ResizableHandle = (props: ResizableHandleProps) => {
  const { withHandle, className, ...rest } = props

  return (
    <Separator
      className={cn(
        'bg-border relative flex w-px items-center justify-center',
        'data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
        '[&[data-panel-group-direction=vertical]>div]:rotate-90',
        className
      )}
      {...rest}
    >
      {withHandle && (
        <div className='bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border'>
          <GripVerticalIcon className='size-2.5' />
        </div>
      )}
    </Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
