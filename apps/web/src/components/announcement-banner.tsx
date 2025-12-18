'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from '@isyuricunha/i18n/client'
import { X } from 'lucide-react'

import { api } from '@/trpc/react'
import { getAnnouncementUi } from '@/lib/announcement-ui'
import { addDismissedAnnouncementId, getDismissedAnnouncementIds } from '@/utils/announcement-storage'

export default function AnnouncementBanner() {
  const t = useTranslations()
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>(() => {
    return getDismissedAnnouncementIds()
  })

  // Get active announcements
  const { data: announcementsData } = api.announcements.getAnnouncements.useQuery({
    active: true,
    adminView: false
  })

  const markViewedMutation = api.announcements.markAnnouncementViewed.useMutation()

  // Dismiss announcement mutation
  const dismissMutation = api.announcements.dismissAnnouncement.useMutation({
    onSuccess: (_, variables) => {
      const next = addDismissedAnnouncementId(dismissedAnnouncements, variables.announcementId)
      setDismissedAnnouncements(next)
    }
  })

  const handleDismiss = (announcementId: string) => {
    dismissMutation.mutate({ announcementId })
  }

  const activeAnnouncements = (announcementsData?.announcements ?? []).filter(
    (announcement) =>
      !announcement.userInteraction?.dismissed && !dismissedAnnouncements.includes(announcement.id)
  )

  useEffect(() => {
    if (activeAnnouncements.length === 0) return
    activeAnnouncements.forEach((announcement) => {
      markViewedMutation.mutate({ announcementId: announcement.id })
    })
  }, [activeAnnouncements, markViewedMutation])

  if (!announcementsData?.announcements) {
    return null
  }

  if (activeAnnouncements.length === 0) {
    return null
  }

  return (
    <div className='space-y-3'>
      {activeAnnouncements.map((announcement) => {
        const ui = getAnnouncementUi(announcement.type, { iconSize: 'md' })
        return (
          <div
            key={announcement.id}
            className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${ui.containerClassName}`}
          >
            <div className='relative p-4'>
              <div className='flex items-start gap-4'>
                <div
                  className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${ui.iconClassName}`}
                >
                  {ui.icon}
                </div>

                <div className='min-w-0 flex-1 space-y-1.5'>
                  <div className='flex items-center gap-2'>
                    <h4 className={`text-base font-semibold leading-tight ${ui.titleClassName}`}>
                      {announcement.title}
                    </h4>
                    {announcement.priority > 5 && (
                      <span className='bg-current/10 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'>
                        {t('component.announcement-banner.high-priority')}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${ui.contentClassName}`}>
                    {announcement.content}
                  </p>
                </div>

                {announcement.isDismissible && (
                  <button
                    type='button'
                    onClick={() => handleDismiss(announcement.id)}
                    disabled={dismissMutation.isPending}
                    className='hover:bg-muted/50 shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-50'
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
