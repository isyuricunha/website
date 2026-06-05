import { cn } from '@isyuricunha/utils'
import { cva, type VariantProps } from 'cva'
import { LoaderIcon } from 'lucide-react'

const buttonVariants = cva({
  base: [
    'ring-offset-background inline-flex items-center justify-center rounded-md text-[13px] font-medium whitespace-nowrap shadow-xs transition-colors',
    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
    'disabled:pointer-events-none disabled:opacity-50'
  ],
  variants: {
    variant: {
      default:
        'bg-action-primary text-text-inverse hover:bg-action-primary-hover border border-[var(--action-primary-border)]',
      destructive:
        'bg-status-danger text-destructive-foreground hover:bg-status-danger-hover border border-[var(--status-danger-border)]',
      outline:
        'border-border text-muted-foreground hover:border-border hover:bg-bg-hover hover:text-foreground border bg-transparent',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-bg-hover border border-[var(--border-subtle)]',
      ghost: 'text-muted-foreground hover:bg-bg-hover hover:text-foreground',
      link: 'text-status-info hover:text-accent-cyan-hover underline-offset-4 hover:underline',
      success:
        'bg-status-success text-text-inverse hover:bg-accent-green-hover border border-[var(--status-success-border)]',
      agent:
        'bg-status-agent text-text-primary hover:bg-accent-purple-hover border border-[var(--status-agent-border)]',
      info: 'bg-status-info text-text-inverse hover:bg-accent-cyan-hover border border-[var(--status-info-border)]'
    },
    size: {
      default: 'h-9 px-5 py-2',
      sm: 'h-8 px-3',
      lg: 'h-10 px-6',
      icon: 'size-9'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
})

type ButtonProps = { isPending?: boolean } & React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>

const Button = (props: ButtonProps) => {
  const {
    className,
    variant,
    size,
    type = 'button',
    isPending,
    disabled,
    children,
    ...rest
  } = props

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      type={type}
      disabled={disabled ?? isPending}
      {...rest}
    >
      {isPending && <LoaderIcon className='mr-2 size-4 animate-spin' />}
      {children}
    </button>
  )
}

export { Button, type ButtonProps, buttonVariants }
