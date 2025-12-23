'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@isyuricunha/ui'
import { Check, Bell } from 'lucide-react'
import { useMemo, useState } from 'react'

import { api } from '@/trpc/react'
import { useSession } from '@/lib/auth-client'
import { useDialogsStore } from '@/store/dialogs'

const formatDateTime = (value: Date) => {
  return value.toLocaleString()
}

export default function NotificationsPage() {
  const t = useTranslations('component.notifications')
  const { data: session, isPending } = useSession()
  const { setIsSignInOpen } = useDialogsStore()
  const utils = api.useUtils()

  const [unreadOnly, setUnreadOnly] = useState(false)

  const enabled = Boolean(session)

  const { data, isLoading, isFetching } = api.communication.getNotifications.useQuery(
    {
      unreadOnly,
      limit: 50,
      offset: 0
    },
    {
      enabled,
      refetchOnWindowFocus: false
    }
  )

  const notifications = useMemo(() => {
    return data?.notifications ?? []
  }, [data?.notifications])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const markReadMutation = api.communication.markNotificationRead.useMutation({
    onSuccess: async () => {
      await utils.communication.getNotifications.invalidate()
    }
  })

  const markAllReadMutation = api.communication.markAllNotificationsRead.useMutation({
    onSuccess: async () => {
      await utils.communication.getNotifications.invalidate()
    }
  })

  if (isPending) return null

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='size-4' />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('sign-in')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsSignInOpen(true)}>{t('sign-in')}</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='text-muted-foreground text-sm'>{isFetching ? 'Refreshing…' : null}</p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant={unreadOnly ? 'default' : 'outline'}
            size='sm'
            onClick={() => setUnreadOnly((v) => !v)}
          >
            {t('unread')}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
          >
            <Check className='size-4' />
            {t('mark-all-read')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className='py-6'>Loading…</CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className='py-6'>
            <p className='text-muted-foreground text-sm'>{t('empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {notifications.map((n) => (
            <Card key={n.id} className={n.read ? undefined : 'border-primary/30'}>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0 space-y-1'>
                    <CardTitle className='truncate text-base'>{n.title}</CardTitle>
                    <CardDescription className='text-xs'>
                      {formatDateTime(n.createdAt)}
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    {n.read ? null : (
                      <Badge variant='secondary' className='text-xs'>
                        {t('unread')}
                      </Badge>
                    )}
                    {n.read ? null : (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => markReadMutation.mutate({ notificationId: n.id })}
                        disabled={markReadMutation.isPending}
                      >
                        <Check className='size-4' />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <p className='text-sm'>{n.message}</p>
                {n.actionUrl ? (
                  <a
                    href={n.actionUrl}
                    className='text-primary mt-2 inline-block text-sm underline'
                    target='_blank'
                    rel='noreferrer'
                  >
                    {n.actionUrl}
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
