'use client'

import { cn } from '@tszhong0411/utils'
import { motion } from 'motion/react'

interface EnhancedCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
> {
  hover?: boolean
  gradient?: boolean
  children: React.ReactNode
}

const EnhancedCard = ({
  ref,
  className,
  hover = true,
  gradient = false,
  children,
  ...props
}: EnhancedCardProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'bg-card text-card-foreground relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300',
        hover && 'hover:shadow-primary/5 hover:shadow-lg',
        gradient && 'from-card via-card to-card/80 bg-gradient-to-br',
        className
      )}
      {...props}
    >
      {gradient && (
        <div className='from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      )}
      <div className='relative z-10'>{children}</div>
    </motion.div>
  )
}

EnhancedCard.displayName = 'EnhancedCard'

const EnhancedCardHeader = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
)
EnhancedCardHeader.displayName = 'EnhancedCardHeader'

const EnhancedCardTitle = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.RefObject<HTMLParagraphElement | null>
}) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
)
EnhancedCardTitle.displayName = 'EnhancedCardTitle'

const EnhancedCardDescription = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.RefObject<HTMLParagraphElement | null>
}) => <p ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />
EnhancedCardDescription.displayName = 'EnhancedCardDescription'

const EnhancedCardContent = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
)
EnhancedCardContent.displayName = 'EnhancedCardContent'

const EnhancedCardFooter = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
)
EnhancedCardFooter.displayName = 'EnhancedCardFooter'

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent
}
