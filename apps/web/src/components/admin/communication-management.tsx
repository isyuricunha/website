'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@isyuricunha/ui'

import { Mail, Megaphone, Bell, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { api } from '@/trpc/react'
import { getAnnouncementUi } from '@/lib/announcement-ui'

export default function CommunicationManagement() {
  const t = useTranslations('admin.communication-management')
  const [selectedTab, setSelectedTab] = useState('overview')

  // Communication stats query
  const { data: commStats, isLoading: statsLoading } =
    api.communication.getCommunicationStats.useQuery()

  // Email campaigns query
  const { data: campaigns, isLoading: campaignsLoading } =
    api.communication.getEmailCampaigns.useQuery({})

  // Email templates query
  const { data: templates, isLoading: templatesLoading } =
    api.communication.getEmailTemplates.useQuery({})

  // Announcements query
  const { data: announcements, isLoading: announcementsLoading } =
    api.announcements.getAnnouncements.useQuery({
      adminView: true
    })

  // Notifications query (for current user)
  const { data: notifications, isLoading: notificationsLoading } =
    api.communication.getAllNotifications.useQuery({
      limit: 20,
      offset: 0,
      includeExpired: false
    })

  // Mutations
  const createTemplateMutation = api.communication.createEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success(t('messages.template-created'))
    },
    onError: (error) => {
      toast.error(t('messages.template-create-failed', { message: error.message }))
    }
  })

  const createCampaignMutation = api.communication.createEmailCampaign.useMutation({
    onSuccess: () => {
      toast.success(t('messages.campaign-created'))
    },
    onError: (error) => {
      toast.error(t('messages.campaign-create-failed', { message: error.message }))
    }
  })

  const sendCampaignMutation = api.communication.sendEmailCampaign.useMutation({
    onSuccess: () => {
      toast.success(t('messages.campaign-sent'))
    },
    onError: (error) => {
      toast.error(t('messages.campaign-send-failed', { message: error.message }))
    }
  })

  const createAnnouncementMutation = api.announcements.createAnnouncement.useMutation({
    onSuccess: () => {
      toast.success(t('messages.announcement-created'))
    },
    onError: (error) => {
      toast.error(t('messages.announcement-create-failed', { message: error.message }))
    }
  })

  const handleCreateTemplate = (formData: FormData) => {
    const name = formData.get('name') as string
    const type = formData.get('type') as any
    const subject = formData.get('subject') as string
    const htmlContent = formData.get('htmlContent') as string

    if (!name || !type || !subject || !htmlContent) {
      toast.error(t('messages.all-fields-required'))
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
      toast.error(t('messages.campaign-fields-required'))
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
    const title_pt = (formData.get('titlePt') as string | null) ?? ''
    const content_pt = (formData.get('contentPt') as string | null) ?? ''
    const type = formData.get('type') as any
    const priority = Number.parseInt(formData.get('priority') as string) || 0

    if (!title || !content) {
      toast.error(t('messages.title-content-required'))
      return
    }

    createAnnouncementMutation.mutate({
      title,
      content,
      titlePt: title_pt.trim() ? title_pt : undefined,
      contentPt: content_pt.trim() ? content_pt : undefined,
      type,
      priority
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'default'
      case 'sending':
        return 'secondary'
      case 'scheduled':
        return 'outline'
      case 'draft':
        return 'outline'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getAnnouncementTypeVariant = (type: string) => {
    return getAnnouncementUi(type).badgeVariant
  }

  if (statsLoading) {
    return <div className='p-6'>{t('loading')}</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-medium'>{t('title')}</h1>
          <p className='text-text-secondary'>{t('description')}</p>
        </div>
      </div>

      {/* Communication Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.email-campaigns')}</CardTitle>
            <Mail className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{commStats?.campaigns.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.sent-campaigns', { count: commStats?.campaigns.sent || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.emails-sent')}</CardTitle>
            <Send className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{commStats?.campaigns.totalEmailsSent || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.delivered', {
                count: commStats?.campaigns.totalEmailsDelivered || 0
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.announcements')}</CardTitle>
            <Megaphone className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{commStats?.announcements.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.active', { count: commStats?.announcements.active || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.notifications')}</CardTitle>
            <Bell className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{commStats?.notifications.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.unread', { count: commStats?.notifications.unread || 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Communication Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value='campaigns'>{t('tabs.campaigns')}</TabsTrigger>
          <TabsTrigger value='templates'>{t('tabs.templates')}</TabsTrigger>
          <TabsTrigger value='announcements'>{t('tabs.announcements')}</TabsTrigger>
          <TabsTrigger value='notifications'>{t('tabs.notifications')}</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.recent-campaigns.title')}</CardTitle>
                <CardDescription>{t('overview.recent-campaigns.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div>{t('campaigns.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {campaigns?.campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                          <span className='text-sm'>{campaign.name}</span>
                        </div>
                        <span className='text-text-secondary text-xs'>
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )) || <div className='text-text-secondary text-sm'>{t('campaigns.empty')}</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Announcements */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.active-announcements.title')}</CardTitle>
                <CardDescription>{t('overview.active-announcements.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div>{t('announcements.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {announcements?.announcements
                      .filter((a) => a.isActive)
                      .slice(0, 5)
                      .map((announcement) => (
                        <div key={announcement.id} className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Badge variant={getAnnouncementTypeVariant(announcement.type)}>
                              {announcement.type}
                            </Badge>
                            <span className='text-sm'>{announcement.title}</span>
                          </div>
                          <span className='text-text-secondary text-xs'>
                            {t('announcements.priority', { priority: announcement.priority })}
                          </span>
                        </div>
                      )) || (
                      <div className='text-text-secondary text-sm'>
                        {t('announcements.no-active')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='campaigns' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Create Campaign Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('campaigns.create-title')}</CardTitle>
                <CardDescription>{t('campaigns.create-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateCampaign} className='space-y-4'>
                  <div>
                    <Label htmlFor='campaignName'>{t('fields.campaign-name')}</Label>
                    <Input
                      id='campaignName'
                      name='name'
                      placeholder={t('fields.campaign-name-placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='campaignSubject'>{t('fields.email-subject')}</Label>
                    <Input
                      id='campaignSubject'
                      name='subject'
                      placeholder={t('fields.email-subject-placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='campaignContent'>{t('fields.email-content-html')}</Label>
                    <Textarea
                      id='campaignContent'
                      name='htmlContent'
                      placeholder={t('fields.campaign-content-placeholder')}
                      rows={6}
                      required
                    />
                  </div>
                  <Button type='submit' disabled={createCampaignMutation.isPending}>
                    {createCampaignMutation.isPending
                      ? t('actions.creating')
                      : t('actions.create-campaign')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Campaigns List */}
            <Card>
              <CardHeader>
                <CardTitle>{t('campaigns.list-title')}</CardTitle>
                <CardDescription>{t('campaigns.list-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div>{t('campaigns.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {campaigns?.campaigns.map((campaign) => (
                      <div key={campaign.id} className='rounded border p-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='font-medium'>{campaign.name}</div>
                          <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                        </div>
                        <div className='text-text-secondary mb-2 text-sm'>
                          {t('campaigns.subject', { subject: campaign.subject })}
                        </div>
                        <div className='text-text-secondary mb-2 text-sm'>
                          {t('campaigns.recipients', {
                            count: campaign.totalRecipients || 0
                          })}
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-text-secondary text-xs'>
                            {t('date.created', {
                              date: new Date(campaign.createdAt).toLocaleDateString()
                            })}
                          </span>
                          {campaign.status === 'draft' && (
                            <Button
                              size='sm'
                              onClick={() =>
                                sendCampaignMutation.mutate({ campaignId: campaign.id })
                              }
                              disabled={sendCampaignMutation.isPending}
                            >
                              {t('actions.send-now')}
                            </Button>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className='text-text-secondary text-center'>{t('campaigns.empty')}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='templates' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Create Template Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('templates.create-title')}</CardTitle>
                <CardDescription>{t('templates.create-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateTemplate} className='space-y-4'>
                  <div>
                    <Label htmlFor='templateName'>{t('fields.template-name')}</Label>
                    <Input
                      id='templateName'
                      name='name'
                      placeholder={t('fields.template-name-placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='templateType'>{t('fields.template-type')}</Label>
                    <Select name='type' required>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.template-type-placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='welcome'>{t('template-types.welcome')}</SelectItem>
                        <SelectItem value='newsletter'>{t('template-types.newsletter')}</SelectItem>
                        <SelectItem value='announcement'>
                          {t('template-types.announcement')}
                        </SelectItem>
                        <SelectItem value='notification'>
                          {t('template-types.notification')}
                        </SelectItem>
                        <SelectItem value='marketing'>{t('template-types.marketing')}</SelectItem>
                        <SelectItem value='transactional'>
                          {t('template-types.transactional')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='templateSubject'>{t('fields.subject-line')}</Label>
                    <Input
                      id='templateSubject'
                      name='subject'
                      placeholder={t('fields.template-subject-placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='templateContent'>{t('fields.html-content')}</Label>
                    <Textarea
                      id='templateContent'
                      name='htmlContent'
                      placeholder={t('fields.template-content-placeholder')}
                      rows={6}
                      required
                    />
                  </div>
                  <Button type='submit' disabled={createTemplateMutation.isPending}>
                    {createTemplateMutation.isPending
                      ? t('actions.creating')
                      : t('actions.create-template')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Templates List */}
            <Card>
              <CardHeader>
                <CardTitle>{t('templates.list-title')}</CardTitle>
                <CardDescription>{t('templates.list-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div>{t('templates.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {templates?.templates.map((template) => (
                      <div key={template.id} className='rounded border p-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='font-medium'>{template.name}</div>
                          <Badge variant='outline'>{template.type}</Badge>
                        </div>
                        <div className='text-text-secondary mb-2 text-sm'>
                          {t('templates.subject', { subject: template.subject })}
                        </div>
                        <div className='text-text-secondary text-xs'>
                          {t('date.created', {
                            date: new Date(template.createdAt).toLocaleDateString()
                          })}
                        </div>
                      </div>
                    )) || (
                      <div className='text-text-secondary text-center'>{t('templates.empty')}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='announcements' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Create Announcement Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('announcements.create-title')}</CardTitle>
                <CardDescription>{t('announcements.create-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateAnnouncement} className='space-y-4'>
                  <div>
                    <Label htmlFor='announcementTitle'>{t('fields.title')}</Label>
                    <Input
                      id='announcementTitle'
                      name='title'
                      placeholder={t('fields.announcement-title-placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='announcementTitlePt'>{t('fields.title-pt')}</Label>
                    <Input
                      id='announcementTitlePt'
                      name='titlePt'
                      placeholder={t('fields.announcement-title-pt-placeholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor='announcementType'>{t('fields.type')}</Label>
                    <Select name='type' defaultValue='info'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='info'>{t('announcement-types.info')}</SelectItem>
                        <SelectItem value='warning'>{t('announcement-types.warning')}</SelectItem>
                        <SelectItem value='success'>{t('announcement-types.success')}</SelectItem>
                        <SelectItem value='error'>{t('announcement-types.error')}</SelectItem>
                        <SelectItem value='maintenance'>
                          {t('announcement-types.maintenance')}
                        </SelectItem>
                        <SelectItem value='feature'>{t('announcement-types.feature')}</SelectItem>
                        <SelectItem value='update'>{t('announcement-types.update')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='announcementPriority'>{t('fields.priority')}</Label>
                    <Input
                      id='announcementPriority'
                      name='priority'
                      type='number'
                      min='0'
                      max='10'
                      defaultValue='0'
                    />
                  </div>
                  <div>
                    <Label htmlFor='announcementContent'>{t('fields.content')}</Label>
                    <Textarea
                      id='announcementContent'
                      name='content'
                      placeholder={t('fields.announcement-content-placeholder')}
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='announcementContentPt'>{t('fields.content-pt')}</Label>
                    <Textarea
                      id='announcementContentPt'
                      name='contentPt'
                      placeholder={t('fields.announcement-content-pt-placeholder')}
                      rows={4}
                    />
                  </div>
                  <Button type='submit' disabled={createAnnouncementMutation.isPending}>
                    {createAnnouncementMutation.isPending
                      ? t('actions.creating')
                      : t('actions.create-announcement')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Announcements List */}
            <Card>
              <CardHeader>
                <CardTitle>{t('announcements.list-title')}</CardTitle>
                <CardDescription>{t('announcements.list-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div>{t('announcements.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {announcements?.announcements.map((announcement) => (
                      <div key={announcement.id} className='rounded border p-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='font-medium'>{announcement.title}</div>
                          <div className='flex items-center space-x-2'>
                            <Badge variant={getAnnouncementTypeVariant(announcement.type)}>
                              {announcement.type}
                            </Badge>
                            {announcement.isActive && (
                              <Badge variant='default'>{t('announcements.active')}</Badge>
                            )}
                          </div>
                        </div>
                        <div className='text-text-secondary mb-2 text-sm'>
                          {announcement.content}
                        </div>
                        <div className='text-text-secondary flex items-center justify-between text-xs'>
                          <span>
                            {t('announcements.priority', { priority: announcement.priority })}
                          </span>
                          <span>
                            {t('date.created', {
                              date: new Date(announcement.createdAt).toLocaleDateString()
                            })}
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className='text-text-secondary text-center'>
                        {t('announcements.empty')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>{t('notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div>{t('notifications.loading')}</div>
              ) : (
                <div className='space-y-3'>
                  {notifications?.notifications.map((notification) => (
                    <div key={notification.id} className='rounded border p-3'>
                      <div className='mb-2 flex items-center justify-between'>
                        <div className='font-medium'>{notification.title}</div>
                        <div className='flex items-center space-x-2'>
                          <Badge variant={notification.read ? 'outline' : 'default'}>
                            {notification.read
                              ? t('notifications.read')
                              : t('notifications.unread')}
                          </Badge>
                        </div>
                      </div>
                      <div className='text-text-secondary mb-2 text-sm'>{notification.message}</div>
                      <div className='text-text-secondary text-xs'>
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )) || (
                    <div className='text-text-secondary text-center'>
                      {t('notifications.empty')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
