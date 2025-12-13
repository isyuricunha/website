import { cn } from '@isyuricunha/utils'

type SkeletonProps = React.ComponentProps<'div'>

const Skeleton = (props: SkeletonProps) => {
  const { className, ...rest } = props

  return <div className={cn('bg-primary/10 animate-pulse rounded-lg', className)} {...rest} />
}

export { Skeleton }
