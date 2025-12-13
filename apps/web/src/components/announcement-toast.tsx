'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Info, CheckCircle, AlertTriangle, X, Sparkles } from 'lucide-react'

import { api } from '@/trpc/react'

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-5 w-5" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5" />
    case 'success':
      return <CheckCircle className="h-5 w-5" />
    case 'feature':
      return <Sparkles className="h-5 w-5" />
    case 'info':
    default:
      return <Info className="h-5 w-5" />
  }
}

const getAnnouncementStyles = (type: string) => {
  switch (type) {
    case 'error':
      return {
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100',
        content: 'text-red-800/80 dark:text-red-200/70',
        button: 'text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100'
      }
    case 'warning':
      return {
        icon: 'text-amber-600 dark:text-amber-400',
        title: 'text-amber-900 dark:text-amber-100',
        content: 'text-amber-800/80 dark:text-amber-200/70',
        button: 'text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100'
      }
    case 'success':
      return {
        icon: 'text-emerald-600 dark:text-emerald-400',
        title: 'text-emerald-900 dark:text-emerald-100',
        content: 'text-emerald-800/80 dark:text-emerald-200/70',
        button: 'text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100'
      }
    case 'feature':
      return {
        icon: 'text-purple-600 dark:text-purple-400',
        title: 'text-purple-900 dark:text-purple-100',
        content: 'text-purple-800/80 dark:text-purple-200/70',
        button: 'text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100'
      }
    case 'info':
    default:
      return {
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100',
        content: 'text-blue-800/80 dark:text-blue-200/70',
        button: 'text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100'
      }
  }
}

export default function AnnouncementToast() {
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
    const urgentAnnouncements = announcementsData.announcements
      .filter(announcement =>
        announcement.priority >= 3 && // Only urgent announcements
        !dismissedAnnouncements.includes(announcement.id)
      )

    // Show toast for each urgent announcement
    urgentAnnouncements.forEach((announcement) => {
      const toastId = `announcement-${announcement.id}`

      // Check if this toast was already shown in this session
      const shownToasts = JSON.parse(
        sessionStorage.getItem('shownAnnouncementToasts') || '[]'
      )

      if (!shownToasts.includes(announcement.id)) {
        const styles = getAnnouncementStyles(announcement.type)
        toast.custom(
          (t) => (
            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl max-w-md animate-in slide-in-from-top-5 fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              <div className="relative p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 transition-transform duration-300 ${styles.icon}`}>
                    {getAnnouncementIcon(announcement.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 className={`font-semibold text-base leading-tight ${styles.title}`}>
                      {announcement.title}
                    </h4>
                    <p className={`text-sm leading-relaxed ${styles.content}`}>
                      {announcement.content}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      {announcement.isDismissible && (
                        <button
                          type="button"
                          onClick={() => {
                            dismissMutation.mutate({ announcementId: announcement.id })
                            const dismissed = JSON.parse(
                              sessionStorage.getItem('dismissedAnnouncements') || '[]'
                            )
                            dismissed.push(announcement.id)
                            sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissed))
                            toast.dismiss(t)
                          }}
                          className={`text-xs font-medium transition-colors ${styles.button}`}
                        >
                          Don't show again
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toast.dismiss(t)}
                        className={`text-xs font-medium transition-colors ${styles.button}`}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.dismiss(t)}
                    className="flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-accent/50"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
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
  }, [announcementsData, dismissMutation])

  return null // This component doesn't render anything directly
}
