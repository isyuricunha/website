import { cn } from '@isyuricunha/utils'

type SkeletonProps = React.ComponentProps<'div'>

const Skeleton = (props: SkeletonProps) => {
  const { className, ...rest } = props

  return <div className={cn('yu-skeleton rounded-md', className)} {...rest} />
}

export { Skeleton }
