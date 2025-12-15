'use client'

import { useState } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { X, AlertCircle, Info, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'

import { api } from '@/trpc/react'

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className='h-5 w-5' />
    case 'warning':
      return <AlertTriangle className='h-5 w-5' />
    case 'success':
      return <CheckCircle className='h-5 w-5' />
    case 'feature':
      return <Sparkles className='h-5 w-5' />
    case 'info':
    default:
      return <Info className='h-5 w-5' />
  }
}

const getAnnouncementStyles = (type: string) => {
  if (type === 'error') {
    return {
      container: 'bg-destructive/10 border-destructive/20',
      icon: 'text-destructive',
      title: 'text-destructive',
      content: 'text-destructive/80'
    }
  }

  return {
    container: 'bg-primary/10 border-primary/20',
    icon: 'text-primary',
    title: 'text-foreground',
    content: 'text-muted-foreground'
  }
}

export default function AnnouncementBanner() {
  const t = useTranslations()
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>(() => {
    if (globalThis.window !== undefined) {
      const dismissed = sessionStorage.getItem('dismissedAnnouncements')
      return dismissed ? JSON.parse(dismissed) : []
    }
    return []
  })

  // Get active announcements
  const { data: announcementsData } = api.announcements.getAnnouncements.useQuery({
    active: true,
    adminView: false
  })

  // Dismiss announcement mutation
  const dismissMutation = api.announcements.dismissAnnouncement.useMutation({
    onSuccess: (_, variables) => {
      const newDismissed = [...dismissedAnnouncements, variables.announcementId]
      setDismissedAnnouncements(newDismissed)
      if (globalThis.window !== undefined) {
        sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed))
      }
    }
  })

  const handleDismiss = (announcementId: string) => {
    dismissMutation.mutate({ announcementId })
  }

  if (!announcementsData?.announcements) {
    return null
  }

  // Filter announcements that haven't been dismissed (date filtering and sorting are done server-side)
  const activeAnnouncements = announcementsData.announcements.filter(
    (announcement) => !dismissedAnnouncements.includes(announcement.id)
  )

  if (activeAnnouncements.length === 0) {
    return null
  }

  return (
    <div className='space-y-3'>
      {activeAnnouncements.map((announcement) => {
        const styles = getAnnouncementStyles(announcement.type)
        return (
          <div
            key={announcement.id}
            className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${styles.container}`}
          >
            <div className='relative p-4'>
              <div className='flex items-start gap-4'>
                <div
                  className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${styles.icon}`}
                >
                  {getAnnouncementIcon(announcement.type)}
                </div>

                <div className='min-w-0 flex-1 space-y-1.5'>
                  <div className='flex items-center gap-2'>
                    <h4 className={`text-base font-semibold leading-tight ${styles.title}`}>
                      {announcement.title}
                    </h4>
                    {announcement.priority > 5 && (
                      <span className='bg-current/10 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'>
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${styles.content}`}>
                    {announcement.content}
                  </p>
                </div>

                {announcement.isDismissible && (
                  <button
                    type='button'
                    onClick={() => handleDismiss(announcement.id)}
                    disabled={dismissMutation.isPending}
                    className='hover:bg-muted/50 flex-shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-50'
                    aria-label={t('component.announcement-banner.dismiss')}
                  >
                    <X className='h-4 w-4 opacity-60 transition-opacity hover:opacity-100' />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
