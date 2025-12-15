'use client'

import { useState, type MouseEvent } from 'react'
import { X, Bell, AlertCircle, Info, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea
} from '@isyuricunha/ui'

import { api } from '@/trpc/react'

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className='h-4 w-4' />
    case 'warning':
      return <AlertTriangle className='h-4 w-4' />
    case 'success':
      return <CheckCircle className='h-4 w-4' />
    case 'feature':
      return <Sparkles className='h-4 w-4' />
    case 'info':
    default:
      return <Info className='h-4 w-4' />
  }
}

const getAnnouncementStyles = (type: string) => {
  if (type === 'error') {
    return {
      icon: 'text-destructive',
      badge: 'bg-destructive/10 text-destructive border-destructive/20'
    }
  }

  return {
    icon: 'text-primary',
    badge: 'bg-primary/10 text-primary border-primary/20'
  }
}

interface AnnouncementWidgetProps {
  className?: string
  maxItems?: number
}

export default function AnnouncementWidget({ className, maxItems = 5 }: AnnouncementWidgetProps) {
  const [dismissedItems, setDismissedItems] = useState<string[]>(() => {
    if (globalThis.window !== undefined) {
      const dismissed = sessionStorage.getItem('dismissedAnnouncements')
      return dismissed ? JSON.parse(dismissed) : []
    }
    return []
  })

  // Get active announcements
  const { data: announcementsData, isLoading } = api.announcements.getAnnouncements.useQuery({
    active: true,
    adminView: false
  })

  const dismissMutation = api.announcements.dismissAnnouncement.useMutation({
    onSuccess: (_data, variables) => {
      const newDismissed = [...dismissedItems, variables.announcementId]
      setDismissedItems(newDismissed)
      if (globalThis.window !== undefined) {
        sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed))
      }
    }
  })

  const handleDismiss = (announcementId: string, event: MouseEvent) => {
    event.stopPropagation()
    dismissMutation.mutate({ announcementId })
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Bell className='h-4 w-4' />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground text-sm'>Loading announcements...</div>
        </CardContent>
      </Card>
    )
  }

  if (!announcementsData?.announcements) {
    return null
  }

  // Filter announcements that haven't been dismissed (date filtering is done server-side)
  const activeAnnouncements = announcementsData.announcements
    .filter((announcement) => !dismissedItems.includes(announcement.id))
    .slice(0, maxItems)

  if (activeAnnouncements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Bell className='h-4 w-4' />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground text-sm'>No announcements at this time.</div>
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
            <CardTitle className='text-base font-semibold'>Announcements</CardTitle>
            <CardDescription className='text-xs'>
              Latest updates and important information
            </CardDescription>
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
              const styles = getAnnouncementStyles(announcement.type)
              return (
                <div
                  key={announcement.id}
                  className='border-border/50 hover:border-border group relative rounded-lg border p-3 transition-all duration-200 hover:shadow-sm'
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${styles.icon}`}
                    >
                      {getAnnouncementIcon(announcement.type)}
                    </div>

                    <div className='min-w-0 flex-1 space-y-2'>
                      <div className='flex items-start gap-2'>
                        <h4 className='flex-1 text-sm font-semibold leading-tight'>
                          {announcement.title}
                        </h4>
                        {announcement.isDismissible && (
                          <button
                            type='button'
                            onClick={(e) => handleDismiss(announcement.id, e)}
                            disabled={dismissMutation.isPending}
                            className='hover:bg-accent flex-shrink-0 rounded-md p-1 opacity-0 transition-opacity disabled:opacity-50 group-hover:opacity-100'
                            aria-label='Dismiss'
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
                          className={`text-[10px] font-medium ${styles.badge}`}
                        >
                          {announcement.type}
                        </Badge>
                        {announcement.priority > 5 && (
                          <Badge
                            variant='outline'
                            className='bg-primary/10 text-primary border-primary/20 text-[10px] font-medium'
                          >
                            High Priority
                          </Badge>
                        )}
                        <span className='text-muted-foreground ml-auto text-[10px]'>
                          {new Date(announcement.createdAt).toLocaleDateString('en-US', {
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
