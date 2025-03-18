'use client'

import type { TOC } from '@tszhong0411/mdx-plugins'

import { useTranslations } from '@tszhong0411/i18n/client'
import { useRouter } from '@tszhong0411/i18n/routing'
import { SegmentGroup, SegmentGroupItem } from '@tszhong0411/ui'

import { useScrollspy } from '@/hooks/use-scrollspy'

type TableOfContentsProps = {
  toc: TOC[]
}

const TableOfContents = (props: TableOfContentsProps) => {
  const { toc } = props
  const activeId = useScrollspy(
    toc.map((item) => item.url),
    { rootMargin: '0% 0% -80% 0%' }
  )
  const t = useTranslations()
  const router = useRouter()

  return (
    <div className='hidden pl-4 lg:block'>
      <div className='mb-4'>{t('blog.on-this-page')}</div>
      <SegmentGroup
        orientation='vertical'
        value={activeId}
        onValueChange={(details) => {
          router.push(`#${details.value}`)
        }}
        className='text-sm'
      >
        {toc.map((item) => (
          <SegmentGroupItem
            key={item.url}
            value={item.url}
            style={{
              paddingLeft: (item.depth - 1) * 12
            }}
          >
            {item.title}
          </SegmentGroupItem>
        ))}
      </SegmentGroup>
    </div>
  )
}

export default TableOfContents
