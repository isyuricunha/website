import { cn } from '@tszhong0411/ui'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

// Specific skeleton components for better UX
export function PostCardSkeleton() {
  return (
    <div className="shadow-feature-card rounded-xl px-2 py-4 space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="px-2 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
      <div className="p-0">
        <Skeleton className="aspect-video w-full" />
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-6 w-18" />
        </div>
      </div>
    </div>
  )
}

export function SpotifyCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="flex items-center space-x-4 rounded-lg p-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="my-16 space-y-6">
      <div className="flex justify-between gap-8">
        <div className="flex flex-col gap-4 flex-1">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-8 w-1/2" />
          </div>
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-28" />
          </div>
        </div>
        <Skeleton className="hidden md:block size-28 rounded-full" />
      </div>
    </div>
  )
}

export function FilterSkeleton() {
  return (
    <div className="mb-8 space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex items-center justify-between text-sm">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}
