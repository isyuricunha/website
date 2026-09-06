'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { usePathname } from '@isyuricunha/i18n/routing'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment, type ReactElement } from 'react'

import Link from './link'

const getSegmentLabel = (segment: string, t: ReturnType<typeof useTranslations>): string => {
  switch (segment) {
    case 'blog':
      return t('layout.blog')
    case 'projects':
      return t('layout.projects')
    case 'now':
      return t('layout.now')
    case 'uses':
      return t('layout.uses')
    case 'music':
      return t('layout.music')
    case 'about':
      return t('layout.about')
    case 'sitemap':
      return t('layout.sitemap')
    case 'contact':
      return t('layout.contact')
    default:
      // Capitalize and format segment
      return segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

const Breadcrumbs = () => {
  const pathname = usePathname()
  const t = useTranslations()

  // Don't show breadcrumbs on home page
  if (pathname === '/') return null

  const pathSegments = pathname.split('/').filter(Boolean)

  const breadcrumbItems: Array<{ label: string; href: string; icon?: ReactElement }> = [
    {
      label: t('layout.home'),
      href: '/',
      icon: <Home className='h-3 w-3' />
    }
  ]

  // Build breadcrumb path
  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath += `/${segment}`

    // Get translated label for common paths
    const label = getSegmentLabel(segment, t)

    breadcrumbItems.push({
      label,
      href: currentPath
    })
  }

  return (
    <nav aria-label={t('component.breadcrumbs.aria-label')} className='mb-4'>
      <ol className='text-muted-foreground flex items-center space-x-2 text-xs sm:text-sm'>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1

          return (
            <Fragment key={item.href}>
              <li className='flex items-center'>
                {isLast ? (
                  <span className='text-foreground flex items-center gap-1 font-medium'>
                    {item.icon}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className='hover:text-foreground flex items-center gap-1 transition-colors'
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li>
                  <ChevronRight className='h-3 w-3' />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
