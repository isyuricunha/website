/**
 * Inspired by: https://jahir.dev/uses
 */
import { BlurImage, Badge } from '@isyuricunha/ui'
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
          className='group bg-bg-surface shadow-feature-card hover:bg-bg-hover relative flex min-h-[120px] gap-4 rounded-lg border border-[var(--border-subtle)] p-4 no-underline transition-colors sm:min-h-[160px] sm:flex-col sm:gap-3'
        >
          {item.isAffiliate && (
            <Badge
              variant='secondary'
              className='text-accent-earth-text absolute top-2 right-2 rounded-sm border-[var(--accent-border)] bg-[var(--accent-dim)] text-xs'
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
            <div className='line-clamp-2 flex items-center gap-2 text-sm font-medium sm:text-base'>
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
