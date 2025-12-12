'use client'

import { useLocale, useTranslations } from '@tszhong0411/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Clock, FileText, Code, Calendar } from 'lucide-react'
import { useMemo } from 'react'

import { allPosts , allProjects } from 'content-collections'

import Link from './link'

type UpdatedItem = {
  id: string
  title: string
  description: string
  href: string
  type: 'post' | 'project'
  date: string
  icon: React.ReactNode
}

const RecentlyUpdated = () => {
  const t = useTranslations()
  const locale = useLocale()

  const recentlyUpdated = useMemo(() => {
    const items: UpdatedItem[] = []
    const seenIds = new Set<string>()

    // Add blog posts filtered by current locale
    allPosts
      .filter(post => post.locale === locale)
      .forEach(post => {
        const id = `post-${post.slug}`
        if (!seenIds.has(id)) {
          seenIds.add(id)
          items.push({
            id,
            title: post.title,
            description: post.summary,
            href: `/blog/${post.slug}`,
            type: 'post',
            date: post.modifiedTime || post.date,
            icon: <FileText className='h-4 w-4' />
          })
        }
      })

    // Add projects filtered by current locale (using a fallback date if no modified time)
    allProjects
      .filter(project => project.locale === locale)
      .forEach(project => {
        const id = `project-${project.slug}`
        if (!seenIds.has(id)) {
          seenIds.add(id)
          items.push({
            id,
            title: project.name,
            description: project.description,
            href: `/projects#${project.slug}`,
            type: 'project',
            date: project.endDate || project.startDate || new Date('2024-01-01').toISOString(),
            icon: <Code className='h-4 w-4' />
          })
        }
      })

    // Sort by date and take top 3
    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }, [locale])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    // Use a consistent format to avoid hydration mismatches
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
          <Clock className='h-5 w-5' />
          {t('homepage.recently-updated.title')}
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          {t('homepage.recently-updated.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {recentlyUpdated.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className='group block p-3 rounded-lg hover:bg-muted/50 transition-colors'
            >
              <div className='flex items-start gap-3'>
                <div className='flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground'>
                  {item.icon}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h4 className='text-sm sm:text-base font-medium truncate group-hover:text-primary'>
                      {item.title}
                    </h4>
                    <span className='text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full'>
                      {item.type === 'post'
                        ? t('homepage.recently-updated.type.post')
                        : t('homepage.recently-updated.type.project')}
                    </span>
                  </div>
                  <p className='text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2'>
                    {item.description}
                  </p>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3 text-muted-foreground' />
                    <span className='text-xs text-muted-foreground'>
                      {t('homepage.recently-updated.updated-on', { date: formatDate(item.date) })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recentlyUpdated.length === 0 && (
          <div className='text-center py-8'>
            <Clock className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <p className='text-sm text-muted-foreground'>{t('homepage.recently-updated.empty')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentlyUpdated
