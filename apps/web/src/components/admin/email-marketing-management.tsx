'use client'

import { useState, useEffect } from 'react'
import { Button } from '@tszhong0411/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Badge } from '@tszhong0411/ui'
import { Input } from '@tszhong0411/ui'
import { Label } from '@tszhong0411/ui'
import { Textarea } from '@tszhong0411/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@tszhong0411/ui'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@tszhong0411/ui'
import { ScrollArea } from '@tszhong0411/ui'
import { 
  Mail, 
  Plus, 
  Send, 
  Users, 
  BarChart3,
  FileText,
  Calendar,
  TrendingUp,
  Eye,
  MousePointer
} from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

// Helper function for broadcast status colors
const getBroadcastStatusColor = (status: string) => {
  switch (status) {
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
  
  // Sequential loading states
  const [loadingStage, setLoadingStage] = useState<'audiences' | 'broadcasts' | 'templates' | 'analytics' | 'complete'>('audiences')
  const [enableAudiences, setEnableAudiences] = useState(true)
  const [enableBroadcasts, setEnableBroadcasts] = useState(false)
  const [enableTemplates, setEnableTemplates] = useState(false)
  const [enableAnalytics, setEnableAnalytics] = useState(false)

  // Queries with conditional enabling for sequential loading
  const { data: audiences, isLoading: audiencesLoading, refetch: refetchAudiences } = api.resendEmail.getAudiences.useQuery(undefined, {
    enabled: enableAudiences
  })
  const { data: broadcasts, isLoading: broadcastsLoading, refetch: refetchBroadcasts } = api.resendEmail.getBroadcasts.useQuery(undefined, {
    enabled: enableBroadcasts
  })
  const { data: templates, isLoading: templatesLoading, refetch: refetchTemplates } = api.emailManagement.getEmailTemplates.useQuery({}, {
    enabled: enableTemplates
  })
  const { data: analytics } = api.resendEmail.getAnalytics.useQuery(undefined, {
    enabled: enableAnalytics
  })

  // Sequential loading effect - simpler approach
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const startSequentialLoading = async () => {
      // Stage 1: Audiences (immediate)
      setLoadingStage('audiences')
      setEnableAudiences(true)
    }

    startSequentialLoading()
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
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
  }, [audiencesLoading, audiences, loadingStage])

  useEffect(() => {
    if (!broadcastsLoading && broadcasts !== undefined && loadingStage === 'broadcasts') {
      const timeoutId = setTimeout(() => {
        setLoadingStage('templates')
        setEnableTemplates(true)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [broadcastsLoading, broadcasts, loadingStage])

  useEffect(() => {
    if (!templatesLoading && templates !== undefined && loadingStage === 'templates') {
      const timeoutId = setTimeout(() => {
        setLoadingStage('analytics')
        setEnableAnalytics(true)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [templatesLoading, templates, loadingStage])

  useEffect(() => {
    if (analytics !== undefined && loadingStage === 'analytics') {
      setLoadingStage('complete')
    }
  }, [analytics, loadingStage])

  // Debug logging
  console.log('🔍 Email Marketing Data:', {
    audiences: audiences,
    broadcasts: broadcasts,
    analytics: analytics,
    audiencesCount: audiences?.audiences?.length || 0,
    broadcastsCount: broadcasts?.broadcasts?.length || 0
  })

  // Mutations - Using Resend native APIs
  const createTemplateMutation = api.emailManagement.createEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success('Email template created successfully')
      setIsCreateTemplateDialogOpen(false)
      refetchTemplates()
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`)
    }
  })

  const createAudienceMutation = api.resendEmail.createAudience.useMutation({
    onSuccess: () => {
      toast.success('Audience created successfully')
      refetchAudiences()
    },
    onError: (error) => {
      toast.error(`Failed to create audience: ${error.message}`)
    }
  })

  const createBroadcastMutation = api.resendEmail.createBroadcast.useMutation({
    onSuccess: () => {
      toast.success('Broadcast created successfully')
      setIsCreateCampaignDialogOpen(false)
      refetchBroadcasts()
    },
    onError: (error) => {
      toast.error(`Failed to create broadcast: ${error.message}`)
    }
  })

  const syncUsersMutation = api.resendEmail.syncUsersToAudience.useMutation({
    onSuccess: (data) => {
      toast.success(`Synced ${data.syncedCount} users successfully`)
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

  const handleCreateTemplate = (formData: FormData) => {
    const name = formData.get('name') as string
    const subject = formData.get('subject') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any

    if (!name || !subject || !content) {
      toast.error('All fields are required')
      return
    }

    createTemplateMutation.mutate({
      name,
      subject,
      content,
      type
    })
  }

  const handleCreateAudience = (formData: FormData) => {
    const name = formData.get('audienceName') as string

    if (!name) {
      toast.error('Audience name is required')
      return
    }

    createAudienceMutation.mutate({ name })
  }

  const handleCreateBroadcast = (formData: FormData) => {
    const name = formData.get('broadcastName') as string
    const subject = formData.get('subject') as string
    const content = formData.get('content') as string
    const audienceId = formData.get('audienceId') as string

    if (!name || !subject || !content || !audienceId) {
      toast.error('All fields are required')
      return
    }

    createBroadcastMutation.mutate({
      name,
      subject,
      content,
      audienceId
    })
  }

  const handleSyncUsers = (audienceId: string) => {
    syncUsersMutation.mutate({ audienceId })
  }

  const handleSendBroadcast = (broadcastId: string) => {
    sendBroadcastMutation.mutate({ broadcastId })
  }

  const getBroadcastStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'sending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Helper function to render loading indicator for each stage
  const renderLoadingIndicator = (stage: string, isActive: boolean, isComplete: boolean) => {
    if (isComplete) {
      return <span className="text-green-600">✓</span>
    }
    if (isActive) {
      return <span className="animate-spin">⏳</span>
    }
    return <span className="text-gray-400">⏸</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            Email Marketing
          </h1>
          <p className="text-muted-foreground">Manage email campaigns, templates, and analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Loading Status Indicator */}
          {loadingStage !== 'complete' && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Loading Email Marketing Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    {renderLoadingIndicator('audiences', loadingStage === 'audiences', audiences !== undefined)}
                    <span className={loadingStage === 'audiences' ? 'text-blue-600 font-medium' : audiences !== undefined ? 'text-green-600' : 'text-gray-500'}>
                      Loading audiences...
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderLoadingIndicator('broadcasts', loadingStage === 'broadcasts', broadcasts !== undefined)}
                    <span className={loadingStage === 'broadcasts' ? 'text-blue-600 font-medium' : broadcasts !== undefined ? 'text-green-600' : 'text-gray-500'}>
                      Loading broadcasts...
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderLoadingIndicator('templates', loadingStage === 'templates', templates !== undefined)}
                    <span className={loadingStage === 'templates' ? 'text-blue-600 font-medium' : templates !== undefined ? 'text-green-600' : 'text-gray-500'}>
                      Loading templates...
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderLoadingIndicator('analytics', loadingStage === 'analytics', analytics !== undefined)}
                    <span className={loadingStage === 'analytics' ? 'text-blue-600 font-medium' : analytics !== undefined ? 'text-green-600' : 'text-gray-500'}>
                      Loading analytics...
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Loading data sequentially to prevent API rate limiting (1 second between requests)
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Analytics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Audiences</CardTitle>
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics?.totalAudiences || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Subscriber audiences</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                  <Send className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics?.totalBroadcasts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Broadcasts sent</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics?.totalSubscribers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total subscribers</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscription Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics?.subscriptionRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">User subscription rate</p>
                </CardContent>
              </Card>
            </div>

          {/* Recent Campaign Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Recent email campaign statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {analytics?.campaignStats?.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.sentCount} sent • {campaign.failedCount} failed
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getCampaignStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {campaign.successRate.toFixed(1)}% success
                        </p>
                      </div>
                    </div>
                  ))}
                  {!analytics?.campaignStats?.length && (
                    <p className="text-center text-muted-foreground py-4">No campaigns yet</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Email Campaigns</h2>
            <Dialog open={isCreateCampaignDialogOpen} onOpenChange={setIsCreateCampaignDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Campaign</DialogTitle>
                  <DialogDescription>
                    Create a new email campaign to send to your subscribers.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateBroadcast}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input id="campaign-name" name="name" placeholder="Campaign name" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="templateId">Email Template</Label>
                      <Select name="templateId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates?.templates?.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="recipients">Recipients</Label>
                      <Textarea 
                        id="recipients" 
                        name="recipients" 
                        placeholder="Enter email addresses separated by commas" 
                        rows={4} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsCreateCampaignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                      Create Campaign
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 p-4">
                  {broadcasts?.broadcasts?.map((broadcast) => (
                    <Card key={broadcast.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{broadcast.name}</h3>
                              <Badge className={getBroadcastStatusColor(broadcast.status)}>
                                {broadcast.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(broadcast.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {broadcast.audience?.name || 'No audience'}
                              </span>
                              {broadcast.status === 'sent' && (
                                <span className="flex items-center gap-1">
                                  <Send className="h-3 w-3" />
                                  Sent
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {broadcast.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendBroadcast(broadcast.id)}
                                className="text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {!broadcasts?.broadcasts?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No campaigns yet. Create your first campaign to get started!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audiences Tab */}
        <TabsContent value="audiences" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Audiences</h2>
            <Dialog open={isCreateAudienceDialogOpen} onOpenChange={setIsCreateAudienceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Audience
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Audience</DialogTitle>
                  <DialogDescription>
                    Create a new audience to organize your subscribers.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateAudience}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="audience-name">Audience Name</Label>
                      <Input id="audience-name" name="name" placeholder="e.g., Newsletter Subscribers" required />
                    </div>
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsCreateAudienceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                      Create Audience
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 p-4">
                  {audiences?.audiences && audiences.audiences.length > 0 ? (
                    audiences.audiences.map((audience) => (
                    <Card key={audience.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <h3 className="font-semibold">{audience.name}</h3>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created {new Date(audience.created_at || Date.now()).toLocaleDateString()}
                              </span>
                              <span>ID: {audience.id}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSyncUsers(audience.id)}
                              className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Sync Users
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No audiences yet. Create your first audience to get started!</p>
                      <p className="text-sm mt-2">Audiences help you organize your subscribers for targeted campaigns.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Broadcasts</h2>
            <Dialog open={isCreateCampaignDialogOpen} onOpenChange={setIsCreateCampaignDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Broadcast
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Broadcast</DialogTitle>
                  <DialogDescription>
                    Create a new email broadcast to send to your audience.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateBroadcast}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="broadcast-name">Broadcast Name</Label>
                      <Input id="broadcast-name" name="name" placeholder="Broadcast name" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="audience">Audience</Label>
                      <Select name="audienceId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {audiences?.audiences?.map((audience) => (
                            <SelectItem key={audience.id} value={audience.id}>
                              {audience.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="from">From Email</Label>
                      <Input id="from" name="from" type="email" placeholder="noreply@yourdomain.com" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject Line</Label>
                      <Input id="subject" name="subject" placeholder="Email subject" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="html">Email Content (HTML)</Label>
                      <Textarea id="html" name="html" placeholder="Email HTML content" rows={8} />
                    </div>
                    
                    <div>
                      <Label htmlFor="text">Plain Text Version (Optional)</Label>
                      <Textarea id="text" name="text" placeholder="Plain text version" rows={4} />
                    </div>
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsCreateCampaignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                      Create Broadcast
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 p-4">
                  {broadcasts?.broadcasts?.map((broadcast) => (
                    <Card key={broadcast.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{broadcast.name}</h3>
                              <Badge className={getBroadcastStatusColor(broadcast.status)}>
                                {broadcast.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(broadcast.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {broadcast.audience?.name || 'No audience'}
                              </span>
                              {broadcast.status === 'sent' && (
                                <span className="flex items-center gap-1">
                                  <Send className="h-3 w-3" />
                                  Sent
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {broadcast.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendBroadcast(broadcast.id)}
                                className="text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {!broadcasts?.broadcasts?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No broadcasts yet. Create your first broadcast to get started!</p>
                      <p className="text-sm mt-2">You'll need to create an audience first before creating broadcasts.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Email Templates</h2>
            <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable email template for your campaigns.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateTemplate}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input id="template-name" name="name" placeholder="Template name" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject Line</Label>
                      <Input id="subject" name="subject" placeholder="Email subject" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Template Type</Label>
                      <Select name="type" defaultValue="marketing">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Email Content (HTML)</Label>
                      <Textarea id="content" name="content" placeholder="Email HTML content" rows={8} required />
                    </div>
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsCreateTemplateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                      Create Template
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 p-4">
                  {templates?.templates?.map((template) => (
                    <Card key={template.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <h3 className="font-semibold">{template.name}</h3>
                              <Badge variant="outline">{template.type}</Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(template.createdAt).toLocaleDateString()}
                              </span>
                              <span>
                                {template.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {!templates?.templates?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No templates yet. Create your first template to get started!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
