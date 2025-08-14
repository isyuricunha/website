'use client'

import { useState } from 'react'
import { ChevronRight, X, Bell, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Button } from '@tszhong0411/ui'
import { Badge } from '@tszhong0411/ui'
import { ScrollArea } from '@tszhong0411/ui'

import { api } from '@/trpc/react'

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'info':
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

const getAnnouncementTypeColor = (type: string) => {
  switch (type) {
    case 'error':
      return 'destructive'
    case 'warning':
      return 'secondary'
    case 'success':
      return 'default'
    case 'info':
    default:
      return 'outline'
  }
}

interface AnnouncementWidgetProps {
  className?: string
  maxItems?: number
}

export default function AnnouncementWidget({ className, maxItems = 5 }: AnnouncementWidgetProps) {
  const [dismissedItems, setDismissedItems] = useState<string[]>([])

  // Get active announcements
  const { data: announcementsData } = api.announcements.getAnnouncements.useQuery({
    adminView: true
  })

  const dismissMutation = api.announcements.dismissAnnouncement.useMutation({
    onSuccess: (data, variables) => {
      setDismissedItems(prev => [...prev, variables.announcementId])
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

  // Filter active announcements that haven't been dismissed
  const activeAnnouncements = announcementsData.announcements
    .filter(announcement => 
      announcement.isActive && 
      !dismissedItems.includes(announcement.id) &&
      (!announcement.startDate || new Date(announcement.startDate) <= new Date()) &&
      (!announcement.endDate || new Date(announcement.endDate) >= new Date())
    )
    .sort((a, b) => b.priority - a.priority)
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Bell className="h-4 w-4" />
          Announcements
          <Badge variant="secondary" className="ml-auto text-xs">
            {activeAnnouncements.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Latest updates and important information
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {activeAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="group relative flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                {getAnnouncementIcon(announcement.type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium leading-none">
                      {announcement.title}
                    </h4>
                    <Badge 
                      variant={getAnnouncementTypeColor(announcement.type) as any} 
                      className="text-xs"
                    >
                      {announcement.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    {announcement.priority > 0 && (
                      <>
                        <span>•</span>
                        <span>Priority: {announcement.priority}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {announcement.isDismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDismiss(announcement.id, e)}
                      disabled={dismissMutation.isLoading}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
