'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { usePathname } from '@tszhong0411/i18n/routing'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment, type ReactElement } from 'react'

import Link from './link'

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
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`

    // Get translated label for common paths
    let label = segment
    switch (segment) {
      case 'blog':
        label = t('layout.blog')
        break
      case 'projects':
        label = t('layout.projects')
        break
      case 'uses':
        label = t('layout.uses')
        break
      case 'spotify':
        label = t('layout.spotify')
        break
      case 'about':
        label = t('layout.about')
        break
      case 'sitemap':
        label = 'Sitemap'
        break
      case 'contact':
        label = 'Contact'
        break
      default:
        // Capitalize and format segment
        label = segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    }

    breadcrumbItems.push({
      label,
      href: currentPath
    })
  })

  return (
    <nav aria-label='Breadcrumb' className='mb-4'>
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
