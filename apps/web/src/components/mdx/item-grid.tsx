/**
 * Inspired by: https://jahir.dev/uses
 */
import { BlurImage, Badge } from '@tszhong0411/ui'
import { ExternalLink } from 'lucide-react'

import Link from '../link'

type Items = Array<{
  image: string
  name: string
  description: string
  url: string
  isAffiliate?: boolean
}>

type ItemGridProps = {
  items: Items
}

const ItemGrid = (props: ItemGridProps) => {
  const { items } = props

  return (
    <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.url}
          className='shadow-xs group relative flex min-h-[120px] gap-4 rounded-lg border p-4 no-underline transition-all hover:bg-zinc-100 hover:shadow-md sm:min-h-[160px] sm:flex-col sm:gap-3 dark:bg-zinc-900 dark:hover:bg-zinc-800'
        >
          {item.isAffiliate && (
            <Badge
              variant='secondary'
              className='absolute right-2 top-2 bg-blue-100 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            >
              Affiliate
            </Badge>
          )}
          <div className='bg-muted/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-lg p-3 sm:h-20 sm:w-20'>
            <BlurImage
              src={item.image}
              width={80}
              height={80}
              alt={item.name}
              className='max-h-full max-w-full'
              imageClassName='max-w-full max-h-full object-contain transition-transform group-hover:scale-105'
            />
          </div>
          <div className='flex flex-1 flex-col justify-center gap-2'>
            <div className='line-clamp-2 flex items-center gap-2 text-sm font-semibold sm:text-base'>
              {item.name}
              <ExternalLink className='h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
            </div>
            <div className='text-muted-foreground line-clamp-2 text-xs sm:text-sm'>
              {item.description}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ItemGrid
