'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { Button } from '@isyuricunha/ui'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import Link from '@/components/link'
import { useFormattedDate } from '@/hooks/use-formatted-date'
import { api } from '@/trpc/react'

type UserCommentsProps = {
    handle: string
}

const UserComments = (props: UserCommentsProps) => {
    const { handle } = props
    const t = useTranslations()

    const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage } =
        api.users.getInfiniteUserComments.useInfiniteQuery(
            {
                handle,
                limit: 10
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor
            }
        )

    const { ref, inView } = useInView()

    useEffect(() => {
        if (inView && hasNextPage) fetchNextPage()
    }, [fetchNextPage, hasNextPage, inView])

    const isLoading = status === 'pending' || isFetchingNextPage
    const comments = data?.pages.flatMap((page) => page.comments) ?? []

    return (
        <section className='space-y-6'>
            <div>
                <h2 className='text-lg font-semibold'>{t('profile.comments.title')}</h2>
                <p className='text-muted-foreground text-sm'>{t('profile.comments.description')}</p>
            </div>

            {status === 'error' ? (
                <p className='text-muted-foreground text-sm'>{t('profile.comments.error')}</p>
            ) : null}

            {status === 'success' && comments.length === 0 ? (
                <p className='text-muted-foreground text-sm'>{t('profile.comments.empty')}</p>
            ) : null}

            <div className='space-y-4'>
                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>

            <div className='flex items-center justify-center'>
                {hasNextPage ? <span ref={ref} className='invisible' /> : null}
                {!hasNextPage && comments.length > 0 ? (
                    <p className='text-muted-foreground text-xs'>{t('profile.comments.end')}</p>
                ) : null}
            </div>

            {hasNextPage ? (
                <div className='flex justify-center'>
                    <Button
                        variant='secondary'
                        disabled={isLoading}
                        isPending={isLoading}
                        onClick={() => fetchNextPage()}
                    >
                        {t('profile.comments.load-more')}
                    </Button>
                </div>
            ) : null}
        </section>
    )
}

type CommentItemProps = {
    comment: {
        id: string
        body: string
        createdAt: Date
        type: 'comment' | 'reply'
        post: {
            title: string
            url: string
        }
    }
}

const CommentItem = (props: CommentItemProps) => {
    const { comment } = props
    const t = useTranslations()

    const formattedDate = useFormattedDate(comment.createdAt, {
        relative: true
    })

    return (
        <div className='rounded-lg border p-4'>
            <div className='flex items-center justify-between gap-4'>
                <Link href={comment.post.url} className='truncate text-sm font-medium hover:underline'>
                    {comment.post.title}
                </Link>
                <div className='text-muted-foreground shrink-0 text-xs'>
                    {formattedDate ?? new Date(comment.createdAt).toLocaleString()}
                </div>
            </div>

            <div className='text-muted-foreground mt-1 text-xs'>
                {comment.type === 'reply' ? t('profile.comments.type.reply') : t('profile.comments.type.comment')}
            </div>

            <p className='mt-3 text-sm leading-relaxed whitespace-pre-wrap'>
                {comment.body}
            </p>
        </div>
    )
}

export default UserComments
