'use client'

import { useEffect } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { toast } from 'sonner'
import { AlertCircle, Info, CheckCircle, AlertTriangle, X, Sparkles } from 'lucide-react'

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
      icon: 'text-destructive',
      title: 'text-destructive',
      content: 'text-destructive/80',
      button: 'text-destructive/80 hover:text-destructive'
    }
  }

  return {
    icon: 'text-primary',
    title: 'text-foreground',
    content: 'text-muted-foreground',
    button: 'text-muted-foreground hover:text-foreground'
  }
}

export default function AnnouncementToast() {
  const t_announcement = useTranslations('component.announcement-toast')

  // Get urgent announcements (priority >= 3)
  const { data: announcementsData } = api.announcements.getAnnouncements.useQuery({
    active: true,
    adminView: false
  })

  // Dismiss announcement mutation
  const dismissMutation = api.announcements.dismissAnnouncement.useMutation()

  useEffect(() => {
    if (!announcementsData?.announcements) return

    // Get dismissed announcements from sessionStorage
    const dismissedAnnouncements = JSON.parse(
      sessionStorage.getItem('dismissedAnnouncements') || '[]'
    )

    // Filter urgent announcements that haven't been dismissed (date filtering is done server-side)
    const urgentAnnouncements = announcementsData.announcements.filter(
      (announcement) =>
        announcement.priority >= 3 && // Only urgent announcements
        !dismissedAnnouncements.includes(announcement.id)
    )

    // Show toast for each urgent announcement
    urgentAnnouncements.forEach((announcement) => {
      const toastId = `announcement-${announcement.id}`

      // Check if this toast was already shown in this session
      const shownToasts = JSON.parse(sessionStorage.getItem('shownAnnouncementToasts') || '[]')

      if (!shownToasts.includes(announcement.id)) {
        const styles = getAnnouncementStyles(announcement.type)
        toast.custom(
          (t: string | number) => (
            <div className='border-border/50 bg-background/95 animate-in slide-in-from-top-5 fade-in group relative max-w-md overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl'>
              <div className='from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent' />
              <div className='relative p-5'>
                <div className='flex items-start gap-4'>
                  <div className={`flex-shrink-0 transition-transform duration-300 ${styles.icon}`}>
                    {getAnnouncementIcon(announcement.type)}
                  </div>

                  <div className='min-w-0 flex-1 space-y-2'>
                    <h4 className={`text-base font-semibold leading-tight ${styles.title}`}>
                      {announcement.title}
                    </h4>
                    <p className={`text-sm leading-relaxed ${styles.content}`}>
                      {announcement.content}
                    </p>

                    <div className='flex items-center gap-3 pt-1'>
                      {announcement.isDismissible && (
                        <button
                          type='button'
                          onClick={() => {
                            dismissMutation.mutate({ announcementId: announcement.id })
                            const dismissed = JSON.parse(
                              sessionStorage.getItem('dismissedAnnouncements') || '[]'
                            )
                            dismissed.push(announcement.id)
                            sessionStorage.setItem(
                              'dismissedAnnouncements',
                              JSON.stringify(dismissed)
                            )
                            toast.dismiss(t)
                          }}
                          className={`text-xs font-medium transition-colors ${styles.button}`}
                        >
                          {t_announcement('dont-show-again')}
                        </button>
                      )}
                      <button
                        type='button'
                        onClick={() => toast.dismiss(t)}
                        className={`text-xs font-medium transition-colors ${styles.button}`}
                      >
                        {t_announcement('dismiss')}
                      </button>
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={() => toast.dismiss(t)}
                    className='hover:bg-accent/50 flex-shrink-0 rounded-lg p-1.5 transition-colors'
                    aria-label={t_announcement('close')}
                  >
                    <X className='h-4 w-4 opacity-50 transition-opacity hover:opacity-100' />
                  </button>
                </div>
              </div>
            </div>
          ),
          {
            id: toastId,
            duration: announcement.priority >= 5 ? Infinity : 10_000, // Critical announcements stay until dismissed
            position: 'top-right'
          }
        )

        // Mark as shown in this session
        shownToasts.push(announcement.id)
        sessionStorage.setItem('shownAnnouncementToasts', JSON.stringify(shownToasts))
      }
    })
  }, [announcementsData, dismissMutation, t_announcement])

  return null // This component doesn't render anything directly
}
