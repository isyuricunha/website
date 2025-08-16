'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Info, CheckCircle, AlertTriangle, X } from 'lucide-react'

import { api } from '@/trpc/react'
import { useNotificationSound } from '@/hooks/use-notification-sound'

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

  // Sound functionality
  const { playSound, preloadSound } = useNotificationSound({
    volume: 0.6,
    enabled: true,
    type: 'toast'
  })

  // Preload sound on component mount
  useEffect(() => {
    preloadSound()
  }, [preloadSound])

  useEffect(() => {
    if (!announcementsData?.announcements) return

    // Get dismissed announcements from localStorage
    const dismissedAnnouncements = JSON.parse(
      localStorage.getItem('dismissedAnnouncements') || '[]'
    )

    // Filter urgent announcements that haven't been dismissed
    const urgentAnnouncements = announcementsData.announcements
      .filter(announcement => 
        announcement.isActive && 
        announcement.priority >= 3 && // Only urgent announcements
        !dismissedAnnouncements.includes(announcement.id) &&
        (!announcement.startDate || new Date(announcement.startDate) <= new Date()) &&
        (!announcement.endDate || new Date(announcement.endDate) >= new Date())
      )
      .sort((a, b) => b.priority - a.priority)

    // Show toast for each urgent announcement
    urgentAnnouncements.forEach((announcement) => {
      const toastId = `announcement-${announcement.id}`
      
      // Check if this toast was already shown in this session
      const shownToasts = JSON.parse(
        sessionStorage.getItem('shownAnnouncementToasts') || '[]'
      )
      
      if (!shownToasts.includes(announcement.id)) {
        // Play notification sound for new announcements
        playSound()
        
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
                        // Add to dismissed list
                        const dismissed = JSON.parse(
                          localStorage.getItem('dismissedAnnouncements') || '[]'
                        )
                        dismissed.push(announcement.id)
                        localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissed))
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
