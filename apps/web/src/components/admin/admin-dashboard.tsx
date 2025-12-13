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
  CheckCircle,
  FileText,
  PlusIcon,
  Languages,
  Wand2
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
import { toast } from 'sonner'
import { useState } from 'react'

import { api } from '@/trpc/react'
import AnnouncementWidget from '../announcement-widget'

const AdminDashboard = () => {
  const [refreshing, setRefreshing] = useState(false)
  const { data: stats, isLoading, error, refetch } = api.admin.getStats.useQuery()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success('Dashboard refreshed successfully')
    } catch {
      toast.error('Failed to refresh dashboard')
    } finally {
      setRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>Overview of your site statistics</p>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
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
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>Overview of your site statistics</p>
        </div>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-destructive'>Failed to load dashboard statistics</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totals.users ?? 0,
      description: `+${stats?.recent.users ?? 0} this month`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      trend: stats?.recent.users ? '+12%' : '0%',
      href: '/admin/users'
    },
    {
      title: 'Total Comments',
      value: stats?.totals.comments ?? 0,
      description: `+${stats?.recent.comments ?? 0} this month`,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      trend: stats?.recent.comments ? '+8%' : '0%',
      href: '/admin/comments'
    },
    {
      title: 'Guestbook Entries',
      value: stats?.totals.guestbookEntries ?? 0,
      description: 'All time entries',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      trend: '+5%',
      href: '/admin'
    },
    {
      title: 'Admin Users',
      value: stats?.totals.admins ?? 0,
      description: 'System administrators',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      trend: '0%',
      href: '/admin/users'
    }
  ]

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent'>
            Admin Dashboard
          </h1>
          <p className='text-muted-foreground text-base'>
            Monitor your site's performance and manage content
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge
            variant='outline'
            className='border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300'
          >
            <Activity className='mr-1.5 h-3.5 w-3.5' />
            Live
          </Badge>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={refreshing}
            className='transition-all duration-200 hover:shadow-md'
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-4'>
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className='border-border/50 from-background to-background/50 hover:border-primary/30 group relative cursor-pointer overflow-hidden bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
              onClick={() => (globalThis.location.href = stat.href)}
            >
              <div className='from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground group-hover:text-foreground text-sm font-semibold transition-colors'>
                  {stat.title}
                </CardTitle>
                <div
                  className={`rounded-xl p-2.5 ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-baseline justify-between'>
                  <div className='text-3xl font-bold tracking-tight'>
                    {stat.value.toLocaleString()}
                  </div>
                  <div className='flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
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
        <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm md:col-span-1'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <div className='rounded-lg bg-blue-500/10 p-2'>
                    <Clock className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  </div>
                  Recent Activity
                </CardTitle>
                <CardDescription className='text-xs'>Last 7 days performance</CardDescription>
              </div>
              <Badge variant='secondary' className='px-2.5 py-1 text-xs font-medium'>
                Weekly
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 backdrop-blur-sm transition-all duration-200 hover:shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-blue-500/10 p-2'>
                  <Users className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
                <span className='text-sm font-semibold'>New Users</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-lg font-bold'>{stats?.weekly.users ?? 0}</span>
                <CheckCircle className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              </div>
            </div>
            <div className='flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 backdrop-blur-sm transition-all duration-200 hover:shadow-sm'>
              <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-emerald-500/10 p-2'>
                  <MessageSquare className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                </div>
                <span className='text-sm font-semibold'>New Comments</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-lg font-bold'>{stats?.weekly.comments ?? 0}</span>
                <CheckCircle className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm md:col-span-1'>
          <CardHeader>
            <div className='mb-1 flex items-center gap-2'>
              <div className='rounded-lg bg-purple-500/10 p-2'>
                <ArrowRight className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              </div>
              <CardTitle className='text-base'>Quick Actions</CardTitle>
            </div>
            <CardDescription className='text-xs'>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <button
              type='button'
              className='group flex w-full items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-md'
              onClick={() => (globalThis.location.href = '/admin/posts/new')}
            >
              <div className='rounded-lg bg-indigo-500/10 p-2 transition-transform duration-200 group-hover:scale-110'>
                <PlusIcon className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
              </div>
              <div className='flex-1 space-y-0.5 text-left'>
                <div className='text-sm font-semibold'>Create Blog Post</div>
                <div className='text-muted-foreground text-xs'>Write with AI assistance</div>
              </div>
            </button>
            <button
              type='button'
              className='group flex w-full items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-md'
              onClick={() => (globalThis.location.href = '/admin/users')}
            >
              <div className='rounded-lg bg-blue-500/10 p-2 transition-transform duration-200 group-hover:scale-110'>
                <Users className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              </div>
              <div className='flex-1 space-y-0.5 text-left'>
                <div className='text-sm font-semibold'>Manage Users</div>
                <div className='text-muted-foreground text-xs'>View and edit user accounts</div>
              </div>
            </button>
            <button
              type='button'
              className='group flex w-full items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md'
              onClick={() => (globalThis.location.href = '/admin/comments')}
            >
              <div className='rounded-lg bg-emerald-500/10 p-2 transition-transform duration-200 group-hover:scale-110'>
                <MessageSquare className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div className='flex-1 space-y-0.5 text-left'>
                <div className='text-sm font-semibold'>Moderate Comments</div>
                <div className='text-muted-foreground text-xs'>Review and manage comments</div>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm md:col-span-2 lg:col-span-1'>
          <CardHeader>
            <div className='mb-1 flex items-center gap-2'>
              <div className='rounded-lg bg-indigo-500/10 p-2'>
                <Wand2 className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
              </div>
              <CardTitle className='text-base'>Blog Management</CardTitle>
            </div>
            <CardDescription className='text-xs'>AI-powered content creation</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <button
              type='button'
              className='group flex w-full items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 backdrop-blur-sm transition-all duration-200 hover:border-indigo-500/30 hover:shadow-md'
              onClick={() => (globalThis.location.href = '/admin/posts')}
            >
              <div className='flex items-center gap-2'>
                <FileText className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                <span className='text-sm font-semibold'>Manage Posts</span>
              </div>
              <Badge variant='secondary' className='px-2 py-0.5 text-xs font-medium'>
                36
              </Badge>
            </button>
            <button
              type='button'
              className='group flex w-full items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/30 hover:shadow-md'
              onClick={() => (globalThis.location.href = '/admin/posts/new')}
            >
              <div className='flex items-center gap-2'>
                <PlusIcon className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                <span className='text-sm font-semibold'>Create New Post</span>
              </div>
              <Badge
                variant='secondary'
                className='bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300'
              >
                AI
              </Badge>
            </button>
            <button
              type='button'
              className='group flex w-full items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 backdrop-blur-sm transition-all duration-200 hover:border-purple-500/30 hover:shadow-md'
              onClick={() => (globalThis.location.href = '/admin/translate')}
            >
              <div className='flex items-center gap-2'>
                <Languages className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                <span className='text-sm font-semibold'>Auto-Translate</span>
              </div>
              <Badge variant='secondary' className='px-2 py-0.5 text-xs font-medium'>
                6 langs
              </Badge>
            </button>
          </CardContent>
        </Card>
      </div>

      <Separator className='my-8' />

      <div className='grid gap-6 lg:grid-cols-2'>
        <AnnouncementWidget className='lg:col-span-1' maxItems={5} />

        <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm'>
          <CardHeader>
            <div className='mb-1 flex items-center gap-2'>
              <div className='rounded-lg bg-indigo-500/10 p-2'>
                <BarChart3 className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
              </div>
              <CardTitle className='text-base'>System Health</CardTitle>
            </div>
            <CardDescription className='text-xs'>
              Overall system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2.5'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>Database Performance</span>
                <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                  Excellent
                </span>
              </div>
              <Progress value={95} className='h-2' />
            </div>
            <div className='space-y-2.5'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>API Response Time</span>
                <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                  Fast
                </span>
              </div>
              <Progress value={88} className='h-2' />
            </div>
            <div className='space-y-2.5'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>Storage Usage</span>
                <span className='text-xs font-semibold text-amber-600 dark:text-amber-400'>
                  Moderate
                </span>
              </div>
              <Progress value={65} className='h-2' />
            </div>
            <div className='border-border/50 mt-2 border-t pt-3'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-xs'>Last updated</span>
                <div className='flex items-center gap-1.5'>
                  <div className='h-2 w-2 animate-pulse rounded-full bg-emerald-500' />
                  <span className='text-xs font-medium'>Just now</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
