import { AlertCircleIcon, AlertTriangleIcon, CheckCircle2Icon, InfoIcon } from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = (props: ToasterProps) => {
  const { theme = 'system', ...rest } = props

  return (
    <Sonner
      theme={theme}
      style={
        {
          '--normal-border': 'var(--color-border)',
          '--normal-bg': 'var(--color-background)',
          '--normal-text': 'var(--color-foreground)'
        } as React.CSSProperties
      }
      icons={{
        success: <CheckCircle2Icon className='text-primary size-5' />,
        error: <AlertCircleIcon className='text-destructive size-5' />,
        warning: <AlertTriangleIcon className='text-primary size-5' />,
        info: <InfoIcon className='text-muted-foreground size-5' />
      }}
      {...rest}
    />
  )
}

export { Toaster, type ToasterProps }
export { toast } from 'sonner'
