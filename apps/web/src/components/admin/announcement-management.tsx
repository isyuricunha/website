'use client'

import { useState } from 'react'
import { Button , Card, CardContent, CardDescription, CardHeader, CardTitle , Badge , Input , Label , Textarea , Select, SelectContent, SelectItem, SelectTrigger, SelectValue , AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger , Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger , ScrollArea } from '@tszhong0411/ui'









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

  const handleCreateAnnouncement = (formData: FormData) => {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as any
    const priority = Number.parseInt(formData.get('priority') as string) || 0
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
    const priority = Number.parseInt(formData.get('priority') as string) || 0
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
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
            <div className="flex-shrink-0 p-2.5 rounded-xl bg-orange-500/10">
              <Megaphone className="h-7 w-7 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="truncate">Announcements</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage site-wide announcements and notifications</p>
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/50 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Total Views</CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400">{analytics.totalViews}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">Across all announcements</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Dismissal Rate</CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400">{analytics.dismissalRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{analytics.totalDismissals} total dismissals</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Active Announcements</CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Megaphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
                {announcements?.announcements?.filter(a => a.isActive).length || 0}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Currently visible to users</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Announcements List */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Megaphone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold">All Announcements</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">Manage your site announcements</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px]">
            <div className="space-y-4">
              {announcements?.announcements?.map((announcement) => (
                <Card key={announcement.id} className="group border-border/40 bg-card hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-110",
                            announcement.type === 'error' && "bg-red-500/10",
                            announcement.type === 'warning' && "bg-yellow-500/10",
                            announcement.type === 'success' && "bg-emerald-500/10",
                            announcement.type === 'info' && "bg-blue-500/10"
                          )}>
                            {getAnnouncementIcon(announcement.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className="text-lg font-semibold truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {announcement.title}
                              </h3>
                              {!announcement.isActive && (
                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {announcement.content}
                            </p>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pl-14">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs font-medium">
                            Priority {announcement.priority}
                          </Badge>
                          {announcement.targetAudience && (
                            <span className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              Targeted
                            </span>
                          )}
                          <span>
                            {announcement.isDismissible ? '✓ Dismissible' : '✗ Not dismissible'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(announcement)}
                          className={cn(
                            "h-9 w-9 p-0 transition-all duration-200",
                            announcement.isActive
                              ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          aria-label={announcement.isActive ? "Deactivate" : "Activate"}
                        >
                          {announcement.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(announcement)}
                          className="h-9 w-9 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all duration-200"
                          aria-label="Edit announcement"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200"
                              aria-label="Delete announcement"
                            >
                              <Trash2 className="h-4 w-4" />
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
