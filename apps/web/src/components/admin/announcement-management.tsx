'use client'

import { useState } from 'react'
import { Button } from '@tszhong0411/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Badge } from '@tszhong0411/ui'
import { Input } from '@tszhong0411/ui'
import { Label } from '@tszhong0411/ui'
import { Textarea } from '@tszhong0411/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@tszhong0411/ui'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@tszhong0411/ui'
import { Switch } from '@tszhong0411/ui'
import { ScrollArea } from '@tszhong0411/ui'
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@tszhong0411/utils'

import { api } from '@/trpc/react'

interface EditAnnouncementData {
  id: string
  title: string
  content: string
  type: string
  priority: number
  isDismissible: boolean
  isActive: boolean
  targetAudience?: any
}

export default function AnnouncementManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<EditAnnouncementData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Queries
  const { data: announcements, isLoading, refetch } = api.announcements.getAnnouncements.useQuery({
    adminView: true
  })

  const { data: analytics } = api.announcements.getAnnouncementAnalytics.useQuery({})

  // Mutations
  const createMutation = api.announcements.createAnnouncement.useMutation({
    onSuccess: () => {
      toast.success('Announcement created successfully')
      setIsCreateDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to create announcement: ${error.message}`)
    }
  })

  const updateMutation = api.announcements.updateAnnouncement.useMutation({
    onSuccess: () => {
      toast.success('Announcement updated successfully')
      setIsEditDialogOpen(false)
      setEditingAnnouncement(null)
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to update announcement: ${error.message}`)
    }
  })

  const deleteMutation = api.announcements.deleteAnnouncement.useMutation({
    onSuccess: () => {
      toast.success('Announcement deleted successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to delete announcement: ${error.message}`)
    }
  })

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800'
      case 'success': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    if (priority >= 3) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    if (priority >= 1) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const handleCreateAnnouncement = (formData: FormData) => {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any
    const priority = parseInt(formData.get('priority') as string) || 0
    const isDismissible = formData.get('isDismissible') === 'on'

    if (!title || !content) {
      toast.error('Title and content are required')
      return
    }

    createMutation.mutate({
      title,
      content,
      type,
      priority,
      isDismissible
    })
  }

  const handleEditAnnouncement = (formData: FormData) => {
    if (!editingAnnouncement) return

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any
    const priority = parseInt(formData.get('priority') as string) || 0
    const isDismissible = formData.get('isDismissible') === 'on'
    const isActive = formData.get('isActive') === 'on'

    if (!title || !content) {
      toast.error('Title and content are required')
      return
    }

    updateMutation.mutate({
      id: editingAnnouncement.id,
      title,
      content,
      type,
      priority,
      isDismissible,
      isActive
    })
  }

  const handleToggleActive = (announcement: any) => {
    updateMutation.mutate({
      id: announcement.id,
      isActive: !announcement.isActive
    })
  }

  const handleDeleteAnnouncement = (id: string) => {
    deleteMutation.mutate({ id })
  }

  const openEditDialog = (announcement: any) => {
    setEditingAnnouncement({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      isDismissible: announcement.isDismissible,
      isActive: announcement.isActive,
      targetAudience: announcement.targetAudience
    })
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return <div className="p-6">Loading announcements...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <span className="truncate">Announcements</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">Manage site-wide announcements and notifications</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 min-h-[44px] px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Create Announcement</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create a new site-wide announcement that will be visible to users.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateAnnouncement}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="Announcement title" required />
                </div>
                
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" name="content" placeholder="Announcement content" rows={4} required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" defaultValue="info">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority (0-10)</Label>
                    <Input id="priority" name="priority" type="number" min="0" max="10" defaultValue="0" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isDismissible" name="isDismissible" defaultChecked className="rounded" />
                  <Label htmlFor="isDismissible">Allow users to dismiss this announcement</Label>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600">
                  Create Announcement
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.totalViews}</div>
              <p className="text-xs text-muted-foreground">Across all announcements</p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dismissal Rate</CardTitle>
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.dismissalRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{analytics.totalDismissals} total dismissals</p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {announcements?.announcements?.filter(a => a.isActive).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently visible to users</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Announcements List */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">All Announcements</CardTitle>
          <CardDescription className="text-sm sm:text-base">Manage your site announcements</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px]">
            <div className="space-y-3 sm:space-y-4">
              {announcements?.announcements?.map((announcement) => (
                <Card key={announcement.id} className={`${getAnnouncementTypeColor(announcement.type)} border-2`}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {getAnnouncementIcon(announcement.type)}
                            <h3 className="font-semibold truncate">{announcement.title}</h3>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge className={getPriorityColor(announcement.priority)} size="sm">
                              Priority {announcement.priority}
                            </Badge>
                            {!announcement.isActive && (
                              <Badge variant="secondary" size="sm">Inactive</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3 line-clamp-2">{announcement.content}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                          {announcement.targetAudience && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Targeted
                            </span>
                          )}
                          <span>
                            {announcement.isDismissible ? 'Dismissible' : 'Non-dismissible'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:ml-4">
                        {/* Toggle Active/Inactive */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(announcement)}
                          className={cn(
                            "min-h-[36px] px-2 sm:px-3 text-xs sm:text-sm",
                            announcement.isActive 
                              ? "text-emerald-600 hover:text-emerald-800 border-emerald-300 hover:border-emerald-400" 
                              : "text-slate-600 hover:text-slate-900 border-slate-300 hover:border-slate-400"
                          )}
                        >
                          {announcement.isActive ? (
                            <>
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Inactive</span>
                            </>
                          )}
                        </Button>
                        
                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(announcement)}
                          className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 min-h-[36px] px-2 sm:px-3"
                          aria-label="Edit announcement"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        
                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 min-h-[36px] px-2 sm:px-3"
                              aria-label="Delete announcement"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{announcement.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!announcements?.announcements?.length && (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <Megaphone className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base px-4">No announcements yet. Create your first announcement to get started!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update the announcement details.
            </DialogDescription>
          </DialogHeader>
          {editingAnnouncement && (
            <form action={handleEditAnnouncement}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    defaultValue={editingAnnouncement.title}
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea 
                    id="edit-content" 
                    name="content" 
                    defaultValue={editingAnnouncement.content}
                    rows={4} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">Type</Label>
                    <Select name="type" defaultValue={editingAnnouncement.type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-priority">Priority (0-10)</Label>
                    <Input 
                      id="edit-priority" 
                      name="priority" 
                      type="number" 
                      min="0" 
                      max="10" 
                      defaultValue={editingAnnouncement.priority}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="edit-isDismissible" 
                      name="isDismissible" 
                      defaultChecked={editingAnnouncement.isDismissible}
                      className="rounded" 
                    />
                    <Label htmlFor="edit-isDismissible">Allow users to dismiss this announcement</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="edit-isActive" 
                      name="isActive" 
                      defaultChecked={editingAnnouncement.isActive}
                      className="rounded" 
                    />
                    <Label htmlFor="edit-isActive">Announcement is active</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600">
                  Update Announcement
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
