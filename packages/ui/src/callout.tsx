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
    info: <InfoIcon className='text-status-info size-4' />,
    warning: <AlertTriangleIcon className='text-accent-gold size-4' />,
    error: <AlertOctagonIcon className='text-status-danger size-4' />
  }

  const variants = {
    info: 'border-[var(--status-info-border)] bg-status-info-soft',
    warning: 'border-[var(--action-primary-border)] bg-action-primary-soft',
    error: 'border-[var(--status-danger-border)] bg-status-danger-soft'
  }

  return (
    <div
      role='alert'
      className={cn(
        'text-muted-foreground my-6 flex w-full flex-row items-start gap-2 rounded-lg border p-3 text-sm shadow-xs',
        variants[type],
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
