'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@tszhong0411/ui'
import { Card, CardContent } from '@tszhong0411/ui'

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

const getAnnouncementColors = (type: string) => {
  switch (type) {
    case 'error':
      return 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100'
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100'
    case 'success':
      return 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
    case 'info':
    default:
      return 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100'
  }
}

export default function AnnouncementBanner() {
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([])
  const [previousAnnouncementIds, setPreviousAnnouncementIds] = useState<string[]>([])

  // Get active announcements
  const { data: announcementsData } = api.announcements.getAnnouncements.useQuery({
    active: true,
    adminView: false
  })

  // Dismiss announcement mutation
  const dismissMutation = api.announcements.dismissAnnouncement.useMutation({
    onSuccess: (_, variables) => {
      setDismissedAnnouncements(prev => [...prev, variables.announcementId])
    }
  })

  // Sound functionality
  const { playSound, preloadSound } = useNotificationSound({
    volume: 0.4, // Slightly lower volume for banner notifications
    enabled: true,
    type: 'banner'
  })

  // Preload sound on component mount
  useEffect(() => {
    preloadSound()
  }, [preloadSound])

  // Load dismissed announcements from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedAnnouncements')
    if (dismissed) {
      try {
        setDismissedAnnouncements(JSON.parse(dismissed))
      } catch (error) {
        console.error('Error parsing dismissed announcements:', error)
      }
    }
  }, [])

  // Save dismissed announcements to localStorage
  useEffect(() => {
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedAnnouncements))
  }, [dismissedAnnouncements])

  const handleDismiss = (announcementId: string) => {
    dismissMutation.mutate({ announcementId })
  }

  // Check for new announcements and play sound
  useEffect(() => {
    if (!announcementsData?.announcements) return

    const currentActiveAnnouncements = announcementsData.announcements
      .filter(announcement => 
        announcement.isActive && 
        !dismissedAnnouncements.includes(announcement.id) &&
        (!announcement.startDate || new Date(announcement.startDate) <= new Date()) &&
        (!announcement.endDate || new Date(announcement.endDate) >= new Date())
      )
      .map(a => a.id)

    // Check if there are new announcements (not in previous list)
    if (previousAnnouncementIds.length > 0) {
      const newAnnouncements = currentActiveAnnouncements.filter(
        id => !previousAnnouncementIds.includes(id)
      )
      
      if (newAnnouncements.length > 0) {
        playSound()
      }
    }

    // Only update if the arrays are actually different
    if (JSON.stringify(currentActiveAnnouncements) !== JSON.stringify(previousAnnouncementIds)) {
      setPreviousAnnouncementIds(currentActiveAnnouncements)
    }
  }, [announcementsData, dismissedAnnouncements, playSound])

  if (!announcementsData?.announcements) {
    return null
  }

  // Filter active announcements that haven't been dismissed
  const activeAnnouncements = announcementsData.announcements
    .filter(announcement => 
      announcement.isActive && 
      !dismissedAnnouncements.includes(announcement.id) &&
      (!announcement.startDate || new Date(announcement.startDate) <= new Date()) &&
      (!announcement.endDate || new Date(announcement.endDate) >= new Date())
    )
    .sort((a, b) => b.priority - a.priority) // Sort by priority (highest first)

  if (activeAnnouncements.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {activeAnnouncements.map((announcement) => (
        <Card 
          key={announcement.id} 
          className={`relative border ${getAnnouncementColors(announcement.type)}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getAnnouncementIcon(announcement.type)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{announcement.title}</h4>
                </div>
                <p className="text-sm opacity-90">
                  {announcement.content}
                </p>
              </div>
              {announcement.isDismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={() => handleDismiss(announcement.id)}
                  disabled={dismissMutation.isPending}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Dismiss announcement</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
