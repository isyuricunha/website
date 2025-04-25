/**
 * Inspired by: https://fig.io
 */
'use client'

import { SiGithub, SiWakatime, SiYoutube } from '@icons-pack/react-simple-icons'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from '@tszhong0411/i18n/client'
import { ArrowRightIcon, PencilIcon, StarIcon } from 'lucide-react'

import Counter from '@/components/counter'
import Link from '@/components/link'
import { useTRPC } from '@/trpc/client'

type Card = {
  icon: React.ReactNode
  title: string
  link: string
  value: number | undefined
  linkText: string
  gradient: {
    startColor: string
    endColor: string
  }
  suffix?: string
}

const Metrics = () => {
  const trpc = useTRPC()

  const youtubeQuery = useQuery(trpc.youtube.get.queryOptions())
  const githubQuery = useQuery(trpc.github.get.queryOptions())
  const likesQuery = useQuery(trpc.likes.getCount.queryOptions())
  const viewsQuery = useQuery(trpc.views.getCount.queryOptions())
  const wakatimeQuery = useQuery(trpc.wakatime.get.queryOptions())

  const t = useTranslations()

  const data: Card[] = [
    {
      title: t('dashboard.metric.coding-hours'),
      link: 'https://wakatime.com/@tszhong0411',
      value: wakatimeQuery.data?.seconds
        ? Math.round(wakatimeQuery.data.seconds / 60 / 60)
        : undefined,
      icon: <SiWakatime className='text-[#0061ff]' />,
      linkText: 'WakaTime',
      gradient: {
        startColor: '#0061ff',
        endColor: '#6f7bf7'
      },
      suffix: 'hrs'
    },
    {
      title: t('dashboard.metric.youtube-subscribers'),
      link: 'https://youtube.com/@tszhong0411',
      value: youtubeQuery.data?.subscribers,
      icon: <SiYoutube className='text-[#ff0000]' />,
      linkText: 'YouTube',
      gradient: {
        startColor: '#ff0000',
        endColor: '#ca1a1a'
      }
    },
    {
      title: t('dashboard.metric.youtube-views'),
      link: 'https://youtube.com/@tszhong0411',
      value: youtubeQuery.data?.views,
      icon: <SiYoutube className='text-[#ff0000]' />,
      linkText: 'YouTube',
      gradient: {
        startColor: '#ff0000',
        endColor: '#ca1a1a'
      }
    },
    {
      title: t('dashboard.metric.github-followers'),
      link: 'https://github.com/tszhong0411',
      value: githubQuery.data?.followers,
      icon: <SiGithub className='text-[#fee000]' />,
      linkText: 'GitHub',
      gradient: {
        startColor: '#fee000',
        endColor: '#ffce63'
      }
    },
    {
      title: t('dashboard.metric.github-stars'),
      link: 'https://github.com/tszhong0411',
      value: githubQuery.data?.stars,
      icon: <StarIcon className='size-6 text-[#fee000]' />,
      linkText: 'GitHub',
      gradient: {
        startColor: '#fee000',
        endColor: '#ffce63'
      }
    },
    {
      title: t('dashboard.metric.blog-total-views'),
      link: 'https://honghong.me',
      value: viewsQuery.data?.views,
      icon: <PencilIcon className='size-6 text-[#ff0f7b]' />,
      linkText: 'Blog',
      gradient: {
        startColor: '#ff0f7b',
        endColor: '#f945ff'
      }
    },
    {
      title: t('dashboard.metric.blog-total-likes'),
      link: 'https://honghong.me',
      value: likesQuery.data?.likes,
      icon: <PencilIcon className='size-6 text-[#ff0f7b]' />,
      linkText: 'Blog',
      gradient: {
        startColor: '#ff0f7b',
        endColor: '#f945ff'
      }
    }
  ]

  return (
    <div className='mb-4 mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
      {data.map((metric) => {
        const {
          icon,
          link,
          title,
          value,
          linkText,
          gradient: { startColor, endColor },
          suffix
        } = metric

        const hasValue = value === 0 || value !== undefined

        return (
          <Link
            key={metric.title}
            href={link}
            className='shadow-xs group relative overflow-hidden rounded-lg border p-4 transition-colors hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900'
          >
            <div className='flex flex-col items-center justify-center gap-2 transition-transform group-hover:-translate-y-24 group-focus:-translate-y-24'>
              <div className='flex items-center gap-2 text-3xl font-semibold'>
                {hasValue ? (
                  <>
                    <span>{icon}</span>
                    <div
                      style={{
                        background: `linear-gradient(122.25deg, ${startColor} 12.16%, ${endColor} 70.98%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      <Counter value={Number(value)} />
                      {suffix ? <span>{` ${suffix}`}</span> : null}
                    </div>
                  </>
                ) : (
                  '--'
                )}
              </div>
              <div className='text-xl font-medium'>{title}</div>
            </div>
            <span className='absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-24 items-center gap-1 text-2xl font-semibold opacity-0 transition group-hover:-translate-y-1/2 group-hover:opacity-100 group-focus:-translate-y-1/2 group-focus:opacity-100'>
              {linkText}
              <ArrowRightIcon className='size-6' />
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default Metrics
