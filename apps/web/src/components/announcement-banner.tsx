'use client'

import { useState } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { X, AlertCircle, Info, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'

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
        container: 'bg-red-500/5 border-red-500/20 dark:bg-red-500/10 dark:border-red-500/30',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100',
        content: 'text-red-800/80 dark:text-red-200/80'
      }
    case 'warning':
      return {
        container: 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/30',
        icon: 'text-amber-600 dark:text-amber-400',
        title: 'text-amber-900 dark:text-amber-100',
        content: 'text-amber-800/80 dark:text-amber-200/80'
      }
    case 'success':
      return {
        container: 'bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/30',
        icon: 'text-emerald-600 dark:text-emerald-400',
        title: 'text-emerald-900 dark:text-emerald-100',
        content: 'text-emerald-800/80 dark:text-emerald-200/80'
      }
    case 'feature':
      return {
        container: 'bg-purple-500/5 border-purple-500/20 dark:bg-purple-500/10 dark:border-purple-500/30',
        icon: 'text-purple-600 dark:text-purple-400',
        title: 'text-purple-900 dark:text-purple-100',
        content: 'text-purple-800/80 dark:text-purple-200/80'
      }
    case 'info':
    default:
      return {
        container: 'bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10 dark:border-blue-500/30',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100',
        content: 'text-blue-800/80 dark:text-blue-200/80'
      }
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
    <div className="space-y-3">
      {activeAnnouncements.map((announcement) => {
        const styles = getAnnouncementStyles(announcement.type)
        return (
          <div
            key={announcement.id}
            className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${styles.container}`}
          >
            <div className="relative p-4">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${styles.icon}`}>
                  {getAnnouncementIcon(announcement.type)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold text-base leading-tight ${styles.title}`}>
                      {announcement.title}
                    </h4>
                    {announcement.priority > 5 && (
                      <span className="inline-flex items-center rounded-full bg-current/10 px-2 py-0.5 text-xs font-medium">
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
                    onClick={() => handleDismiss(announcement.id)}
                    disabled={dismissMutation.isPending}
                    className="flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                    aria-label={t('component.announcement-banner.dismiss')}
                  >
                    <X className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity" />
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
