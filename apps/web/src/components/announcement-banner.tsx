'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@tszhong0411/ui'
import { Card, CardContent } from '@tszhong0411/ui'

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
  const t = useTranslations()
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
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
      if (typeof window !== 'undefined') {
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
  const activeAnnouncements = announcementsData.announcements
    .filter(announcement => !dismissedAnnouncements.includes(announcement.id))

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
                  <span className="sr-only">{t('component.announcement-banner.dismiss')}</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
