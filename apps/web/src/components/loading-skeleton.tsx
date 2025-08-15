'use client'

import { cn } from '@tszhong0411/utils'

type LoadingSkeletonProps = {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  lines?: number
  width?: string | number
  height?: string | number
}

const LoadingSkeleton = ({ 
  className, 
  variant = 'rectangular',
  lines = 1,
  width,
  height 
}: LoadingSkeletonProps) => {
  const baseClasses = 'animate-pulse bg-muted rounded'
  
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            )}
            style={{ width: typeof width === 'number' ? `${width}px` : width }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full', className)}
        style={{
          width: typeof width === 'number' ? `${width}px` : width || '40px',
          height: typeof height === 'number' ? `${height}px` : height || '40px'
        }}
      />
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn('space-y-4 p-4 border rounded-lg', className)}>
        <div className='flex items-center space-x-4'>
          <LoadingSkeleton variant='circular' width={40} height={40} />
          <div className='flex-1'>
            <LoadingSkeleton variant='text' lines={2} />
          </div>
        </div>
        <LoadingSkeleton variant='text' lines={3} />
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  )
}

export default LoadingSkeleton
