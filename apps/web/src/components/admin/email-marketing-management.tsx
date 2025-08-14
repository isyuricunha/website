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

export default function EmailMarketingManagement() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false)
  const [isCreateCampaignDialogOpen, setIsCreateCampaignDialogOpen] = useState(false)

  // Queries
  const { data: templates, isLoading: templatesLoading, refetch: refetchTemplates } = api.emailManagement.getEmailTemplates.useQuery({})
  const { data: campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = api.emailManagement.getEmailCampaigns.useQuery({})
  const { data: analytics } = api.emailManagement.getEmailAnalytics.useQuery({})

  // Mutations
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

  const createCampaignMutation = api.emailManagement.createEmailCampaign.useMutation({
    onSuccess: () => {
      toast.success('Email campaign created successfully')
      setIsCreateCampaignDialogOpen(false)
      refetchCampaigns()
    },
    onError: (error) => {
      toast.error(`Failed to create campaign: ${error.message}`)
    }
  })

  const sendCampaignMutation = api.emailManagement.sendEmailCampaign.useMutation({
    onSuccess: (data) => {
      toast.success(`Campaign sent! ${data.successCount} emails sent successfully`)
      refetchCampaigns()
    },
    onError: (error) => {
      toast.error(`Failed to send campaign: ${error.message}`)
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

  const handleCreateCampaign = (formData: FormData) => {
    const name = formData.get('name') as string
    const templateId = formData.get('templateId') as string
    const recipients = (formData.get('recipients') as string).split(',').map(email => email.trim()).filter(Boolean)

    if (!name || !templateId || recipients.length === 0) {
      toast.error('Name, template, and recipients are required')
      return
    }

    createCampaignMutation.mutate({
      name,
      templateId,
      recipientList: recipients
    })
  }

  const handleSendCampaign = (campaignId: string) => {
    sendCampaignMutation.mutate({ campaignId })
  }

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'sending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (templatesLoading || campaignsLoading) {
    return <div className="p-6">Loading email marketing dashboard...</div>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          {analytics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                  <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.totalCampaigns}
                  </div>
                  <p className="text-xs text-muted-foreground">Email campaigns created</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                  <Send className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.totalEmailsSent}
                  </div>
                  <p className="text-xs text-muted-foreground">Successfully delivered</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.averageSuccessRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Delivery success rate</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed Emails</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.totalEmailsFailed}
                  </div>
                  <p className="text-xs text-muted-foreground">Delivery failures</p>
                </CardContent>
              </Card>
            </div>
          )}

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
                <form action={handleCreateCampaign}>
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
                  {campaigns?.campaigns?.map((campaign) => (
                    <Card key={campaign.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{campaign.name}</h3>
                              <Badge className={getCampaignStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(campaign.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {campaign.recipients?.length || 0} recipients
                              </span>
                              {campaign.sentCount && (
                                <span className="flex items-center gap-1">
                                  <Send className="h-3 w-3" />
                                  {campaign.sentCount} sent
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {campaign.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendCampaign(campaign.id)}
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
                  
                  {!campaigns?.campaigns?.length && (
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
