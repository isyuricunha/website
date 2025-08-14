'use client'

import { cn } from '@tszhong0411/utils'
import { motion } from 'motion/react'
import { forwardRef } from 'react'

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  gradient?: boolean
  children: React.ReactNode
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, hover = true, gradient = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          'relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300',
          hover && 'hover:shadow-lg hover:shadow-primary/5',
          gradient && 'bg-gradient-to-br from-card via-card to-card/80',
          className
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)

EnhancedCard.displayName = 'EnhancedCard'

const EnhancedCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = 'EnhancedCardHeader'

const EnhancedCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
EnhancedCardTitle.displayName = 'EnhancedCardTitle'

const EnhancedCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = 'EnhancedCardDescription'

const EnhancedCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
EnhancedCardContent.displayName = 'EnhancedCardContent'

const EnhancedCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = 'EnhancedCardFooter'

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent
}
