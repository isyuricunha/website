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
import { useTranslations } from '@isyuricunha/i18n/client'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export default function NotificationManagement() {
  const t = useTranslations('admin.notification-management')
  const commonT = useTranslations('common')
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
      toast.success(t('messages.created'))
      setIsCreateDialogOpen(false)
      refetch()
    },
    onError: (error: any) => {
      toast.error(t('messages.create-failed', { message: error.message }))
    }
  })

  const markAsReadMutation = api.communication.adminMarkNotificationRead.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error: any) => {
      toast.error(t('messages.mark-read-failed', { message: error.message }))
    }
  })

  const handleCreateNotification = (formData: FormData) => {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any
    const userId = formData.get('userId') as string
    const expiresAtRaw = formData.get('expiresAt') as string
    const actionUrlRaw = formData.get('actionUrl') as string

    if (!title || !content) {
      toast.error(t('messages.title-content-required'))
      return
    }

    createNotificationMutation.mutate({
      title,
      content,
      type,
      userId: userId || undefined,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : undefined,
      actionUrl: actionUrlRaw || undefined
    })
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId })
  }

  const getNotificationIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Bell className='text-accent-earth-text h-4 w-4' />
      case 'success':
        return <Check className='text-accent-earth-text h-4 w-4' />
      case 'warning':
        return <Clock className='text-accent-earth-text h-4 w-4' />
      case 'error':
        return <X className='text-destructive h-4 w-4' />
      default:
        return <Bell className='text-text-secondary h-4 w-4' />
    }
  }

  const getNotificationTypeColor = (severity: string) => {
    if (severity === 'error') {
      return 'border-destructive/30 bg-destructive/10 text-text-primary'
    }

    return 'border-[var(--border-subtle)] bg-bg-surface text-text-primary'
  }

  if (isLoading) {
    return <div className='p-6'>{t('loading')}</div>
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-text-primary flex items-center gap-3 text-4xl font-medium tracking-tight'>
            <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2.5'>
              <Bell className='h-8 w-8' />
            </div>
            {t('title')}
          </h1>
          <p className='text-text-secondary text-base'>{t('description')}</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              {t('actions.create')}
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>{t('dialog.create-title')}</DialogTitle>
              <DialogDescription>{t('dialog.create-description')}</DialogDescription>
            </DialogHeader>
            <form action={handleCreateNotification}>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='title'>{t('fields.title')}</Label>
                  <Input
                    id='title'
                    name='title'
                    placeholder={t('fields.title-placeholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='content'>{t('fields.content')}</Label>
                  <Textarea
                    id='content'
                    name='content'
                    placeholder={t('fields.content-placeholder')}
                    rows={4}
                    required
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='type'>{t('fields.type')}</Label>
                    <Select name='type' defaultValue='system'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='system'>{t('types.system')}</SelectItem>
                        <SelectItem value='security'>{t('types.security')}</SelectItem>
                        <SelectItem value='user_action'>{t('types.user-action')}</SelectItem>
                        <SelectItem value='content'>{t('types.content')}</SelectItem>
                        <SelectItem value='marketing'>{t('types.marketing')}</SelectItem>
                        <SelectItem value='reminder'>{t('types.reminder')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='userId'>{t('fields.user-id')}</Label>
                    <Input
                      id='userId'
                      name='userId'
                      placeholder={t('fields.user-id-placeholder')}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='expiresAt'>{t('fields.expires-at')}</Label>
                    <Input id='expiresAt' name='expiresAt' type='datetime-local' />
                  </div>

                  <div>
                    <Label htmlFor='actionUrl'>{t('fields.action-url')}</Label>
                    <Input
                      id='actionUrl'
                      name='actionUrl'
                      placeholder='https://example.com'
                      type='url'
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className='mt-6'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  {commonT('cancel')}
                </Button>
                <Button type='submit'>{t('actions.send')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-5 md:grid-cols-3'>
        <Card className='bg-bg-surface hover:shadow-feature-card border-[var(--border-subtle)] transition-all duration-300'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
            <CardTitle className='text-text-secondary text-sm font-medium'>
              {t('stats.total.title')}
            </CardTitle>
            <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
              <Bell className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-accent-earth-text text-3xl font-medium tracking-tight'>
              {notifications?.notifications?.length || 0}
            </div>
            <p className='text-text-secondary text-xs leading-relaxed'>
              {t('stats.total.description')}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-bg-surface hover:shadow-feature-card border-[var(--border-subtle)] transition-all duration-300'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
            <CardTitle className='text-text-secondary text-sm font-medium'>
              {t('stats.unread.title')}
            </CardTitle>
            <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
              <Clock className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-accent-earth-text text-3xl font-medium tracking-tight'>
              {notifications?.notifications?.filter((n) => !n.read).length || 0}
            </div>
            <p className='text-text-secondary text-xs leading-relaxed'>
              {t('stats.unread.description')}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-bg-surface hover:shadow-feature-card border-[var(--border-subtle)] transition-all duration-300'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
            <CardTitle className='text-text-secondary text-sm font-medium'>
              {t('stats.read-rate.title')}
            </CardTitle>
            <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
              <BarChart3 className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-accent-earth-text text-3xl font-medium tracking-tight'>
              {notifications?.notifications?.length
                ? Math.round(
                    (notifications.notifications.filter((n) => n.read).length /
                      notifications.notifications.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className='text-text-secondary text-xs leading-relaxed'>
              {t('stats.read-rate.description')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className='bg-bg-surface border-[var(--border-subtle)]'>
        <CardHeader>
          <div className='mb-1 flex items-center gap-2'>
            <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
              <Bell className='h-4 w-4' />
            </div>
            <CardTitle className='text-base font-medium'>{t('recent.title')}</CardTitle>
          </div>
          <CardDescription className='text-xs'>{t('recent.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-[600px]'>
            <div className='space-y-4'>
              {notifications?.notifications?.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${getNotificationTypeColor(notification.severity)} border ${notification.read ? '' : 'ring-2 ring-[var(--accent-border)]'} hover:shadow-feature-card transition-all duration-200`}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center gap-2'>
                          {getNotificationIcon(notification.severity)}
                          <h3 className='font-medium'>{notification.title}</h3>
                          <Badge variant='outline'>{notification.type}</Badge>
                          {!notification.read && (
                            <Badge className='text-accent-earth-text border border-[var(--accent-border)] bg-[var(--accent-dim)]'>
                              {t('status.unread')}
                            </Badge>
                          )}
                        </div>

                        <p className='mb-3 text-sm'>{notification.message}</p>

                        <div className='text-text-secondary flex items-center gap-4 text-xs'>
                          <span className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          <span className='flex items-center gap-1'>
                            <User className='h-3 w-3' />
                            {t('recent.user', { userId: notification.userId })}
                          </span>
                          {notification.expiresAt && (
                            <span>
                              {t('recent.expires', {
                                date: new Date(notification.expiresAt).toLocaleDateString()
                              })}
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
                            {t('actions.mark-read')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!notifications?.notifications?.length && (
                <div className='text-text-secondary py-8 text-center'>
                  <Bell className='mx-auto mb-4 h-12 w-12 opacity-50' />
                  <p>{t('empty')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
