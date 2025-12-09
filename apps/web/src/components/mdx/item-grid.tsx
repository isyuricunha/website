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
          className='shadow-xs flex gap-4 rounded-lg border p-4 no-underline transition-all hover:bg-zinc-100 hover:shadow-md sm:flex-col sm:gap-3 dark:bg-zinc-900 dark:hover:bg-zinc-800 relative group min-h-[120px] sm:min-h-[160px]'
        >
          {item.isAffiliate && (
            <Badge 
              variant='secondary' 
              className='absolute top-2 right-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            >
              Affiliate
            </Badge>
          )}
          <div className='shrink-0 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-muted/10 rounded-lg p-3'>
            <BlurImage
              src={item.image}
              width={80}
              height={80}
              alt={item.name}
              className='max-w-full max-h-full'
              imageClassName='max-w-full max-h-full object-contain transition-transform group-hover:scale-105'
            />
          </div>
          <div className='flex flex-col justify-center gap-2 flex-1'>
            <div className='text-sm sm:text-base font-semibold flex items-center gap-2 line-clamp-2'>
              {item.name}
              <ExternalLink className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0' />
            </div>
            <div className='text-muted-foreground text-xs sm:text-sm line-clamp-2'>{item.description}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ItemGrid
