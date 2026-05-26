import { cn } from '@isyuricunha/utils'
import { cva, type VariantProps } from 'cva'

const badgeVariants = cva({
  base: 'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  variants: {
    variant: {
      default: 'bg-accent-earth text-text-inverse border-transparent shadow-sm',
      secondary: 'bg-bg-surface text-text-secondary border-transparent shadow-sm',
      destructive: 'bg-destructive text-destructive-foreground border-transparent shadow-sm',
      outline: 'text-foreground'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

type BadgeProps = React.ComponentProps<'div'> & VariantProps<typeof badgeVariants>

const Badge = (props: BadgeProps) => {
  const { className, variant, ...rest } = props

  return <div className={cn(badgeVariants({ variant }), className)} {...rest} />
}

export { Badge, badgeVariants }
