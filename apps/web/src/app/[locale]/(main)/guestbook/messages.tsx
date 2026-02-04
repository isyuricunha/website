'use client'

import type { GetInfiniteMessagesOutput } from '@/trpc/routers/guestbook'

import { keepPreviousData } from '@tanstack/react-query'
import { useTranslations } from '@isyuricunha/i18n/client'
import { Avatar, AvatarFallback, AvatarImage, Skeleton } from '@isyuricunha/ui'
import { MessageCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

import { type MessageContext, MessageProvider } from '@/contexts/message'
import { useFormattedDate } from '@/hooks/use-formatted-date'
import { useSession } from '@/lib/auth-client'
import { api } from '@/trpc/react'

import Link from '@/components/link'
import UserName from '@/components/user/user-name'

import DeleteButton from './delete-button'
import MessagesLoader from './messages-loader'

type UpdatedDateProps = {
  date: Date
}

type MessageProps = {
  message: GetInfiniteMessagesOutput['messages'][number]
}

const UpdatedDate = (props: UpdatedDateProps) => {
  const { date } = props
  const formattedDate = useFormattedDate(date, {
    formatOptions: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  })

  if (!formattedDate) return <Skeleton className='h-4 w-24 rounded-md' />

  return <div className='text-muted-foreground text-xs'>{formattedDate}</div>
}

const Messages = () => {
  const { status, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.guestbook.getInfiniteMessages.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: keepPreviousData
      }
    )
  const t = useTranslations()

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [fetchNextPage, hasNextPage, inView])

  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isLoading = status === 'pending' || isFetchingNextPage
  const noMessages = status === 'success' && data.pages[0]?.messages.length === 0

  return (
    <div className='flex flex-col gap-6' data-testid='guestbook-messages-list'>
      {isSuccess
        ? data.pages.map((page, pageIndex) =>
          page.messages.map((message, messageIndex) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: (pageIndex * page.messages.length + messageIndex) * 0.05,
                duration: 0.4
              }}
            >
              <Message message={message} />
            </motion.div>
          ))
        )
        : null}
      {noMessages ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='border-muted-foreground/25 flex min-h-32 flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed p-8'
        >
          <MessageCircle className='text-muted-foreground/50 h-8 w-8' />
          <p className='text-muted-foreground text-center'>{t('guestbook.no-messages')}</p>
          <p className='text-muted-foreground/75 text-center text-sm'>
            Be the first to leave a message!
          </p>
        </motion.div>
      ) : null}
      {isError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='border-destructive/20 bg-destructive/5 flex min-h-24 items-center justify-center rounded-lg border p-4'
        >
          <p className='text-destructive text-sm'>{t('guestbook.failed-to-load-messages')}</p>
        </motion.div>
      ) : null}
      {isLoading ? <MessagesLoader /> : null}
      <span ref={ref} className='invisible' />
    </div>
  )
}

const Message = (props: MessageProps) => {
  const { message } = props
  const { data: session } = useSession()

  const {
    message: {
      id,
      user: { name, image, id: userId, username, nameColor, nameEffect },
      updatedAt,
      body
    }
  } = props

  const context = useMemo<MessageContext>(
    () => ({
      message
    }),
    [message]
  )

  const isAuthor = session?.user && userId === session.user.id

  return (
    <MessageProvider value={context}>
      <div
        className='bg-card hover:shadow-primary/5 group relative rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-zinc-900/30'
        id={`message-${id}`}
      >
        {/* Subtle gradient overlay on hover */}
        <div className='from-primary/5 to-secondary/5 absolute inset-0 rounded-xl bg-linear-to-br via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

        <div className='relative z-10'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='relative'>
              <Avatar className='h-12 w-12'>
                <AvatarImage src={image} alt={name} />
                <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                  {name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator (optional enhancement) */}
              <div className='border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-green-500' />
            </div>

            <div className='min-w-0 flex-1'>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-1'>
                  <Link href={`/u/${username ?? userId}`} className='hover:underline'>
                    <h4 className='text-foreground truncate'>
                      <UserName name={name} color={nameColor} effect={nameEffect} />
                    </h4>
                  </Link>
                  <UpdatedDate date={updatedAt} />
                </div>
                {isAuthor && (
                  <div className='opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                    <DeleteButton />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='prose prose-sm text-muted-foreground max-w-none leading-relaxed wrap-break-word'>
            {body}
          </div>
        </div>
      </div>
    </MessageProvider>
  )
}

export default Messages
