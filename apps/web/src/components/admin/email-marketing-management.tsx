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
} from '@tszhong0411/ui'

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
import { toast } from 'sonner'

import { api } from '@/trpc/react'

// Helper function for broadcast status colors
const getBroadcastStatusColor = (status: string | undefined) => {
  switch (status ?? 'draft') {
    case 'sent':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function EmailMarketingManagement() {
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
      setLoadingStage('complete')
    }
  }, [analytics, loadingStage])

  // Mutations - Using Resend native APIs
  const createTemplateMutation = api.emailManagement.createEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template created successfully!')
      setIsCreateTemplateDialogOpen(false)
      refetchTemplates()
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`)
    }
  })

  const createAudienceMutation = api.resendEmail.createAudience.useMutation({
    onSuccess: () => {
      toast.success('Audience created successfully!')
      setIsCreateAudienceDialogOpen(false)
      refetchAudiences()
    },
    onError: (error) => {
      toast.error(`Failed to create audience: ${error.message}`)
    }
  })

  const createBroadcastMutation = api.resendEmail.createBroadcast.useMutation({
    onSuccess: () => {
      toast.success('Broadcast created successfully!')
      setIsCreateCampaignDialogOpen(false)
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(`Failed to create broadcast: ${error.message}`)
    }
  })

  const syncUsersMutation = api.resendEmail.syncUsersToAudience.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully synced ${data.synced} users to audience!`)
      refetchAudiences()
    },
    onError: (error) => {
      toast.error(`Failed to sync users: ${error.message}`)
    }
  })

  const sendBroadcastMutation = api.resendEmail.sendBroadcast.useMutation({
    onSuccess: () => {
      toast.success('Broadcast sent successfully!')
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(`Failed to send broadcast: ${error.message}`)
    }
  })

  const updateBroadcastMutation = api.resendEmail.updateBroadcast.useMutation({
    onSuccess: () => {
      toast.success('Broadcast updated successfully!')
      setIsEditBroadcastDialogOpen(false)
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(`Failed to update broadcast: ${error.message}`)
    }
  })

  const deleteBroadcastMutation = api.resendEmail.deleteBroadcast.useMutation({
    onSuccess: () => {
      toast.success('Broadcast deleted successfully!')
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(`Failed to delete broadcast: ${error.message}`)
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
    if (confirm('Are you sure you want to delete this broadcast? This action cannot be undone.')) {
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
      return <CheckCircle className='h-5 w-5 text-green-500' />
    } else if (isActive) {
      return <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
    } else {
      return <Clock className='h-5 w-5 text-gray-400' />
    }
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='from-foreground to-foreground/70 flex items-center gap-3 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent'>
            <div className='rounded-xl bg-purple-500/10 p-2.5'>
              <Mail className='h-8 w-8 text-purple-600 dark:text-purple-400' />
            </div>
            Email Marketing
          </h1>
          <p className='text-muted-foreground text-base'>
            Manage your email campaigns, audiences, and templates
          </p>
        </div>
      </div>

      {/* Sequential Loading Progress */}
      {loadingStage !== 'complete' && (
        <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Loader2 className='h-5 w-5 animate-spin text-purple-600 dark:text-purple-400' />
              Loading Email Marketing Data...
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
                  Loading Audiences...
                </span>
              </div>
              <div className='flex items-center gap-3'>
                {renderLoadingIndicator(
                  'broadcasts',
                  loadingStage === 'broadcasts',
                  loadingStage !== 'broadcasts' && broadcasts !== undefined
                )}
                <span className={loadingStage === 'broadcasts' ? 'font-medium' : ''}>
                  Loading Broadcasts...
                </span>
              </div>
              <div className='flex items-center gap-3'>
                {renderLoadingIndicator(
                  'templates',
                  loadingStage === 'templates',
                  loadingStage !== 'templates' && templates !== undefined
                )}
                <span className={loadingStage === 'templates' ? 'font-medium' : ''}>
                  Loading Templates...
                </span>
              </div>
              <div className='flex items-center gap-3'>
                {renderLoadingIndicator(
                  'analytics',
                  loadingStage === 'analytics',
                  analytics !== undefined
                )}
                <span className={loadingStage === 'analytics' ? 'font-medium' : ''}>
                  Loading Analytics...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='audiences'>Audiences</TabsTrigger>
          <TabsTrigger value='broadcasts'>Broadcasts</TabsTrigger>
          <TabsTrigger value='templates'>Templates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='border-border/50 from-background to-background/50 bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground text-sm font-semibold'>
                  Total Audiences
                </CardTitle>
                <div className='rounded-lg bg-purple-500/10 p-2'>
                  <Users className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-3xl font-bold tracking-tight'>
                  {analytics?.totalAudiences || 0}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  Active audience segments
                </p>
              </CardContent>
            </Card>
            <Card className='border-border/50 from-background to-background/50 bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground text-sm font-semibold'>
                  Total Broadcasts
                </CardTitle>
                <div className='rounded-lg bg-purple-500/10 p-2'>
                  <Mail className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-3xl font-bold tracking-tight'>
                  {analytics?.totalBroadcasts || 0}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  Email campaigns created
                </p>
              </CardContent>
            </Card>
            <Card className='border-border/50 from-background to-background/50 bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground text-sm font-semibold'>
                  Subscribers
                </CardTitle>
                <div className='rounded-lg bg-purple-500/10 p-2'>
                  <TrendingUp className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-3xl font-bold tracking-tight'>
                  {analytics?.totalSubscribers || 0}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  {analytics?.subscriptionRate || 0}% subscription rate
                </p>
              </CardContent>
            </Card>
            <Card className='border-border/50 from-background to-background/50 bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                <CardTitle className='text-muted-foreground text-sm font-semibold'>
                  Sent Broadcasts
                </CardTitle>
                <div className='rounded-lg bg-purple-500/10 p-2'>
                  <Send className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-3xl font-bold tracking-tight'>
                  {analytics?.broadcasts?.sent || 0}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  Successfully delivered
                </p>
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm'>
              <CardHeader>
                <div className='mb-1 flex items-center gap-2'>
                  <div className='rounded-lg bg-purple-500/10 p-2'>
                    <Clock className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                  </div>
                  <CardTitle className='text-base'>Recent Activity</CardTitle>
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
                          {new Date(broadcast.sent_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || <p className='text-muted-foreground text-sm'>No recent activity</p>}
                </div>
              </CardContent>
            </Card>

            <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm'>
              <CardHeader>
                <div className='mb-1 flex items-center gap-2'>
                  <div className='rounded-lg bg-purple-500/10 p-2'>
                    <Send className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                  </div>
                  <CardTitle className='text-base'>Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  onClick={() => setIsCreateCampaignDialogOpen(true)}
                  className='w-full bg-purple-600 hover:bg-purple-700'
                  disabled={!audiences?.audiences?.length}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Create New Broadcast
                </Button>
                <Button
                  onClick={() => setIsCreateAudienceDialogOpen(true)}
                  variant='outline'
                  className='w-full'
                >
                  <Users className='mr-2 h-4 w-4' />
                  Create New Audience
                </Button>
                <Button
                  onClick={() => setIsCreateTemplateDialogOpen(true)}
                  variant='outline'
                  className='w-full'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  Create New Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audiences Tab */}
        <TabsContent value='audiences' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Audiences</h2>
            <Dialog open={isCreateAudienceDialogOpen} onOpenChange={setIsCreateAudienceDialogOpen}>
              <DialogTrigger asChild>
                <Button className='bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Audience
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Audience</DialogTitle>
                  <DialogDescription>
                    Create a new audience segment for your email campaigns
                  </DialogDescription>
                </DialogHeader>

                <form action={handleCreateAudience}>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='name'>Audience Name</Label>
                      <Input
                        id='name'
                        name='name'
                        placeholder='e.g., Newsletter Subscribers'
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
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      className='bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'
                    >
                      Create Audience
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {audiences?.audiences?.map((audience) => (
              <Card
                key={audience.id}
                className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm transition-all duration-200 hover:shadow-md'
              >
                <CardHeader>
                  <CardTitle className='flex items-center justify-between text-base'>
                    <span className='font-semibold'>{audience.name}</span>
                    <Badge variant='secondary' className='text-xs'>
                      0 subscribers
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p className='text-muted-foreground text-sm'>
                      Created: {new Date().toLocaleDateString()}
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
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Users className='mr-2 h-4 w-4' />
                          Sync Users
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className='text-muted-foreground col-span-full py-8 text-center'>
                <Users className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No audiences yet. Create your first audience to get started!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value='broadcasts' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Broadcasts</h2>
            <div className='flex items-center gap-4'>
              <Select value={broadcastFilter} onValueChange={setBroadcastFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Filter by status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Broadcasts</SelectItem>
                  <SelectItem value='draft'>Draft</SelectItem>
                  <SelectItem value='sent'>Sent</SelectItem>
                  <SelectItem value='scheduled'>Scheduled</SelectItem>
                  <SelectItem value='sending'>Sending</SelectItem>
                </SelectContent>
              </Select>

              <Dialog
                open={isCreateCampaignDialogOpen}
                onOpenChange={setIsCreateCampaignDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className='bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'
                    disabled={!audiences?.audiences?.length}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Create Broadcast
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <DialogHeader>
                    <DialogTitle>Create New Broadcast</DialogTitle>
                    <DialogDescription>Create a new email broadcast campaign</DialogDescription>
                  </DialogHeader>

                  <form action={handleCreateBroadcast}>
                    <div className='space-y-4'>
                      <div>
                        <Label htmlFor='name'>Broadcast Name</Label>
                        <Input
                          id='name'
                          name='name'
                          defaultValue={selectedBroadcast?.name || ''}
                          placeholder='Internal name for this broadcast'
                          className='h-11 min-h-[44px] px-3 py-2 text-sm sm:text-base'
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor='audienceId'>Target Audience</Label>
                        <Select
                          name='audienceId'
                          defaultValue={selectedBroadcast?.audienceId || ''}
                          required
                        >
                          <SelectTrigger className='h-11 min-h-[44px] px-3 py-2 text-sm sm:text-base'>
                            <SelectValue placeholder='Select an audience' />
                          </SelectTrigger>
                          <SelectContent>
                            {audiences?.audiences?.map((audience) => (
                              <SelectItem key={audience.id} value={audience.id}>
                                {audience.name} (0 subscribers)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor='from'>From Email</Label>
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
                        <Label htmlFor='subject'>Subject Line</Label>
                        <Input
                          id='subject'
                          name='subject'
                          defaultValue={selectedBroadcast?.subject || ''}
                          placeholder='Email subject'
                          className='h-11 min-h-[44px] px-3 py-2 text-sm sm:text-base'
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor='html'>Email Content (HTML)</Label>
                        <Textarea
                          id='html'
                          name='html'
                          defaultValue={selectedBroadcast?.html || ''}
                          placeholder='Email HTML content'
                          className='min-h-[120px] px-3 py-2 text-sm sm:text-base'
                          rows={8}
                        />
                      </div>

                      <div>
                        <Label htmlFor='text'>Plain Text Version (Optional)</Label>
                        <Textarea
                          id='text'
                          name='text'
                          defaultValue={selectedBroadcast?.text || ''}
                          placeholder='Plain text version'
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
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        className='min-h-[44px] bg-purple-600 text-sm hover:bg-purple-700 sm:text-base dark:bg-purple-700 dark:hover:bg-purple-600'
                      >
                        Create Broadcast
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className='border-border/50 from-background to-background/80 bg-gradient-to-br backdrop-blur-sm'>
            <CardContent className='p-0'>
              <ScrollArea className='h-[500px]'>
                <div className='space-y-4 p-4'>
                  {filteredBroadcasts.map((broadcast) => (
                    <Card
                      key={broadcast.id}
                      className='border-2 transition-all duration-200 hover:shadow-md'
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
                                {new Date(broadcast.sent_at || Date.now()).toLocaleDateString()}
                              </span>
                              <span className='flex items-center gap-1'>
                                <Users className='h-3 w-3' />
                                Audience
                              </span>
                              {broadcast.status === 'sent' && (
                                <span className='flex items-center gap-1'>
                                  <Send className='h-3 w-3' />
                                  Sent
                                </span>
                              )}
                            </div>
                          </div>

                          <div className='ml-4 flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleViewBroadcast(broadcast)}
                              className='border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>

                            {broadcast.status === 'draft' && (
                              <>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleEditBroadcast(broadcast)}
                                  className='border-green-300 text-green-600 hover:border-green-400 hover:text-green-700'
                                >
                                  <Edit3 className='h-4 w-4' />
                                </Button>

                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleSendBroadcast(broadcast.id)}
                                  className='border-purple-300 text-purple-600 hover:border-purple-400 hover:text-purple-700'
                                >
                                  <Send className='h-4 w-4' />
                                </Button>
                              </>
                            )}

                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleDuplicateBroadcast(broadcast)}
                              className='border-orange-300 text-orange-600 hover:border-orange-400 hover:text-orange-700'
                            >
                              <Copy className='h-4 w-4' />
                            </Button>

                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleDeleteBroadcast(broadcast.id)}
                              className='border-red-300 text-red-600 hover:border-red-400 hover:text-red-700'
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
                      <p>No broadcasts match the current filter.</p>
                      <Button
                        variant='outline'
                        onClick={() => setBroadcastFilter('all')}
                        className='mt-2'
                      >
                        Show All Broadcasts
                      </Button>
                    </div>
                  ) : broadcasts?.broadcasts?.length ? null : (
                    <div className='text-muted-foreground py-8 text-center'>
                      <Mail className='mx-auto mb-4 h-12 w-12 opacity-50' />
                      <p>No broadcasts yet. Create your first broadcast to get started!</p>
                      <p className='mt-2 text-sm'>
                        You'll need to create an audience first before creating broadcasts.
                      </p>
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
            <h2 className='text-2xl font-bold'>Email Templates</h2>
            <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button className='bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>Create a reusable email template</DialogDescription>
                </DialogHeader>

                <form action={handleCreateTemplate}>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='template-name'>Template Name</Label>
                      <Input
                        id='template-name'
                        name='name'
                        placeholder='e.g., Welcome Email'
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='template-subject'>Subject Line</Label>
                      <Input
                        id='template-subject'
                        name='subject'
                        placeholder='Email subject'
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='template-html'>Email Content (HTML)</Label>
                      <Textarea
                        id='template-html'
                        name='html'
                        placeholder='Email HTML content'
                        rows={8}
                      />
                    </div>

                    <div>
                      <Label htmlFor='template-text'>Plain Text Version (Optional)</Label>
                      <Textarea
                        id='template-text'
                        name='text'
                        placeholder='Plain text version'
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
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      className='bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'
                    >
                      Create Template
                    </Button>
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
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm'>
                        <Edit3 className='mr-1 h-4 w-4' />
                        Edit
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Copy className='mr-1 h-4 w-4' />
                        Use
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className='text-muted-foreground col-span-full py-8 text-center'>
                <FileText className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No templates yet. Create your first template to get started!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Broadcast Dialog */}
      <Dialog open={isViewBroadcastDialogOpen} onOpenChange={setIsViewBroadcastDialogOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Broadcast Details</DialogTitle>
            <DialogDescription>View broadcast information and content</DialogDescription>
          </DialogHeader>

          {selectedBroadcastData && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>Name</Label>
                  <p className='text-sm'>{selectedBroadcastData?.broadcast?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Status</Label>
                  <Badge
                    className={getBroadcastStatusColor(
                      selectedBroadcastData?.broadcast?.status || 'draft'
                    )}
                  >
                    {selectedBroadcastData?.broadcast?.status || 'draft'}
                  </Badge>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Subject</Label>
                  <p className='text-sm'>{selectedBroadcastData?.broadcast?.subject || 'N/A'}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>From</Label>
                  <p className='text-sm'>{selectedBroadcastData?.broadcast?.from || 'N/A'}</p>
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium'>HTML Content</Label>
                <div className='bg-muted mt-2 max-h-64 overflow-y-auto rounded-lg p-4'>
                  <pre className='whitespace-pre-wrap text-xs'>
                    {selectedBroadcastData?.broadcast?.html || 'No content'}
                  </pre>
                </div>
              </div>

              {selectedBroadcastData?.broadcast?.text && (
                <div>
                  <Label className='text-sm font-medium'>Plain Text Content</Label>
                  <div className='bg-muted mt-2 max-h-64 overflow-y-auto rounded-lg p-4'>
                    <pre className='whitespace-pre-wrap text-xs'>
                      {selectedBroadcastData.broadcast.text}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsViewBroadcastDialogOpen(false)}>
              Close
            </Button>
            {selectedBroadcast?.status === 'draft' && (
              <Button
                onClick={() => {
                  setIsViewBroadcastDialogOpen(false)
                  handleEditBroadcast(selectedBroadcast)
                }}
                className='bg-green-600 hover:bg-green-700'
              >
                <Edit3 className='mr-2 h-4 w-4' />
                Edit Broadcast
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Broadcast Dialog */}
      <Dialog open={isEditBroadcastDialogOpen} onOpenChange={setIsEditBroadcastDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Broadcast</DialogTitle>
            <DialogDescription>Update broadcast content and settings</DialogDescription>
          </DialogHeader>

          <form action={handleUpdateBroadcast}>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='edit-subject'>Subject Line</Label>
                <Input
                  id='edit-subject'
                  name='subject'
                  defaultValue={selectedBroadcast?.subject || ''}
                  placeholder='Email subject'
                  required
                />
              </div>

              <div>
                <Label htmlFor='edit-html'>Email Content (HTML)</Label>
                <Textarea
                  id='edit-html'
                  name='html'
                  defaultValue={selectedBroadcast?.html || ''}
                  placeholder='Email HTML content'
                  rows={12}
                />
              </div>

              <div>
                <Label htmlFor='edit-text'>Plain Text Version (Optional)</Label>
                <Textarea
                  id='edit-text'
                  name='text'
                  defaultValue={selectedBroadcast?.text || ''}
                  placeholder='Plain text version'
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
                Cancel
              </Button>
              <Button
                type='submit'
                className='bg-green-600 hover:bg-green-700'
                disabled={updateBroadcastMutation.isPending}
              >
                {updateBroadcastMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit3 className='mr-2 h-4 w-4' />
                    Update Broadcast
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
