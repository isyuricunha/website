'use client'

import { useState } from 'react'
import { X, Bell, AlertCircle, Info, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Badge } from '@tszhong0411/ui'
import { ScrollArea } from '@tszhong0411/ui'

import { api } from '@/trpc/react'

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-4 w-4" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />
    case 'success':
      return <CheckCircle className="h-4 w-4" />
    case 'feature':
      return <Sparkles className="h-4 w-4" />
    case 'info':
    default:
      return <Info className="h-4 w-4" />
  }
}

const getAnnouncementStyles = (type: string) => {
  switch (type) {
    case 'error':
      return {
        icon: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
      }
    case 'warning':
      return {
        icon: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
      }
    case 'success':
      return {
        icon: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
      }
    case 'feature':
      return {
        icon: 'text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
      }
    case 'info':
    default:
      return {
        icon: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
      }
  }
}

interface AnnouncementWidgetProps {
  className?: string
  maxItems?: number
}

export default function AnnouncementWidget({ className, maxItems = 5 }: AnnouncementWidgetProps) {
  const [dismissedItems, setDismissedItems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
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
    onSuccess: (data, variables) => {
      const newDismissed = [...dismissedItems, variables.announcementId]
      setDismissedItems(newDismissed)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed))
      }
    }
  })

  const handleDismiss = (announcementId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    dismissMutation.mutate({ announcementId })
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading announcements...</div>
        </CardContent>
      </Card>
    )
  }

  if (!announcementsData?.announcements) {
    return null
  }

  // Filter announcements that haven't been dismissed (date filtering is done server-side)
  const activeAnnouncements = announcementsData.announcements
    .filter(announcement => !dismissedItems.includes(announcement.id))
    .slice(0, maxItems)

  if (activeAnnouncements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No announcements at this time.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">Announcements</CardTitle>
            <CardDescription className="text-xs">
              Latest updates and important information
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            {activeAnnouncements.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-3">
            {activeAnnouncements.map((announcement) => {
              const styles = getAnnouncementStyles(announcement.type)
              return (
                <div
                  key={announcement.id}
                  className="group relative rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-border hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${styles.icon}`}>
                      {getAnnouncementIcon(announcement.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-2">
                        <h4 className="text-sm font-semibold leading-tight flex-1">
                          {announcement.title}
                        </h4>
                        {announcement.isDismissible && (
                          <button
                            onClick={(e) => handleDismiss(announcement.id, e)}
                            disabled={dismissMutation.isLoading}
                            className="flex-shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 disabled:opacity-50"
                            aria-label="Dismiss"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] font-medium ${styles.badge}`}>
                          {announcement.type}
                        </Badge>
                        {announcement.priority > 5 && (
                          <Badge variant="outline" className="text-[10px] font-medium bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20">
                            High Priority
                          </Badge>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
