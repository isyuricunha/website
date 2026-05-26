'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { usePathname } from '@isyuricunha/i18n/routing'
import { ChevronRight, Home } from 'lucide-react'

import Link from '../link'

const AdminBreadcrumb = () => {
  const pathname = usePathname()
  const t = useTranslations()

  const segments = pathname.split('/').filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const titleKey = segment.replaceAll('-', '_')
    const i18nKey = `admin.nav.${titleKey}` as any
    let label = segment.replaceAll('-', ' ')

    if (segment === 'admin') {
      label = t('admin.nav.dashboard')
    } else if (t.has(i18nKey)) {
      label = t(i18nKey)
    }

    const isLast = index === segments.length - 1

    return {
      href,
      label,
      isLast
    }
  })

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className='text-text-tertiary mb-6 flex items-center space-x-1 text-sm'>
      <Link href='/admin' className='hover:text-text-primary flex items-center transition-colors'>
        <Home className='h-4 w-4' />
        <span className='ml-1'>{t('admin.nav.dashboard')}</span>
      </Link>

      {breadcrumbs.slice(1).map((breadcrumb) => (
        <div key={breadcrumb.href} className='flex items-center'>
          <ChevronRight className='mx-1 h-4 w-4' />
          {breadcrumb.isLast ? (
            <span className='text-text-primary font-medium'>{breadcrumb.label}</span>
          ) : (
            <Link href={breadcrumb.href} className='hover:text-text-primary transition-colors'>
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export default AdminBreadcrumb
