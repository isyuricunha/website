'use client'

import { useState } from 'react'
import { Button } from '@tszhong0411/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Badge } from '@tszhong0411/ui'
import { Input } from '@tszhong0411/ui'
import { Label } from '@tszhong0411/ui'
import { Textarea } from '@tszhong0411/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@tszhong0411/ui'
import { Mail, Megaphone, Bell, Send, Users, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export default function CommunicationManagement() {
  const [selectedTab, setSelectedTab] = useState('overview')

  // Communication stats query
  const { data: commStats, isLoading: statsLoading } = api.communication.getCommunicationStats.useQuery()

  // Email campaigns query
  const { data: campaigns, isLoading: campaignsLoading } = api.communication.getEmailCampaigns.useQuery({})

  // Email templates query
  const { data: templates, isLoading: templatesLoading } = api.communication.getEmailTemplates.useQuery({})

  // Announcements query
  const { data: announcements, isLoading: announcementsLoading } = api.communication.getAnnouncements.useQuery({
    adminView: true
  })

  // Notifications query (for current user)
  const { data: notifications, isLoading: notificationsLoading } = api.communication.getNotifications.useQuery({})

  // Mutations
  const createTemplateMutation = api.communication.createEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success('Email template created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`)
    }
  })

  const createCampaignMutation = api.communication.createEmailCampaign.useMutation({
    onSuccess: () => {
      toast.success('Email campaign created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create campaign: ${error.message}`)
    }
  })

  const sendCampaignMutation = api.communication.sendEmailCampaign.useMutation({
    onSuccess: () => {
      toast.success('Email campaign sent successfully')
    },
    onError: (error) => {
      toast.error(`Failed to send campaign: ${error.message}`)
    }
  })

  const createAnnouncementMutation = api.communication.createAnnouncement.useMutation({
    onSuccess: () => {
      toast.success('Announcement created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create announcement: ${error.message}`)
    }
  })

  const handleCreateTemplate = (formData: FormData) => {
    const name = formData.get('name') as string
    const type = formData.get('type') as any
    const subject = formData.get('subject') as string
    const htmlContent = formData.get('htmlContent') as string

    if (!name || !type || !subject || !htmlContent) {
      toast.error('All fields are required')
      return
    }

    createTemplateMutation.mutate({
      name,
      type,
      subject,
      htmlContent
    })
  }

  const handleCreateCampaign = (formData: FormData) => {
    const name = formData.get('name') as string
    const subject = formData.get('subject') as string
    const htmlContent = formData.get('htmlContent') as string

    if (!name || !subject || !htmlContent) {
      toast.error('Name, subject, and content are required')
      return
    }

    createCampaignMutation.mutate({
      name,
      subject,
      htmlContent
    })
  }

  const handleCreateAnnouncement = (formData: FormData) => {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any
    const priority = parseInt(formData.get('priority') as string) || 0

    if (!title || !content) {
      toast.error('Title and content are required')
      return
    }

    createAnnouncementMutation.mutate({
      title,
      content,
      type,
      priority
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default'
      case 'sending': return 'secondary'
      case 'scheduled': return 'outline'
      case 'draft': return 'outline'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'success': return 'default'
      case 'info': return 'outline'
      default: return 'outline'
    }
  }

  if (statsLoading) {
    return <div className="p-6">Loading communication dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Management</h1>
          <p className="text-muted-foreground">Manage emails, announcements, and notifications</p>
        </div>
      </div>

      {/* Communication Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commStats?.campaigns.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {commStats?.campaigns.sent || 0} sent campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commStats?.campaigns.totalEmailsSent || 0}</div>
            <p className="text-xs text-muted-foreground">
              {commStats?.campaigns.totalEmailsDelivered || 0} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commStats?.announcements.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {commStats?.announcements.active || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commStats?.notifications.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {commStats?.notifications.unread || 0} unread
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Communication Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Email Campaigns</CardTitle>
                <CardDescription>Latest email campaign activity</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div>Loading campaigns...</div>
                ) : (
                  <div className="space-y-3">
                    {campaigns?.campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(campaign.status) as any}>
                            {campaign.status}
                          </Badge>
                          <span className="text-sm">{campaign.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No campaigns yet</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Announcements */}
            <Card>
              <CardHeader>
                <CardTitle>Active Announcements</CardTitle>
                <CardDescription>Current site announcements</CardDescription>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div>Loading announcements...</div>
                ) : (
                  <div className="space-y-3">
                    {announcements?.announcements.filter(a => a.isActive).slice(0, 5).map((announcement) => (
                      <div key={announcement.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getAnnouncementTypeColor(announcement.type) as any}>
                            {announcement.type}
                          </Badge>
                          <span className="text-sm">{announcement.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Priority: {announcement.priority}
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No active announcements</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Create Campaign Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Email Campaign</CardTitle>
                <CardDescription>Send bulk emails to users</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateCampaign} className="space-y-4">
                  <div>
                    <Label htmlFor="campaignName">Campaign Name</Label>
                    <Input
                      id="campaignName"
                      name="name"
                      placeholder="Monthly Newsletter"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaignSubject">Email Subject</Label>
                    <Input
                      id="campaignSubject"
                      name="subject"
                      placeholder="Your monthly update is here!"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaignContent">Email Content (HTML)</Label>
                    <Textarea
                      id="campaignContent"
                      name="htmlContent"
                      placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createCampaignMutation.isPending}>
                    {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Campaigns List */}
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>Manage your email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div>Loading campaigns...</div>
                ) : (
                  <div className="space-y-3">
                    {campaigns?.campaigns.map((campaign) => (
                      <div key={campaign.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{campaign.name}</div>
                          <Badge variant={getStatusColor(campaign.status) as any}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Subject: {campaign.subject}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Recipients: {campaign.totalRecipients || 0}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Created: {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => sendCampaignMutation.mutate({ campaignId: campaign.id })}
                              disabled={sendCampaignMutation.isPending}
                            >
                              Send Now
                            </Button>
                          )}
                        </div>
                      </div>
                    )) || <div className="text-center text-muted-foreground">No campaigns yet</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Create Template Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Email Template</CardTitle>
                <CardDescription>Create reusable email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateTemplate} className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      name="name"
                      placeholder="Welcome Email"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateType">Template Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="templateSubject">Subject Line</Label>
                    <Input
                      id="templateSubject"
                      name="subject"
                      placeholder="Welcome to our platform!"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateContent">HTML Content</Label>
                    <Textarea
                      id="templateContent"
                      name="htmlContent"
                      placeholder="<h1>Welcome!</h1><p>Thank you for joining us...</p>"
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createTemplateMutation.isPending}>
                    {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Templates List */}
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Your saved email templates</CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div>Loading templates...</div>
                ) : (
                  <div className="space-y-3">
                    {templates?.templates.map((template) => (
                      <div key={template.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{template.name}</div>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Subject: {template.subject}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(template.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )) || <div className="text-center text-muted-foreground">No templates yet</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Create Announcement Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Announcement</CardTitle>
                <CardDescription>Post site-wide announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <Label htmlFor="announcementTitle">Title</Label>
                    <Input
                      id="announcementTitle"
                      name="title"
                      placeholder="System Maintenance Notice"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcementType">Type</Label>
                    <Select name="type" defaultValue="info">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="announcementPriority">Priority (0-10)</Label>
                    <Input
                      id="announcementPriority"
                      name="priority"
                      type="number"
                      min="0"
                      max="10"
                      defaultValue="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcementContent">Content</Label>
                    <Textarea
                      id="announcementContent"
                      name="content"
                      placeholder="We will be performing scheduled maintenance..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createAnnouncementMutation.isPending}>
                    {createAnnouncementMutation.isPending ? 'Creating...' : 'Create Announcement'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Announcements List */}
            <Card>
              <CardHeader>
                <CardTitle>Site Announcements</CardTitle>
                <CardDescription>Manage site announcements</CardDescription>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div>Loading announcements...</div>
                ) : (
                  <div className="space-y-3">
                    {announcements?.announcements.map((announcement) => (
                      <div key={announcement.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{announcement.title}</div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getAnnouncementTypeColor(announcement.type) as any}>
                              {announcement.type}
                            </Badge>
                            {announcement.isActive && (
                              <Badge variant="default">Active</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {announcement.content}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Priority: {announcement.priority}</span>
                          <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )) || <div className="text-center text-muted-foreground">No announcements yet</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>Recent system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div>Loading notifications...</div>
              ) : (
                <div className="space-y-3">
                  {notifications?.notifications.map((notification) => (
                    <div key={notification.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{notification.title}</div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={notification.read ? 'outline' : 'default'}>
                            {notification.read ? 'Read' : 'Unread'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )) || <div className="text-center text-muted-foreground">No notifications</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
