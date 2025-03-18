import { Skeleton } from '@tszhong0411/ui'

const SkeletonDemo = () => {
  return (
    <div className='flex items-center gap-4'>
      <Skeleton className='size-12 rounded-full' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </div>
  )
}

export default SkeletonDemo
