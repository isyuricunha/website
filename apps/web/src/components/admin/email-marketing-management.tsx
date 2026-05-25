'use client'

import { useState, useEffect } from 'react'
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
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea
} from '@isyuricunha/ui'

import {
  Mail,
  Plus,
  Send,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

// Helper function for broadcast status colors
const getBroadcastStatusColor = (status: string | undefined) => {
  switch (status ?? 'draft') {
    case 'sent':
      return 'border border-[var(--accent-border)] bg-[var(--accent-dim)] text-accent-earth-text'
    case 'scheduled':
      return 'border border-[var(--accent-border)] bg-[var(--accent-dim)] text-accent-earth-text'
    case 'draft':
      return 'border border-border bg-bg-surface text-muted-foreground'
    default:
      return 'border border-border bg-bg-surface text-muted-foreground'
  }
}

const formatBroadcastSentDate = (sentAt: string | null | undefined, notSentLabel: string) => {
  return sentAt ? new Date(sentAt).toLocaleDateString() : notSentLabel
}

export default function EmailMarketingManagement() {
  const t = useTranslations('admin.email-marketing-management')
  const commonT = useTranslations('common')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false)
  const [isCreateCampaignDialogOpen, setIsCreateCampaignDialogOpen] = useState(false)
  const [isCreateAudienceDialogOpen, setIsCreateAudienceDialogOpen] = useState(false)
  const [isEditBroadcastDialogOpen, setIsEditBroadcastDialogOpen] = useState(false)
  const [isViewBroadcastDialogOpen, setIsViewBroadcastDialogOpen] = useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = useState<any>(null)
  const [broadcastFilter, setBroadcastFilter] = useState('all')

  // Sequential loading states
  const [loadingStage, setLoadingStage] = useState<
    'audiences' | 'broadcasts' | 'templates' | 'analytics' | 'complete'
  >('audiences')
  const [enableAudiences, setEnableAudiences] = useState(true)
  const [enableBroadcasts, setEnableBroadcasts] = useState(false)
  const [enableTemplates, setEnableTemplates] = useState(false)
  const [enableAnalytics, setEnableAnalytics] = useState(false)

  // Queries with conditional enabling for sequential loading
  const {
    data: audiences,
    isLoading: audiencesLoading,
    refetch: refetchAudiences
  } = api.resendEmail.getAudiences.useQuery(undefined, {
    enabled: enableAudiences
  })
  const {
    data: broadcasts,
    isLoading: broadcastsLoading,
    refetch: refetchBroadcasts
  } = api.resendEmail.getBroadcasts.useQuery(undefined, {
    enabled: enableBroadcasts
  })
  const {
    data: templates,
    isLoading: templatesLoading,
    refetch: refetchTemplates
  } = api.emailManagement.getEmailTemplates.useQuery(
    {},
    {
      enabled: enableTemplates
    }
  )
  const { data: analytics } = api.resendEmail.getAnalytics.useQuery(undefined, {
    enabled: enableAnalytics
  })

  // Sequential loading effect
  useEffect(() => {
    const startSequentialLoading = async () => {
      setLoadingStage('audiences')
      setEnableAudiences(true)
    }

    startSequentialLoading()
  }, [])

  // Handle progression to next stage when current stage completes
  useEffect(() => {
    if (!audiencesLoading && audiences !== undefined && loadingStage === 'audiences') {
      const timeoutId = setTimeout(() => {
        setLoadingStage('broadcasts')
        setEnableBroadcasts(true)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
    return
  }, [audiencesLoading, audiences, loadingStage])

  useEffect(() => {
    if (!broadcastsLoading && broadcasts !== undefined && loadingStage === 'broadcasts') {
      const timeoutId = setTimeout(() => {
        setLoadingStage('templates')
        setEnableTemplates(true)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
    return
  }, [broadcastsLoading, broadcasts, loadingStage])

  useEffect(() => {
    if (!templatesLoading && templates !== undefined && loadingStage === 'templates') {
      const timeoutId = setTimeout(() => {
        setLoadingStage('analytics')
        setEnableAnalytics(true)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
    return
  }, [templatesLoading, templates, loadingStage])

  useEffect(() => {
    if (analytics !== undefined && loadingStage === 'analytics') {
      const timeoutId = setTimeout(() => {
        setLoadingStage('complete')
      }, 0)
      return () => clearTimeout(timeoutId)
    }
    return
  }, [analytics, loadingStage])

  // Mutations - Using Resend native APIs
  const createTemplateMutation = api.emailManagement.createEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success(t('messages.template-created'))
      setIsCreateTemplateDialogOpen(false)
      refetchTemplates()
    },
    onError: (error) => {
      toast.error(t('messages.template-create-failed', { message: error.message }))
    }
  })

  const createAudienceMutation = api.resendEmail.createAudience.useMutation({
    onSuccess: () => {
      toast.success(t('messages.audience-created'))
      setIsCreateAudienceDialogOpen(false)
      refetchAudiences()
    },
    onError: (error) => {
      toast.error(t('messages.audience-create-failed', { message: error.message }))
    }
  })

  const createBroadcastMutation = api.resendEmail.createBroadcast.useMutation({
    onSuccess: () => {
      toast.success(t('messages.broadcast-created'))
      setIsCreateCampaignDialogOpen(false)
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(t('messages.broadcast-create-failed', { message: error.message }))
    }
  })

  const syncUsersMutation = api.resendEmail.syncUsersToAudience.useMutation({
    onSuccess: (data) => {
      toast.success(t('messages.users-synced', { count: data.synced }))
      refetchAudiences()
    },
    onError: (error) => {
      toast.error(t('messages.sync-failed', { message: error.message }))
    }
  })

  const sendBroadcastMutation = api.resendEmail.sendBroadcast.useMutation({
    onSuccess: () => {
      toast.success(t('messages.broadcast-sent'))
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(t('messages.broadcast-send-failed', { message: error.message }))
    }
  })

  const updateBroadcastMutation = api.resendEmail.updateBroadcast.useMutation({
    onSuccess: () => {
      toast.success(t('messages.broadcast-updated'))
      setIsEditBroadcastDialogOpen(false)
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(t('messages.broadcast-update-failed', { message: error.message }))
    }
  })

  const deleteBroadcastMutation = api.resendEmail.deleteBroadcast.useMutation({
    onSuccess: () => {
      toast.success(t('messages.broadcast-deleted'))
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(t('messages.broadcast-delete-failed', { message: error.message }))
    }
  })

  const { data: selectedBroadcastData } = api.resendEmail.getBroadcast.useQuery(
    { broadcastId: selectedBroadcast?.id },
    { enabled: !!selectedBroadcast?.id }
  )

  const handleCreateTemplate = async (formData: FormData) => {
    const name = formData.get('name') as string
    const subject = formData.get('subject') as string
    const html = formData.get('html') as string
    // const text = formData.get('text') as string // Unused variable

    createTemplateMutation.mutate({
      name,
      subject,
      content: html,
      type: 'notification' as const,
      variables: []
    })
  }

  const handleCreateAudience = async (formData: FormData) => {
    const name = formData.get('name') as string

    createAudienceMutation.mutate({ name })
  }

  const handleCreateBroadcast = async (formData: FormData) => {
    const audienceId = formData.get('audienceId') as string
    const name = formData.get('name') as string
    const subject = formData.get('subject') as string
    const html = formData.get('html') as string
    const text = formData.get('text') as string
    const from = formData.get('from') as string
    // const scheduleOption = formData.get('scheduleOption') as string // Unused variable
    // const scheduledAt = formData.get('scheduledAt') as string // Unused variable

    createBroadcastMutation.mutate({
      audienceId,
      name,
      subject,
      html,
      text: text || undefined,
      from
    })
  }

  const handleSyncUsers = (audienceId: string) => {
    syncUsersMutation.mutate({ audienceId })
  }

  const handleSendBroadcast = (broadcastId: string) => {
    sendBroadcastMutation.mutate({ broadcastId })
  }

  const handleViewBroadcast = (broadcast: any) => {
    setSelectedBroadcast(broadcast)
    setIsViewBroadcastDialogOpen(true)
  }

  const handleEditBroadcast = (broadcast: any) => {
    setSelectedBroadcast(broadcast)
    setIsEditBroadcastDialogOpen(true)
  }

  const handleDeleteBroadcast = (broadcastId: string) => {
    if (confirm(t('confirm.delete-broadcast'))) {
      deleteBroadcastMutation.mutate({ broadcastId })
    }
  }

  const handleDuplicateBroadcast = (broadcast: any) => {
    setSelectedBroadcast({ ...broadcast, name: `${broadcast.name} (Copy)` })
    setIsCreateCampaignDialogOpen(true)
  }

  const handleUpdateBroadcast = async (formData: FormData) => {
    if (!selectedBroadcast?.id) return

    const subject = formData.get('subject') as string
    const html = formData.get('html') as string
    // const text = formData.get('text') as string // Unused variable

    updateBroadcastMutation.mutate({
      broadcastId: selectedBroadcast.id,
      subject,
      html
    })
  }

  // Filter broadcasts based on status
  const filteredBroadcasts =
    broadcasts?.broadcasts?.filter((broadcast) => {
      if (broadcastFilter === 'all') return true
      return broadcast.status === broadcastFilter
    }) || []

  // Helper function to render loading indicator for each stage
  const renderLoadingIndicator = (_stage: string, isActive: boolean, isComplete: boolean) => {
    if (isComplete) {
      return <CheckCircle className='text-accent-earth-text h-5 w-5' />
    } else if (isActive) {
      return <Loader2 className='text-accent-earth-text h-5 w-5 animate-spin' />
    } else {
      return <Clock className='text-muted-foreground h-5 w-5' />
    }
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-text-primary flex items-center gap-3 text-4xl font-medium tracking-tight'>
            <div className='text-accent-earth-text rounded-xl bg-[var(--accent-dim)] p-2.5'>
              <Mail className='h-8 w-8' />
            </div>
            {t('title')}
          </h1>
          <p className='text-muted-foreground text-base'>{t('description')}</p>
        </div>
      </div>

      {/* Sequential Loading Progress */}
      {loadingStage !== 'complete' && (
        <Card className='bg-bg-surface border-[var(--border-subtle)]'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Loader2 className='text-accent-earth-text h-5 w-5 animate-spin' />
              {t('loading.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                {renderLoadingIndicator(
                  'audiences',
                  loadingStage === 'audiences',
                  loadingStage !== 'audiences' && audiences !== undefined
                )}
                <span className={loadingStage === 'audiences' ? 'font-medium' : ''}>
                  {t('loading.audiences')}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                {renderLoadingIndicator(
                  'broadcasts',
                  loadingStage === 'broadcasts',
                  loadingStage !== 'broadcasts' && broadcasts !== undefined
                )}
                <span className={loadingStage === 'broadcasts' ? 'font-medium' : ''}>
                  {t('loading.broadcasts')}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                {renderLoadingIndicator(
                  'templates',
                  loadingStage === 'templates',
                  loadingStage !== 'templates' && templates !== undefined
                )}
                <span className={loadingStage === 'templates' ? 'font-medium' : ''}>
                  {t('loading.templates')}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                {renderLoadingIndicator(
                  'analytics',
                  loadingStage === 'analytics',
                  analytics !== undefined
                )}
                <span className={loadingStage === 'analytics' ? 'font-medium' : ''}>
                  {t('loading.analytics')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value='audiences'>{t('tabs.audiences')}</TabsTrigger>
          <TabsTrigger value='broadcasts'>{t('tabs.broadcasts')}</TabsTrigger>
          <TabsTrigger value='templates'>{t('tabs.templates')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='bg-bg-surface border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground text-sm font-semibold'>
                  {t('stats.total-audiences.title')}
                </CardTitle>
                <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                  <Users className='h-5 w-5' />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-3xl font-medium tracking-tight'>
                  {analytics?.totalAudiences || 0}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  {t('stats.total-audiences.description')}
                </p>
              </CardContent>
            </Card>
            <Card className='bg-bg-surface border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground text-sm font-semibold'>
                  {t('stats.total-broadcasts.title')}
                </CardTitle>
                <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                  <Mail className='h-5 w-5' />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-3xl font-medium tracking-tight'>
                  {analytics?.totalBroadcasts || 0}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  {t('stats.total-broadcasts.description')}
                </p>
              </CardContent>
            </Card>
            <Card className='bg-bg-surface border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground text-sm font-semibold'>
                  {t('stats.subscribers.title')}
                </CardTitle>
                <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                  <TrendingUp className='h-5 w-5' />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-3xl font-medium tracking-tight'>
                  {analytics?.totalSubscribers || 0}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  {t('stats.subscribers.description', {
                    rate: analytics?.subscriptionRate || 0
                  })}
                </p>
              </CardContent>
            </Card>
            <Card className='bg-bg-surface border-[var(--border-subtle)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground text-sm font-semibold'>
                  {t('stats.sent-broadcasts.title')}
                </CardTitle>
                <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                  <Send className='h-5 w-5' />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-3xl font-medium tracking-tight'>
                  {analytics?.broadcasts?.sent || 0}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  {t('stats.sent-broadcasts.description')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <Card className='bg-bg-surface border-[var(--border-subtle)]'>
              <CardHeader>
                <div className='mb-1 flex items-center gap-2'>
                  <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                    <Clock className='h-4 w-4' />
                  </div>
                  <CardTitle className='text-base'>{t('overview.recent-activity')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {broadcasts?.broadcasts?.slice(0, 5).map((broadcast) => (
                    <div key={broadcast.id} className='flex items-center space-x-4'>
                      <div className='flex-shrink-0'>
                        <Badge className={getBroadcastStatusColor(broadcast.status)}>
                          {broadcast.status}
                        </Badge>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>{broadcast.name}</p>
                        <p className='text-muted-foreground text-sm'>
                          {formatBroadcastSentDate(broadcast.sent_at, t('date.not-sent'))}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className='text-muted-foreground text-sm'>{t('overview.no-activity')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className='bg-bg-surface border-[var(--border-subtle)]'>
              <CardHeader>
                <div className='mb-1 flex items-center gap-2'>
                  <div className='text-accent-earth-text rounded-lg bg-[var(--accent-dim)] p-2'>
                    <Send className='h-4 w-4' />
                  </div>
                  <CardTitle className='text-base'>{t('overview.quick-actions')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  onClick={() => setIsCreateCampaignDialogOpen(true)}
                  className='w-full'
                  disabled={!audiences?.audiences?.length}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  {t('actions.create-new-broadcast')}
                </Button>
                <Button
                  onClick={() => setIsCreateAudienceDialogOpen(true)}
                  variant='outline'
                  className='w-full'
                >
                  <Users className='mr-2 h-4 w-4' />
                  {t('actions.create-new-audience')}
                </Button>
                <Button
                  onClick={() => setIsCreateTemplateDialogOpen(true)}
                  variant='outline'
                  className='w-full'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  {t('actions.create-new-template')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audiences Tab */}
        <TabsContent value='audiences' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-medium'>{t('audiences.title')}</h2>
            <Dialog open={isCreateAudienceDialogOpen} onOpenChange={setIsCreateAudienceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  {t('actions.create-audience')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('audiences.create-title')}</DialogTitle>
                  <DialogDescription>{t('audiences.create-description')}</DialogDescription>
                </DialogHeader>

                <form action={handleCreateAudience}>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='name'>{t('fields.audience-name')}</Label>
                      <Input
                        id='name'
                        name='name'
                        placeholder={t('fields.audience-name-placeholder')}
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter className='mt-6'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsCreateAudienceDialogOpen(false)}
                    >
                      {commonT('cancel')}
                    </Button>
                    <Button type='submit'>{t('actions.create-audience')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {audiences?.audiences?.map((audience) => (
              <Card
                key={audience.id}
                className='bg-bg-surface border-[var(--border-subtle)] transition-all duration-200 hover:shadow-md'
              >
                <CardHeader>
                  <CardTitle className='flex items-center justify-between text-base'>
                    <span className='font-semibold'>{audience.name}</span>
                    <Badge variant='secondary' className='text-xs'>
                      {t('audiences.subscriber-count', { count: 0 })}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      {t('date.created', { date: new Date().toLocaleDateString() })}
                    </p>
                    <Button
                      onClick={() => handleSyncUsers(audience.id)}
                      variant='outline'
                      size='sm'
                      disabled={syncUsersMutation.isPending}
                    >
                      {syncUsersMutation.isPending ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          {t('actions.syncing')}
                        </>
                      ) : (
                        <>
                          <Users className='mr-2 h-4 w-4' />
                          {t('actions.sync-users')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className='text-muted-foreground col-span-full py-8 text-center'>
                <Users className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>{t('audiences.empty')}</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value='broadcasts' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-medium'>{t('broadcasts.title')}</h2>
            <div className='flex items-center gap-4'>
              <Select value={broadcastFilter} onValueChange={setBroadcastFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder={t('broadcasts.filter-placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('broadcasts.status.all')}</SelectItem>
                  <SelectItem value='draft'>{t('broadcasts.status.draft')}</SelectItem>
                  <SelectItem value='sent'>{t('broadcasts.status.sent')}</SelectItem>
                  <SelectItem value='scheduled'>{t('broadcasts.status.scheduled')}</SelectItem>
                  <SelectItem value='sending'>{t('broadcasts.status.sending')}</SelectItem>
                </SelectContent>
              </Select>

              <Dialog
                open={isCreateCampaignDialogOpen}
                onOpenChange={setIsCreateCampaignDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button disabled={!audiences?.audiences?.length}>
                    <Plus className='mr-2 h-4 w-4' />
                    {t('actions.create-broadcast')}
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <DialogHeader>
                    <DialogTitle>{t('broadcasts.create-title')}</DialogTitle>
                    <DialogDescription>{t('broadcasts.create-description')}</DialogDescription>
                  </DialogHeader>

                  <form action={handleCreateBroadcast}>
                    <div className='space-y-4'>
                      <div>
                        <Label htmlFor='name'>{t('fields.broadcast-name')}</Label>
                        <Input
                          id='name'
                          name='name'
                          defaultValue={selectedBroadcast?.name || ''}
                          placeholder={t('fields.broadcast-name-placeholder')}
                          className='h-11 min-h-[44px] px-3 py-2 text-sm sm:text-base'
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor='audienceId'>{t('fields.target-audience')}</Label>
                        <Select
                          name='audienceId'
                          defaultValue={selectedBroadcast?.audienceId || ''}
                          required
                        >
                          <SelectTrigger className='h-11 min-h-[44px] px-3 py-2 text-sm sm:text-base'>
                            <SelectValue placeholder={t('fields.select-audience')} />
                          </SelectTrigger>
                          <SelectContent>
                            {audiences?.audiences?.map((audience) => (
                              <SelectItem key={audience.id} value={audience.id}>
                                {t('audiences.option-subscriber-count', {
                                  name: audience.name,
                                  count: 0
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor='from'>{t('fields.from-email')}</Label>
                        <Input
                          id='from'
                          name='from'
                          type='email'
                          defaultValue={selectedBroadcast?.from || ''}
                          placeholder='noreply@yourdomain.com'
                          className='h-11 min-h-[44px] px-3 py-2 text-sm sm:text-base'
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor='subject'>{t('fields.subject-line')}</Label>
                        <Input
                          id='subject'
                          name='subject'
                          defaultValue={selectedBroadcast?.subject || ''}
                          placeholder={t('fields.email-subject-placeholder')}
                          className='h-11 min-h-[44px] px-3 py-2 text-sm sm:text-base'
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor='html'>{t('fields.email-content-html')}</Label>
                        <Textarea
                          id='html'
                          name='html'
                          defaultValue={selectedBroadcast?.html || ''}
                          placeholder={t('fields.email-html-placeholder')}
                          className='min-h-[120px] px-3 py-2 text-sm sm:text-base'
                          rows={8}
                        />
                      </div>

                      <div>
                        <Label htmlFor='text'>{t('fields.plain-text-optional')}</Label>
                        <Textarea
                          id='text'
                          name='text'
                          defaultValue={selectedBroadcast?.text || ''}
                          placeholder={t('fields.plain-text-placeholder')}
                          className='min-h-[80px] px-3 py-2 text-sm sm:text-base'
                          rows={4}
                        />
                      </div>
                    </div>

                    <DialogFooter className='mt-6'>
                      <Button
                        type='button'
                        variant='outline'
                        className='min-h-[44px] text-sm sm:text-base'
                        onClick={() => setIsCreateCampaignDialogOpen(false)}
                      >
                        {commonT('cancel')}
                      </Button>
                      <Button type='submit' className='min-h-[44px] text-sm sm:text-base'>
                        {t('actions.create-broadcast')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className='bg-bg-surface border-[var(--border-subtle)]'>
            <CardContent className='p-0'>
              <ScrollArea className='h-[500px]'>
                <div className='space-y-4 p-4'>
                  {filteredBroadcasts.map((broadcast) => (
                    <Card
                      key={broadcast.id}
                      className='border transition-all duration-200 hover:shadow-md'
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='mb-2 flex items-center gap-2'>
                              <h3 className='font-semibold'>{broadcast.name}</h3>
                              <Badge className={getBroadcastStatusColor(broadcast.status)}>
                                {broadcast.status}
                              </Badge>
                            </div>

                            <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                              <span className='flex items-center gap-1'>
                                <Calendar className='h-3 w-3' />
                                {formatBroadcastSentDate(broadcast.sent_at, t('date.not-sent'))}
                              </span>
                              <span className='flex items-center gap-1'>
                                <Users className='h-3 w-3' />
                                {t('fields.audience')}
                              </span>
                              {broadcast.status === 'sent' && (
                                <span className='flex items-center gap-1'>
                                  <Send className='h-3 w-3' />
                                  {t('broadcasts.status.sent')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className='ml-4 flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleViewBroadcast(broadcast)}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>

                            {broadcast.status === 'draft' && (
                              <>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleEditBroadcast(broadcast)}
                                >
                                  <Edit3 className='h-4 w-4' />
                                </Button>

                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleSendBroadcast(broadcast.id)}
                                >
                                  <Send className='h-4 w-4' />
                                </Button>
                              </>
                            )}

                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleDuplicateBroadcast(broadcast)}
                            >
                              <Copy className='h-4 w-4' />
                            </Button>

                            <Button
                              variant='destructive'
                              size='sm'
                              onClick={() => handleDeleteBroadcast(broadcast.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredBroadcasts.length === 0 && broadcasts?.broadcasts?.length ? (
                    <div className='text-muted-foreground py-8 text-center'>
                      <Mail className='mx-auto mb-4 h-12 w-12 opacity-50' />
                      <p>{t('broadcasts.empty-filtered')}</p>
                      <Button
                        variant='outline'
                        onClick={() => setBroadcastFilter('all')}
                        className='mt-2'
                      >
                        {t('actions.show-all-broadcasts')}
                      </Button>
                    </div>
                  ) : broadcasts?.broadcasts?.length ? null : (
                    <div className='text-muted-foreground py-8 text-center'>
                      <Mail className='mx-auto mb-4 h-12 w-12 opacity-50' />
                      <p>{t('broadcasts.empty')}</p>
                      <p className='mt-2 text-sm'>{t('broadcasts.empty-hint')}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value='templates' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-medium'>{t('templates.title')}</h2>
            <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  {t('actions.create-template')}
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>{t('templates.create-title')}</DialogTitle>
                  <DialogDescription>{t('templates.create-description')}</DialogDescription>
                </DialogHeader>

                <form action={handleCreateTemplate}>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='template-name'>{t('fields.template-name')}</Label>
                      <Input
                        id='template-name'
                        name='name'
                        placeholder={t('fields.template-name-placeholder')}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='template-subject'>{t('fields.subject-line')}</Label>
                      <Input
                        id='template-subject'
                        name='subject'
                        placeholder={t('fields.email-subject-placeholder')}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='template-html'>{t('fields.email-content-html')}</Label>
                      <Textarea
                        id='template-html'
                        name='html'
                        placeholder={t('fields.email-html-placeholder')}
                        rows={8}
                      />
                    </div>

                    <div>
                      <Label htmlFor='template-text'>{t('fields.plain-text-optional')}</Label>
                      <Textarea
                        id='template-text'
                        name='text'
                        placeholder={t('fields.plain-text-placeholder')}
                        rows={4}
                      />
                    </div>
                  </div>

                  <DialogFooter className='mt-6'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsCreateTemplateDialogOpen(false)}
                    >
                      {commonT('cancel')}
                    </Button>
                    <Button type='submit'>{t('actions.create-template')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {templates?.templates?.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      {t('date.created', {
                        date: new Date(template.createdAt).toLocaleDateString()
                      })}
                    </p>
                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm'>
                        <Edit3 className='mr-1 h-4 w-4' />
                        {t('actions.edit')}
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Copy className='mr-1 h-4 w-4' />
                        {t('actions.use')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className='text-muted-foreground col-span-full py-8 text-center'>
                <FileText className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>{t('templates.empty')}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Broadcast Dialog */}
      <Dialog open={isViewBroadcastDialogOpen} onOpenChange={setIsViewBroadcastDialogOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>{t('broadcast-details.title')}</DialogTitle>
            <DialogDescription>{t('broadcast-details.description')}</DialogDescription>
          </DialogHeader>

          {selectedBroadcastData && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>{t('fields.name')}</Label>
                  <p className='text-sm'>
                    {selectedBroadcastData?.broadcast?.name || t('fields.not-available')}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>{t('fields.status')}</Label>
                  <Badge
                    className={getBroadcastStatusColor(
                      selectedBroadcastData?.broadcast?.status || 'draft'
                    )}
                  >
                    {selectedBroadcastData?.broadcast?.status || 'draft'}
                  </Badge>
                </div>
                <div>
                  <Label className='text-sm font-medium'>{t('fields.subject')}</Label>
                  <p className='text-sm'>
                    {selectedBroadcastData?.broadcast?.subject || t('fields.not-available')}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>{t('fields.from')}</Label>
                  <p className='text-sm'>
                    {selectedBroadcastData?.broadcast?.from || t('fields.not-available')}
                  </p>
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium'>{t('fields.html-content')}</Label>
                <div className='bg-muted mt-2 max-h-64 overflow-y-auto rounded-lg p-4'>
                  <pre className='text-xs whitespace-pre-wrap'>
                    {selectedBroadcastData?.broadcast?.html || t('fields.no-content')}
                  </pre>
                </div>
              </div>

              {selectedBroadcastData?.broadcast?.text && (
                <div>
                  <Label className='text-sm font-medium'>{t('fields.plain-text-content')}</Label>
                  <div className='bg-muted mt-2 max-h-64 overflow-y-auto rounded-lg p-4'>
                    <pre className='text-xs whitespace-pre-wrap'>
                      {selectedBroadcastData.broadcast.text}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsViewBroadcastDialogOpen(false)}>
              {t('actions.close')}
            </Button>
            {selectedBroadcast?.status === 'draft' && (
              <Button
                onClick={() => {
                  setIsViewBroadcastDialogOpen(false)
                  handleEditBroadcast(selectedBroadcast)
                }}
              >
                <Edit3 className='mr-2 h-4 w-4' />
                {t('actions.edit-broadcast')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Broadcast Dialog */}
      <Dialog open={isEditBroadcastDialogOpen} onOpenChange={setIsEditBroadcastDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{t('edit-broadcast.title')}</DialogTitle>
            <DialogDescription>{t('edit-broadcast.description')}</DialogDescription>
          </DialogHeader>

          <form action={handleUpdateBroadcast}>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='edit-subject'>{t('fields.subject-line')}</Label>
                <Input
                  id='edit-subject'
                  name='subject'
                  defaultValue={selectedBroadcast?.subject || ''}
                  placeholder={t('fields.email-subject-placeholder')}
                  required
                />
              </div>

              <div>
                <Label htmlFor='edit-html'>{t('fields.email-content-html')}</Label>
                <Textarea
                  id='edit-html'
                  name='html'
                  defaultValue={selectedBroadcast?.html || ''}
                  placeholder={t('fields.email-html-placeholder')}
                  rows={12}
                />
              </div>

              <div>
                <Label htmlFor='edit-text'>{t('fields.plain-text-optional')}</Label>
                <Textarea
                  id='edit-text'
                  name='text'
                  defaultValue={selectedBroadcast?.text || ''}
                  placeholder={t('fields.plain-text-placeholder')}
                  rows={6}
                />
              </div>
            </div>

            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditBroadcastDialogOpen(false)}
              >
                {commonT('cancel')}
              </Button>
              <Button type='submit' disabled={updateBroadcastMutation.isPending}>
                {updateBroadcastMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('actions.updating')}
                  </>
                ) : (
                  <>
                    <Edit3 className='mr-2 h-4 w-4' />
                    {t('actions.update-broadcast')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
