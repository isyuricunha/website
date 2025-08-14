'use client'

import { BarChart3, MessageSquare, Shield, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'

import { api } from '@/trpc/react'
import AnnouncementWidget from '../announcement-widget'

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = api.admin.getStats.useQuery()

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
      color: 'text-blue-600'
    },
    {
      title: 'Total Comments',
      value: stats?.totals.comments ?? 0,
      description: `+${stats?.recent.comments ?? 0} this month`,
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      title: 'Guestbook Entries',
      value: stats?.totals.guestbookEntries ?? 0,
      description: 'All time entries',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Admin Users',
      value: stats?.totals.admins ?? 0,
      description: 'System administrators',
      icon: Shield,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your site statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (7 days)</CardTitle>
            <CardDescription>New registrations and comments this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">New Users</span>
              </div>
              <span className="font-semibold">{stats?.weekly.users ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">New Comments</span>
              </div>
              <span className="font-semibold">{stats?.weekly.comments ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/users"
              className="flex items-center space-x-2 rounded-md p-2 text-sm transition-colors hover:bg-muted"
            >
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </a>
            <a
              href="/admin/comments"
              className="flex items-center space-x-2 rounded-md p-2 text-sm transition-colors hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Moderate Comments</span>
            </a>
          </CardContent>
        </Card>

        <AnnouncementWidget className="lg:col-span-1" maxItems={3} />
      </div>
    </div>
  )
}

export default AdminDashboard
