import { cn } from '@isyuricunha/utils'
import { cva, type VariantProps } from 'cva'
import { LoaderIcon } from 'lucide-react'

const buttonVariants = cva({
  base: [
    'ring-offset-background inline-flex items-center justify-center rounded-md text-[13px] font-medium whitespace-nowrap transition-colors',
    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
    'disabled:pointer-events-none disabled:opacity-50'
  ],
  variants: {
    variant: {
      default:
        'border-accent-earth-hover bg-accent-earth text-text-inverse hover:bg-accent-earth-hover border',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline:
        'border-border text-muted-foreground hover:border-border hover:bg-bg-hover hover:text-foreground border bg-transparent',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'text-muted-foreground hover:bg-bg-hover hover:text-foreground',
      link: 'text-accent-earth-text underline-offset-4 hover:underline'
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
