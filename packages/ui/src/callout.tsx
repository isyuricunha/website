import { cn } from '@isyuricunha/utils'
import { AlertOctagonIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react'

type CalloutProps = {
  title?: React.ReactNode
  type?: 'info' | 'warning' | 'error'
  icon?: React.ReactNode
} & React.ComponentProps<'div'>

const Callout = (props: CalloutProps) => {
  const { title, type = 'info', icon, className, children, ...rest } = props

  const icons = {
    info: <InfoIcon className='text-primary size-4' />,
    warning: <AlertTriangleIcon className='text-primary/80 size-4' />,
    error: <AlertOctagonIcon className='text-destructive size-4' />
  }

  return (
    <div
      role='alert'
      className={cn(
        'bg-card text-muted-foreground my-6 flex w-full flex-row items-start gap-2 rounded-lg border p-3 text-sm shadow-xs',
        className
      )}
      {...rest}
    >
      <div className='mt-0.5 shrink-0'>{icon ?? icons[type]}</div>
      <div className='w-0 flex-1'>
        {title ? <div className='text-card-foreground mb-2 font-medium'>{title}</div> : null}
        <div>{children}</div>
      </div>
    </div>
  )
}

export { Callout }
