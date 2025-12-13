'use client'

import { cn } from '@tszhong0411/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pulse' | 'wave'
}

const Skeleton = ({ className, variant = 'default', ...props }: SkeletonProps) => {
  const baseClasses = 'animate-pulse rounded-md bg-muted'

  const variantClasses = {
    default: '',
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
  }

  return <div className={cn(baseClasses, variantClasses[variant], className)} {...props} />
}

// Specific skeleton components for common use cases
const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-3 p-6', className)} {...props}>
    <Skeleton className='h-4 w-3/4' />
    <Skeleton className='h-4 w-1/2' />
    <Skeleton className='h-20 w-full' />
    <div className='flex space-x-2'>
      <Skeleton className='h-8 w-16' />
      <Skeleton className='h-8 w-16' />
    </div>
  </div>
)

const SkeletonPost = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-3', className)} {...props}>
    <Skeleton className='h-48 w-full' />
    <div className='space-y-2'>
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
    </div>
    <div className='flex items-center space-x-2'>
      <Skeleton className='h-8 w-8 rounded-full' />
      <div className='space-y-1'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-3 w-16' />
      </div>
    </div>
  </div>
)

const SkeletonProject = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-4', className)} {...props}>
    <Skeleton className='h-40 w-full rounded-lg' />
    <div className='space-y-2'>
      <Skeleton className='h-5 w-3/4' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-2/3' />
    </div>
    <div className='flex space-x-2'>
      <Skeleton className='h-6 w-16 rounded-full' />
      <Skeleton className='h-6 w-20 rounded-full' />
      <Skeleton className='h-6 w-14 rounded-full' />
    </div>
    <div className='flex justify-between'>
      <Skeleton className='h-8 w-20' />
      <Skeleton className='h-8 w-24' />
    </div>
  </div>
)

const SkeletonList = ({
  items = 3,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { items?: number }) => (
  <div className={cn('space-y-4', className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className='flex items-center space-x-4'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      </div>
    ))}
  </div>
)

// Add shimmer animation to global CSS
const shimmerKeyframes = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
`

export { Skeleton, SkeletonCard, SkeletonPost, SkeletonProject, SkeletonList, shimmerKeyframes }
