'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Info, CheckCircle, AlertTriangle, X } from 'lucide-react'

import { api } from '@/trpc/react'

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-4 w-4" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />
    case 'success':
      return <CheckCircle className="h-4 w-4" />
    case 'info':
    default:
      return <Info className="h-4 w-4" />
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
        toast.custom(
          (t) => (
            <div className="flex items-start gap-3 p-4 bg-background border rounded-lg shadow-lg max-w-md">
              {getAnnouncementIcon(announcement.type)}
              <div className="flex-1 space-y-1">
                <div className="font-medium text-sm">{announcement.title}</div>
                <div className="text-sm text-muted-foreground">
                  {announcement.content}
                </div>
                <div className="flex gap-2 mt-2">
                  {announcement.isDismissible && (
                    <button
                      onClick={() => {
                        dismissMutation.mutate({ announcementId: announcement.id })
                        // Add to dismissed list in sessionStorage
                        const dismissed = JSON.parse(
                          sessionStorage.getItem('dismissedAnnouncements') || '[]'
                        )
                        dismissed.push(announcement.id)
                        sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissed))
                        toast.dismiss(t)
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Don't show again
                    </button>
                  )}
                  <button
                    onClick={() => toast.dismiss(t)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Close
                  </button>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ),
          {
            id: toastId,
            duration: announcement.priority >= 5 ? Infinity : 10000, // Critical announcements stay until dismissed
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
