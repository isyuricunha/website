'use client'

import { cn } from '@isyuricunha/utils'
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
  accentLine?: boolean
  children: React.ReactNode
}

const EnhancedCard = ({
  ref,
  className,
  hover = true,
  accentLine = false,
  children,
  ...props
}: EnhancedCardProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'bg-bg-surface text-text-primary shadow-feature-card relative overflow-hidden rounded-lg border border-[var(--border-subtle)] transition-colors duration-150',
        hover && 'hover:bg-bg-hover',
        className
      )}
      {...props}
    >
      {accentLine && (
        <div className='bg-accent-earth absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-150 group-hover:opacity-60' />
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
    className={cn('text-lg leading-none font-medium tracking-tighter', className)}
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
}) => <p ref={ref} className={cn('text-text-secondary text-sm', className)} {...props} />
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

export { EnhancedCard, EnhancedCardHeader, EnhancedCardContent }
