'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { X, Bell } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea
} from '@isyuricunha/ui'
import { useLocale, useTranslations } from '@isyuricunha/i18n/client'

import { api } from '@/trpc/react'
import { getAnnouncementUi } from '@/lib/announcement-ui'
import { hasHighPriorityBadge } from '@/lib/announcement-priority'
import {
  addDismissedAnnouncementId,
  getDismissedAnnouncementIds
} from '@/utils/announcement-storage'

interface AnnouncementWidgetProps {
  className?: string
  maxItems?: number
}

export default function AnnouncementWidget({ className, maxItems = 5 }: AnnouncementWidgetProps) {
  const t = useTranslations('component.announcement-widget')
  const locale = useLocale()
  const date_locale = locale === 'pt' ? 'pt-BR' : 'en-US'

  const [dismissedItems, setDismissedItems] = useState<string[]>(() => {
    return getDismissedAnnouncementIds()
  })

  // Get active announcements
  const { data: announcementsData, isLoading } = api.announcements.getAnnouncements.useQuery({
    active: true,
    adminView: false
  })

  const markViewedMutation = api.announcements.markAnnouncementViewed.useMutation()

  const dismissMutation = api.announcements.dismissAnnouncement.useMutation({
    onSuccess: (_data, variables) => {
      const next = addDismissedAnnouncementId(dismissedItems, variables.announcementId)
      setDismissedItems(next)
    }
  })

  const handleDismiss = (announcementId: string, event: MouseEvent) => {
    event.stopPropagation()
    dismissMutation.mutate({ announcementId })
  }

  const activeAnnouncements = (announcementsData?.announcements ?? [])
    .filter(
      (announcement) =>
        !announcement.userInteraction?.dismissed && !dismissedItems.includes(announcement.id)
    )
    .slice(0, maxItems)

  useEffect(() => {
    if (activeAnnouncements.length === 0) return
    activeAnnouncements.forEach((announcement) => {
      markViewedMutation.mutate({ announcementId: announcement.id })
    })
  }, [activeAnnouncements, markViewedMutation])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Bell className='h-4 w-4' />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground text-sm'>{t('loading')}</div>
        </CardContent>
      </Card>
    )
  }

  if (!announcementsData?.announcements) {
    return null
  }

  if (activeAnnouncements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Bell className='h-4 w-4' />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground text-sm'>{t('empty')}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl'>
            <Bell className='text-primary h-5 w-5' />
          </div>
          <div className='flex-1'>
            <CardTitle className='text-base font-semibold'>{t('title')}</CardTitle>
            <CardDescription className='text-xs'>{t('description')}</CardDescription>
          </div>
          <Badge variant='secondary' className='text-xs font-medium'>
            {activeAnnouncements.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <ScrollArea className='h-[320px] pr-4'>
          <div className='space-y-3'>
            {activeAnnouncements.map((announcement) => {
              const ui = getAnnouncementUi(announcement.type, { iconSize: 'sm' })
              return (
                <div
                  key={announcement.id}
                  className='border-border/50 hover:border-border group relative rounded-lg border p-3 transition-all duration-200 hover:shadow-sm'
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${ui.iconClassName}`}
                    >
                      {ui.icon}
                    </div>

                    <div className='min-w-0 flex-1 space-y-2'>
                      <div className='flex items-start gap-2'>
                        <h4 className='flex-1 text-sm leading-tight font-semibold'>
                          {announcement.title}
                        </h4>
                        {announcement.isDismissible && (
                          <button
                            type='button'
                            onClick={(e) => handleDismiss(announcement.id, e)}
                            disabled={dismissMutation.isPending}
                            className='hover:bg-accent shrink-0 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50'
                            aria-label={t('dismiss')}
                          >
                            <X className='h-3 w-3' />
                          </button>
                        )}
                      </div>

                      <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
                        {announcement.content}
                      </p>

                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={`text-[10px] font-medium ${ui.badgeClassName}`}
                        >
                          {announcement.type}
                        </Badge>
                        {hasHighPriorityBadge(announcement.priority) && (
                          <Badge
                            variant='outline'
                            className='bg-primary/10 text-primary border-primary/20 text-[10px] font-medium'
                          >
                            {t('high-priority')}
                          </Badge>
                        )}
                        <span className='text-muted-foreground ml-auto text-[10px]'>
                          {new Date(announcement.createdAt).toLocaleDateString(date_locale, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
