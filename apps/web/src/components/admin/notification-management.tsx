'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea
} from '@isyuricunha/ui'

import { Bell, Plus, Check, X, Clock, User, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export default function NotificationManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Queries
  const {
    data: notifications,
    isLoading,
    refetch
  } = api.communication.getAllNotifications.useQuery({
    limit: 50,
    offset: 0,
    includeExpired: false
  })

  // Mutations
  const createNotificationMutation = api.communication.createNotification.useMutation({
    onSuccess: () => {
      toast.success('Notification created successfully')
      setIsCreateDialogOpen(false)
      refetch()
    },
    onError: (error: any) => {
      toast.error(`Failed to create notification: ${error.message}`)
    }
  })

  const markAsReadMutation = api.communication.adminMarkNotificationRead.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error: any) => {
      toast.error(`Failed to mark as read: ${error.message}`)
    }
  })

  const handleCreateNotification = (formData: FormData) => {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any
    const userId = formData.get('userId') as string

    if (!title || !content) {
      toast.error('Title and content are required')
      return
    }

    createNotificationMutation.mutate({
      title,
      content,
      type,
      userId: userId || undefined
    })
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId })
  }

  const getNotificationIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Bell className='text-primary h-4 w-4' />
      case 'success':
        return <Check className='text-primary h-4 w-4' />
      case 'warning':
        return <Clock className='text-primary h-4 w-4' />
      case 'error':
        return <X className='text-destructive h-4 w-4' />
      default:
        return <Bell className='text-muted-foreground h-4 w-4' />
    }
  }

  const getNotificationTypeColor = (severity: string) => {
    if (severity === 'error') {
      return 'border-destructive/30 bg-destructive/10 text-foreground'
    }

    return 'border-border/60 bg-card text-foreground'
  }

  if (isLoading) {
    return <div className='p-6'>Loading notifications...</div>
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='from-foreground to-foreground/70 flex items-center gap-3 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent'>
            <div className='bg-primary/10 text-primary rounded-xl p-2.5'>
              <Bell className='h-8 w-8' />
            </div>
            Notifications
          </h1>
          <p className='text-muted-foreground text-base'>
            Manage user notifications and system alerts
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                Send a notification to a specific user or all users.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateNotification}>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='title'>Title</Label>
                  <Input id='title' name='title' placeholder='Notification title' required />
                </div>

                <div>
                  <Label htmlFor='content'>Content</Label>
                  <Textarea
                    id='content'
                    name='content'
                    placeholder='Notification content'
                    rows={4}
                    required
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='type'>Type</Label>
                    <Select name='type' defaultValue='system'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='system'>System</SelectItem>
                        <SelectItem value='security'>Security</SelectItem>
                        <SelectItem value='user_action'>User Action</SelectItem>
                        <SelectItem value='content'>Content</SelectItem>
                        <SelectItem value='marketing'>Marketing</SelectItem>
                        <SelectItem value='reminder'>Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='userId'>User ID (optional)</Label>
                    <Input id='userId' name='userId' placeholder='Leave empty for all users' />
                  </div>
                </div>
              </div>

              <DialogFooter className='mt-6'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit'>Send Notification</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-5 md:grid-cols-3'>
        <Card className='border-border/50 from-background to-background/50 bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
            <CardTitle className='text-muted-foreground text-sm font-semibold'>
              Total Notifications
            </CardTitle>
            <div className='bg-primary/10 text-primary rounded-lg p-2'>
              <Bell className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-primary text-3xl font-bold tracking-tight'>
              {notifications?.notifications?.length || 0}
            </div>
            <p className='text-muted-foreground text-xs leading-relaxed'>All notifications</p>
          </CardContent>
        </Card>

        <Card className='border-border/50 from-background to-background/50 bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
            <CardTitle className='text-muted-foreground text-sm font-semibold'>Unread</CardTitle>
            <div className='bg-primary/10 text-primary rounded-lg p-2'>
              <Clock className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-primary text-3xl font-bold tracking-tight'>
              {notifications?.notifications?.filter((n) => !n.read).length || 0}
            </div>
            <p className='text-muted-foreground text-xs leading-relaxed'>Pending notifications</p>
          </CardContent>
        </Card>

        <Card className='border-border/50 from-background to-background/50 bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
            <CardTitle className='text-muted-foreground text-sm font-semibold'>Read Rate</CardTitle>
            <div className='bg-primary/10 text-primary rounded-lg p-2'>
              <BarChart3 className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-primary text-3xl font-bold tracking-tight'>
              {notifications?.notifications?.length
                ? Math.round(
                    (notifications.notifications.filter((n) => n.read).length /
                      notifications.notifications.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className='text-muted-foreground text-xs leading-relaxed'>Notifications read</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm'>
        <CardHeader>
          <div className='mb-1 flex items-center gap-2'>
            <div className='bg-primary/10 text-primary rounded-lg p-2'>
              <Bell className='h-4 w-4' />
            </div>
            <CardTitle className='text-base font-semibold'>Recent Notifications</CardTitle>
          </div>
          <CardDescription className='text-xs'>
            Manage user notifications and system alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-[600px]'>
            <div className='space-y-4'>
              {notifications?.notifications?.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${getNotificationTypeColor(notification.severity)} border-2 ${notification.read ? '' : 'ring-primary/30 ring-2'} transition-all duration-200 hover:shadow-md`}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center gap-2'>
                          {getNotificationIcon(notification.severity)}
                          <h3 className='font-semibold'>{notification.title}</h3>
                          <Badge variant='outline'>{notification.type}</Badge>
                          {!notification.read && (
                            <Badge className='border-primary/20 bg-primary/10 text-primary border'>
                              Unread
                            </Badge>
                          )}
                        </div>

                        <p className='mb-3 text-sm'>{notification.message}</p>

                        <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                          <span className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          <span className='flex items-center gap-1'>
                            <User className='h-3 w-3' />
                            User: {notification.userId}
                          </span>
                          {notification.expiresAt && (
                            <span>
                              Expires: {new Date(notification.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='ml-4 flex items-center gap-2'>
                        {!notification.read && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className='mr-1 h-4 w-4' />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!notifications?.notifications?.length && (
                <div className='text-muted-foreground py-8 text-center'>
                  <Bell className='mx-auto mb-4 h-12 w-12 opacity-50' />
                  <p>No notifications yet. Create your first notification to get started!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
