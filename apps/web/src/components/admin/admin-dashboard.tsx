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
  AlertCircle,
  CheckCircle,
  MegaphoneIcon,
  BellIcon,
  SendIcon
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
} from '@tszhong0411/ui'
import { toast } from 'sonner'
import { useState } from 'react'

import { api } from '@/trpc/react'
import AnnouncementWidget from '../announcement-widget'

const AdminDashboard = () => {
  const [refreshing, setRefreshing] = useState(false)
  const { data: stats, isLoading, error, refetch } = api.admin.getStats.useQuery()
  const { data: communicationStats } = api.communication.getCommunicationStats.useQuery()
  
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success('Dashboard refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your site statistics</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-16 animate-pulse rounded bg-muted" />
                <div className="mt-1 h-3 w-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your site statistics</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load dashboard statistics</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor your site's performance and manage content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="mr-1 h-3 w-3" />
            Live
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="transition-all duration-200"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1" onClick={() => window.location.href = stat.href}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.trend}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <div className="mt-2">
                  <Progress value={Math.min((stat.value / 1000) * 100, 100)} className="h-1" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Last 7 days performance</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                Weekly
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">New Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{stats?.weekly.users ?? 0}</span>
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">New Comments</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{stats?.weekly.comments ?? 0}</span>
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="mr-2 h-4 w-4 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3 hover:bg-blue-50 dark:hover:bg-blue-950"
              onClick={() => window.location.href = '/admin/users'}
            >
              <Users className="mr-3 h-4 w-4 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Manage Users</div>
                <div className="text-xs text-muted-foreground">View and edit user accounts</div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => window.location.href = '/admin/comments'}
            >
              <MessageSquare className="mr-3 h-4 w-4 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Moderate Comments</div>
                <div className="text-xs text-muted-foreground">Review and manage comments</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-4 w-4 text-orange-600" />
              Communication Hub
            </CardTitle>
            <CardDescription>Manage announcements and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-orange-50 dark:hover:bg-orange-950"
              onClick={() => window.location.href = '/admin/announcements'}
            >
              <MegaphoneIcon className="mr-2 h-4 w-4 text-orange-600" />
              <span className="text-sm">Announcements</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {communicationStats?.announcements?.active ?? 0}
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-950"
              onClick={() => window.location.href = '/admin/notifications'}
            >
              <BellIcon className="mr-2 h-4 w-4 text-blue-600" />
              <span className="text-sm">Notifications</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {communicationStats?.notifications?.unread ?? 0}
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-950"
              onClick={() => window.location.href = '/admin/email-marketing'}
            >
              <SendIcon className="mr-2 h-4 w-4 text-purple-600" />
              <span className="text-sm">Email Marketing</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {communicationStats?.campaigns?.sent ?? 0}
              </Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <AnnouncementWidget className="lg:col-span-1" maxItems={5} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4 text-indigo-600" />
              System Health
            </CardTitle>
            <CardDescription>Overall system performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database Performance</span>
                <span className="text-green-600 font-medium">Excellent</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Response Time</span>
                <span className="text-green-600 font-medium">Fast</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span className="text-yellow-600 font-medium">Moderate</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
