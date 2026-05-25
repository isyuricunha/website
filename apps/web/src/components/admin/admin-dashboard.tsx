'use client'

import {
  BarChart3,
  MessageSquare,
  Shield,
  Users,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
  Progress
} from '@isyuricunha/ui'
import { useTranslations } from '@isyuricunha/i18n/client'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { api } from '@/trpc/react'
import AnnouncementWidget from '../announcement-widget'

const AdminDashboard = () => {
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const t = useTranslations('admin.dashboard')
  const { data: stats, isLoading, error, refetch } = api.admin.getStats.useQuery()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success(t('messages.refresh-success'))
    } catch {
      toast.error(t('messages.refresh-error'))
    } finally {
      setRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-medium'>{t('loading.title')}</h1>
          <p className='text-muted-foreground'>{t('loading.description')}</p>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{t('loading.card')}</CardTitle>
                <div className='bg-muted h-4 w-4 animate-pulse rounded' />
              </CardHeader>
              <CardContent>
                <div className='bg-muted h-7 w-16 animate-pulse rounded' />
                <div className='bg-muted mt-1 h-3 w-24 animate-pulse rounded' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-medium'>{t('loading.title')}</h1>
          <p className='text-muted-foreground'>{t('loading.description')}</p>
        </div>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-destructive'>{t('loading.error')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: t('stats.total-users.title'),
      value: stats?.totals.users ?? 0,
      description: t('stats.this-month', { count: stats?.recent.users ?? 0 }),
      icon: Users,
      trend: stats?.recent.users ? '+12%' : '0%',
      href: '/admin/users'
    },
    {
      title: t('stats.total-comments.title'),
      value: stats?.totals.comments ?? 0,
      description: t('stats.this-month', { count: stats?.recent.comments ?? 0 }),
      icon: MessageSquare,
      trend: stats?.recent.comments ? '+8%' : '0%',
      href: '/admin/comments'
    },
    {
      title: t('stats.guestbook-entries.title'),
      value: stats?.totals.guestbookEntries ?? 0,
      description: t('stats.guestbook-entries.description'),
      icon: BarChart3,
      trend: '+5%',
      href: '/admin'
    },
    {
      title: t('stats.admin-users.title'),
      value: stats?.totals.admins ?? 0,
      description: t('stats.admin-users.description'),
      icon: Shield,
      trend: '0%',
      href: '/admin/users'
    }
  ]

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-text-primary text-4xl font-medium tracking-tight'>{t('title')}</h1>
          <p className='text-muted-foreground text-base'>{t('description')}</p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge
            variant='outline'
            className='text-accent-earth-text border-[var(--accent-border)] bg-[var(--accent-dim)] px-3 py-1.5 text-xs font-medium'
          >
            <Activity className='mr-1.5 h-3.5 w-3.5' />
            {t('status.live')}
          </Badge>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={refreshing}
            className='transition-all duration-200 hover:shadow-md'
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('actions.refresh')}
          </Button>
        </div>
      </div>

      <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-4'>
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className='group bg-bg-surface relative cursor-pointer overflow-hidden border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-border)] hover:shadow-xl'
              onClick={() => router.push(stat.href)}
            >
              <div className='bg-bg-surface absolute inset-0 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground group-hover:text-foreground text-sm font-semibold transition-colors'>
                  {stat.title}
                </CardTitle>
                <div className='text-accent-earth-text rounded-xl bg-[var(--accent-dim)] p-2.5 transition-transform duration-300 group-hover:scale-110'>
                  <Icon className='h-5 w-5' />
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-baseline justify-between'>
                  <div className='text-3xl font-medium tracking-tight'>
                    {stat.value.toLocaleString()}
                  </div>
                  <div className='text-accent-earth-text flex items-center gap-1 text-xs font-medium'>
                    <TrendingUp className='h-3.5 w-3.5' />
                    {stat.trend}
                  </div>
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>{stat.description}</p>
                <div className='pt-1'>
                  <Progress value={Math.min((stat.value / 1000) * 100, 100)} className='h-1.5' />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='bg-bg-surface border-[var(--border-subtle)] md:col-span-1'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                    <Clock className='h-4 w-4' />
                  </div>
                  {t('recent-activity.title')}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {t('recent-activity.description')}
                </CardDescription>
              </div>
              <Badge variant='secondary' className='px-2.5 py-1 text-xs font-medium'>
                {t('recent-activity.weekly')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='bg-bg-surface hover:bg-bg-surface flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 transition-all duration-200 hover:shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                  <Users className='h-4 w-4' />
                </div>
                <span className='text-sm font-semibold'>{t('recent-activity.new-users')}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-lg font-medium'>{stats?.weekly.users ?? 0}</span>
                <CheckCircle className='text-accent-earth-text h-4 w-4' />
              </div>
            </div>
            <div className='bg-bg-surface hover:bg-bg-surface flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 transition-all duration-200 hover:shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                  <MessageSquare className='h-4 w-4' />
                </div>
                <span className='text-sm font-semibold'>{t('recent-activity.new-comments')}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-lg font-medium'>{stats?.weekly.comments ?? 0}</span>
                <CheckCircle className='text-accent-earth-text h-4 w-4' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-bg-surface border-[var(--border-subtle)] md:col-span-1'>
          <CardHeader>
            <div className='mb-1 flex items-center gap-2'>
              <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                <ArrowRight className='h-4 w-4' />
              </div>
              <CardTitle className='text-base'>{t('quick-actions.title')}</CardTitle>
            </div>
            <CardDescription className='text-xs'>{t('quick-actions.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <button
              type='button'
              className='bg-bg-surface hover:bg-bg-surface group flex w-full items-start gap-3 rounded-xl border border-[var(--border-subtle)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-md'
              onClick={() => router.push('/admin/users')}
            >
              <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2 transition-transform duration-200 group-hover:scale-110'>
                <Users className='h-4 w-4' />
              </div>
              <div className='flex-1 space-y-0.5 text-left'>
                <div className='text-sm font-semibold'>{t('quick-actions.manage-users.title')}</div>
                <div className='text-muted-foreground text-xs'>
                  {t('quick-actions.manage-users.description')}
                </div>
              </div>
            </button>
            <button
              type='button'
              className='bg-bg-surface hover:bg-bg-surface group flex w-full items-start gap-3 rounded-xl border border-[var(--border-subtle)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-md'
              onClick={() => router.push('/admin/comments')}
            >
              <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2 transition-transform duration-200 group-hover:scale-110'>
                <MessageSquare className='h-4 w-4' />
              </div>
              <div className='flex-1 space-y-0.5 text-left'>
                <div className='text-sm font-semibold'>
                  {t('quick-actions.moderate-comments.title')}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {t('quick-actions.moderate-comments.description')}
                </div>
              </div>
            </button>
            <button
              type='button'
              className='bg-bg-surface hover:bg-bg-surface group flex w-full items-start gap-3 rounded-xl border border-[var(--border-subtle)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-md'
              onClick={() => router.push('/admin/monitoring')}
            >
              <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2 transition-transform duration-200 group-hover:scale-110'>
                <Activity className='h-4 w-4' />
              </div>
              <div className='flex-1 space-y-0.5 text-left'>
                <div className='text-sm font-semibold'>{t('quick-actions.monitoring.title')}</div>
                <div className='text-muted-foreground text-xs'>
                  {t('quick-actions.monitoring.description')}
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      <Separator className='my-8' />

      <div className='grid gap-6 lg:grid-cols-2'>
        <AnnouncementWidget className='lg:col-span-1' maxItems={5} />

        <Card className='bg-bg-surface border-[var(--border-subtle)]'>
          <CardHeader>
            <div className='mb-1 flex items-center gap-2'>
              <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                <BarChart3 className='h-4 w-4' />
              </div>
              <CardTitle className='text-base'>{t('system-health.title')}</CardTitle>
            </div>
            <CardDescription className='text-xs'>{t('system-health.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2.5'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>{t('system-health.database')}</span>
                <span className='text-accent-earth-text text-xs font-semibold'>
                  {t('system-health.excellent')}
                </span>
              </div>
              <Progress value={95} className='h-2' />
            </div>
            <div className='space-y-2.5'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>{t('system-health.api-response')}</span>
                <span className='text-accent-earth-text text-xs font-semibold'>
                  {t('system-health.fast')}
                </span>
              </div>
              <Progress value={88} className='h-2' />
            </div>
            <div className='space-y-2.5'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>{t('system-health.storage')}</span>
                <span className='text-muted-foreground text-xs font-semibold'>
                  {t('system-health.moderate')}
                </span>
              </div>
              <Progress value={65} className='h-2' />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
