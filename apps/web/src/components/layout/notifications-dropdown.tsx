'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { useRouter } from '@isyuricunha/i18n/routing'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Badge
} from '@isyuricunha/ui'
import { Bell, Check } from 'lucide-react'
import { useState } from 'react'

import { api } from '@/trpc/react'
import { useSession } from '@/lib/auth-client'
import { useDialogsStore } from '@/store/dialogs'

import Link from '../link'

const getActionHref = (actionUrl: string | null): string | null => {
  if (!actionUrl) return null
  return actionUrl
}

export default function NotificationsDropdown() {
  const t = useTranslations('component.notifications')
  const tCommon = useTranslations()
  const { data: session, isPending } = useSession()
  const { setIsSignInOpen } = useDialogsStore()
  const utils = api.useUtils()
  const router = useRouter()

  const [open, setOpen] = useState(false)

  const enabled = Boolean(session)

  const { data: unreadMeta } = api.communication.getNotifications.useQuery(
    { unreadOnly: true, limit: 1, offset: 0 },
    { enabled, staleTime: 20_000, refetchOnWindowFocus: false }
  )

  const unreadCount = unreadMeta?.total ?? 0

  const { data } = api.communication.getNotifications.useQuery(
    { unreadOnly: false, limit: 10, offset: 0 },
    { enabled, staleTime: 20_000, refetchOnWindowFocus: false }
  )

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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative size-9 p-0' aria-label={t('aria')}>
          <Bell className='size-4' />
          {session && unreadCount > 0 ? (
            <span className='bg-primary text-primary-foreground absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-5 font-semibold'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-96'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span>{t('title')}</span>
          {session ? (
            <Badge variant='secondary' className='text-xs font-medium'>
              {unreadCount}
            </Badge>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {session ? (
          (data?.notifications?.length ?? 0) === 0 ? (
            <div className='text-muted-foreground px-3 py-2 text-sm'>{t('empty')}</div>
          ) : (
            <ScrollArea className='h-80'>
              <div className='space-y-1 p-1'>
                {data?.notifications?.map((n) => {
                  const href = getActionHref(n.actionUrl)
                  const item = (
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <div className='flex items-center gap-2'>
                        <span className='truncate text-sm font-medium'>{n.title}</span>
                        {n.read ? null : (
                          <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold'>
                            {t('unread')}
                          </span>
                        )}
                      </div>
                      <span className='text-muted-foreground line-clamp-2 text-xs'>
                        {n.message}
                      </span>
                    </div>
                  )

                  return (
                    <DropdownMenuItem
                      key={n.id}
                      className='gap-2'
                      onClick={() => {
                        if (!n.read) {
                          markReadMutation.mutate({ notificationId: n.id })
                        }
                      }}
                      asChild={Boolean(href)}
                    >
                      {href ? (
                        <Link href={href} className='flex w-full items-start gap-2'>
                          {item}
                        </Link>
                      ) : (
                        <div className='flex w-full items-start gap-2'>{item}</div>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </div>
            </ScrollArea>
          )
        ) : (
          <div className='flex flex-col gap-3 px-3 py-2'>
            <div className='text-muted-foreground text-sm'>{t('sign-in')}</div>
            <Button
              size='sm'
              onClick={() => {
                setOpen(false)
                setIsSignInOpen(true)
              }}
            >
              {tCommon('common.sign-in')}
            </Button>
          </div>
        )}

        {session ? (
          <>
            <DropdownMenuSeparator />
            <div className='flex items-center justify-between gap-2 px-2 py-2'>
              <Button
                variant='ghost'
                size='sm'
                className='gap-2'
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending || unreadCount === 0}
              >
                <Check className='size-4' />
                {t('mark-all-read')}
              </Button>
              <Button variant='ghost' size='sm' onClick={() => router.push('/notifications')}>
                {t('view-all')}
              </Button>
            </div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
