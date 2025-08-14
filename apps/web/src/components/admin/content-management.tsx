'use client'

import { useState } from 'react'
import { Button } from '@tszhong0411/ui'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Calendar,
  User,
  FileText,
  BarChart3
} from 'lucide-react'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

interface Post {
  id: string
  title: string
  slug: string
  description?: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  views: number
  likes: number
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string
    email: string
    image?: string
  }
  tags: string[]
}

export const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | 'archived' | undefined>()
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])

  // Fetch posts
  const { data: postsData, isLoading, refetch } = api.content.getPosts.useQuery({
    search: searchTerm || undefined,
    status: statusFilter,
    limit: 20,
    offset: 0
  })

  // Fetch content stats
  const { data: statsData } = api.content.getContentStats.useQuery()

  // Delete post mutation
  const deletePost = api.content.deletePost.useMutation({
    onSuccess: () => {
      toast.success('Post deleted successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete post')
    }
  })

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      await deletePost.mutateAsync({ id: postId })
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedPosts.length === 0) {
      toast.error('Please select posts to perform bulk actions')
      return
    }
    
    // TODO: Implement bulk actions
    toast.info(`Bulk ${action} for ${selectedPosts.length} posts (coming soon)`)
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your blog posts and content</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.totals.posts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.totals.published}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Edit className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.totals.drafts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.totals.views.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value as any || undefined)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
        
        {selectedPosts.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedPosts.length} posts selected
            </span>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('publish')}>
              Bulk Publish
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
              Bulk Archive
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
              Bulk Delete
            </Button>
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(postsData?.posts.map(p => p.id) || [])
                      } else {
                        setSelectedPosts([])
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {postsData?.posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id])
                        } else {
                          setSelectedPosts(selectedPosts.filter(id => id !== post.id))
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.title}
                          </div>
                          {post.featured && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          /{post.slug}
                        </div>
                        {post.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {post.author.image && (
                        <img
                          className="h-8 w-8 rounded-full mr-3"
                          src={post.author.image}
                          alt={post.author.name}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.author.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {post.author.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {post.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-gray-400" />
                        {post.likes}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="text-xs">
                        Updated {formatDate(post.updatedAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletePost.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!postsData?.posts || postsData.posts.length === 0) && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first blog post.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {postsData && postsData.hasMore && (
        <div className="flex justify-center">
          <Button variant="outline">Load More Posts</Button>
        </div>
      )}
    </div>
  )
}
