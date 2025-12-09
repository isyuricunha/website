'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AdminBreadcrumb = () => {
  const pathname = usePathname()
  
  // Remove locale from pathname if present
  const cleanPath = pathname.replace(/^\/[a-z]{2}/, '')
  
  // Split path and filter out empty segments
  const segments = cleanPath.split('/').filter(Boolean)
  
  // Generate breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === segments.length - 1
    
    return {
      href,
      label,
      isLast
    }
  })

  // Don't show breadcrumbs if we're on the main admin page
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link 
        href="/admin" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="ml-1">Admin</span>
      </Link>
      
      {breadcrumbs.slice(1).map((breadcrumb) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {breadcrumb.isLast ? (
            <span className="font-medium text-foreground">{breadcrumb.label}</span>
          ) : (
            <Link 
              href={breadcrumb.href} 
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export default AdminBreadcrumb
