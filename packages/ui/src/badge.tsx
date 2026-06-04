import { cn } from '@isyuricunha/utils'
import { cva, type VariantProps } from 'cva'

const badgeVariants = cva({
  base: 'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  variants: {
    variant: {
      default: 'bg-action-primary-soft text-accent-gold border-[var(--action-primary-border)]',
      secondary: 'bg-bg-chip text-text-secondary border-[var(--border-subtle)]',
      destructive: 'bg-status-danger-soft text-status-danger border-[var(--status-danger-border)]',
      outline: 'text-foreground border-[var(--border-default)]',
      success: 'bg-status-success-soft text-status-success border-[var(--status-success-border)]',
      info: 'bg-status-info-soft text-status-info border-[var(--status-info-border)]',
      agent: 'bg-status-agent-soft text-status-agent border-[var(--status-agent-border)]',
      warning: 'bg-action-primary-soft text-accent-gold border-[var(--action-primary-border)]'
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
