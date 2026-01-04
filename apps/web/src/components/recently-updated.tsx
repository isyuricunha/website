'use client'

import { useLocale, useTranslations } from '@isyuricunha/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@isyuricunha/ui'
import { Clock, FileText, Code, Calendar } from 'lucide-react'
import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { allPosts, allProjects } from 'content-collections'

import Link from './link'

type UpdatedItem = {
  id: string
  title: string
  description: string
  href: string
  type: 'post' | 'project'
  date: string
  icon: ReactNode
}

const RecentlyUpdated = () => {
  const t = useTranslations()
  const locale = useLocale()

  const recentlyUpdated = useMemo(() => {
    const items: UpdatedItem[] = []
    const seenIds = new Set<string>()

    // Add blog posts filtered by current locale
    allPosts
      .filter((post) => post.locale === locale)
      .forEach((post) => {
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
      .filter((project) => project.locale === locale)
      .forEach((project) => {
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
      .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }, [locale])

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      }),
    [locale]
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return dateFormatter.format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
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
              className='hover:bg-muted/50 group block rounded-lg p-3 transition-colors'
            >
              <div className='flex items-start gap-3'>
                <div className='text-muted-foreground group-hover:text-foreground mt-0.5 shrink-0'>
                  {item.icon}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <h4 className='group-hover:text-primary truncate text-sm font-medium sm:text-base'>
                      {item.title}
                    </h4>
                    <span className='text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs'>
                      {item.type === 'post'
                        ? t('homepage.recently-updated.type.post')
                        : t('homepage.recently-updated.type.project')}
                    </span>
                  </div>
                  <p className='text-muted-foreground mb-2 line-clamp-2 text-xs sm:text-sm'>
                    {item.description}
                  </p>
                  <div className='flex items-center gap-1'>
                    <Calendar className='text-muted-foreground h-3 w-3' />
                    <span className='text-muted-foreground text-xs'>
                      {t('homepage.recently-updated.updated-on', { date: formatDate(item.date) })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recentlyUpdated.length === 0 && (
          <div className='py-8 text-center'>
            <Clock className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-sm'>{t('homepage.recently-updated.empty')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentlyUpdated
