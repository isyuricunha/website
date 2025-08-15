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
    <div className='mb-9 grid grid-cols-1 gap-4 sm:grid-cols-4'>
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.url}
          className='shadow-xs flex gap-6 rounded-lg border p-4 no-underline transition-all hover:bg-zinc-100 hover:shadow-md sm:flex-col sm:gap-3 dark:bg-zinc-900 dark:hover:bg-zinc-800 relative group'
        >
          {item.isAffiliate && (
            <Badge 
              variant='secondary' 
              className='absolute top-2 right-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            >
              Affiliate
            </Badge>
          )}
          <BlurImage
            src={item.image}
            width={256}
            height={256}
            alt={item.name}
            className='shrink-0'
            imageClassName='m-0 size-24 sm:size-32 object-contain transition-transform group-hover:scale-105'
          />
          <div className='flex flex-col justify-center gap-2'>
            <div className='text-sm sm:text-base font-semibold flex items-center gap-2'>
              {item.name}
              <ExternalLink className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity' />
            </div>
            <div className='text-muted-foreground text-xs sm:text-sm'>{item.description}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ItemGrid
