'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { usePathname } from '@tszhong0411/i18n/routing'
import { cn } from '@tszhong0411/utils'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'motion/react'

import Link from '../link'

const Breadcrumb = () => {
  const pathname = usePathname()
  const t = useTranslations()

  // Don't show breadcrumbs on home page
  if (pathname === '/') return null

  const pathSegments = pathname.split('/').filter(Boolean)
  
  const breadcrumbItems = [
    { href: '/', label: t('layout.home'), icon: Home }
  ]

  // Build breadcrumb items from path segments
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Get localized label for common routes
    let label = segment
    const routeLabels: Record<string, string> = {
      blog: t('layout.blog'),
      projects: t('layout.projects'),
      about: t('layout.about'),
      guestbook: t('layout.guestbook'),
      uses: t('layout.uses'),
      spotify: t('layout.spotify')
    }
    
    if (routeLabels[segment]) {
      label = routeLabels[segment]
    } else {
      // Capitalize and format segment
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    }

    breadcrumbItems.push({
      href: currentPath,
      label,
      icon: null
    })
  })

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-6"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          const Icon = item.icon

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="mx-2 h-4 w-4 text-muted-foreground" 
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span 
                  className="flex items-center gap-1.5 font-medium text-foreground"
                  aria-current="page"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1 py-0.5"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </motion.nav>
  )
}

export default Breadcrumb
