'use client'

import { useState } from 'react'
import { Button } from '@isyuricunha/ui'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react'
import Image from 'next/image'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

// Post interface is now inferred from tRPC response

const status_filters = ['draft', 'published', 'archived'] as const
type StatusFilter = (typeof status_filters)[number]

export const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter | undefined>()
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])

  // Fetch posts
  const {
    data: postsData,
    isLoading,
    refetch
  } = api.content.getPosts.useQuery({
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

  const bulkUpdatePostStatus = api.content.bulkUpdatePostStatus.useMutation({
    onSuccess: (data) => {
      toast.success(`Updated ${data.updatedCount} posts successfully`)
      setSelectedPosts([])
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update posts')
    }
  })

  const bulkDeletePosts = api.content.bulkDeletePosts.useMutation({
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deletedCount} posts successfully`)
      setSelectedPosts([])
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete posts')
    }
  })

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      await deletePost.mutateAsync({ id: postId })
    }
  }

  const handleBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (selectedPosts.length === 0) {
      toast.error('Please select posts to perform bulk actions')
      return
    }

    if (action === 'delete') {
      const confirmed = confirm(
        `Are you sure you want to delete ${selectedPosts.length} posts? This action cannot be undone.`
      )

      if (!confirmed) return

      await bulkDeletePosts.mutateAsync({ ids: selectedPosts })
      return
    }

    const status = action === 'publish' ? 'published' : 'archived'
    await bulkUpdatePostStatus.mutateAsync({ ids: selectedPosts, status })
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-muted/30 text-muted-foreground',
      published: 'bg-primary/10 text-primary',
      archived: 'bg-muted/30 text-muted-foreground'
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='bg-muted mb-4 h-8 w-1/4 rounded'></div>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='bg-muted h-16 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Content Management</h1>
          <p className='text-muted-foreground'>Manage your blog posts and content</p>
        </div>
        <Button className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          New Post
        </Button>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='bg-card border-border rounded-lg border p-6'>
            <div className='flex items-center'>
              <FileText className='text-primary h-8 w-8' />
              <div className='ml-4'>
                <p className='text-muted-foreground text-sm font-medium'>Total Posts</p>
                <p className='text-2xl font-bold'>
                  {statsData.totals.posts}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-card border-border rounded-lg border p-6'>
            <div className='flex items-center'>
              <Eye className='text-primary h-8 w-8' />
              <div className='ml-4'>
                <p className='text-muted-foreground text-sm font-medium'>Published</p>
                <p className='text-2xl font-bold'>
                  {statsData.totals.published}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-card border-border rounded-lg border p-6'>
            <div className='flex items-center'>
              <Edit className='text-muted-foreground h-8 w-8' />
              <div className='ml-4'>
                <p className='text-muted-foreground text-sm font-medium'>Drafts</p>
                <p className='text-2xl font-bold'>
                  {statsData.totals.drafts}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-card border-border rounded-lg border p-6'>
            <div className='flex items-center'>
              <BarChart3 className='text-primary h-8 w-8' />
              <div className='ml-4'>
                <p className='text-muted-foreground text-sm font-medium'>Total Views</p>
                <p className='text-2xl font-bold'>
                  {statsData.totals.views.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className='bg-card border-border rounded-lg border p-4'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform' />
              <input
                type='text'
                placeholder='Search posts...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='bg-background border-border text-foreground w-full rounded-md border py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <select
              value={statusFilter || ''}
              onChange={(e) => {
                const value = e.target.value

                if (value === '') {
                  setStatusFilter(undefined)
                  return
                }

                if (status_filters.includes(value as StatusFilter)) {
                  setStatusFilter(value as StatusFilter)
                }
              }}
              className='bg-background border-border text-foreground rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
            >
              <option value=''>All Status</option>
              <option value='draft'>Draft</option>
              <option value='published'>Published</option>
              <option value='archived'>Archived</option>
            </select>

            <Button variant='outline' size='sm'>
              <Filter className='mr-2 h-4 w-4' />
              More Filters
            </Button>
          </div>
        </div>

        {selectedPosts.length > 0 && (
          <div className='mt-4 flex items-center gap-2'>
            <span className='text-muted-foreground text-sm'>
              {selectedPosts.length} posts selected
            </span>
            <Button
              size='sm'
              variant='outline'
              disabled={bulkUpdatePostStatus.isPending || bulkDeletePosts.isPending}
              onClick={() => handleBulkAction('publish')}
            >
              Bulk Publish
            </Button>
            <Button
              size='sm'
              variant='outline'
              disabled={bulkUpdatePostStatus.isPending || bulkDeletePosts.isPending}
              onClick={() => handleBulkAction('archive')}
            >
              Bulk Archive
            </Button>
            <Button
              size='sm'
              variant='outline'
              disabled={bulkUpdatePostStatus.isPending || bulkDeletePosts.isPending}
              onClick={() => handleBulkAction('delete')}
            >
              Bulk Delete
            </Button>
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className='bg-card border-border overflow-hidden rounded-lg border'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-border'>
            <thead className='bg-muted'>
              <tr>
                <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                  <input
                    type='checkbox'
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(postsData?.posts.map((p) => p.id) || [])
                      } else {
                        setSelectedPosts([])
                      }
                    }}
                    className='border-border rounded'
                  />
                </th>
                <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                  Post
                </th>
                <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                  Status
                </th>
                <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                  Author
                </th>
                <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                  Stats
                </th>
                <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                  Date
                </th>
                <th className='text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border bg-background'>
              {postsData?.posts.map((post) => (
                <tr key={post.id} className='hover:bg-muted/30'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <input
                      type='checkbox'
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id])
                        } else {
                          setSelectedPosts(selectedPosts.filter((id) => id !== post.id))
                        }
                      }}
                      className='border-border rounded'
                    />
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <div className='text-sm font-medium'>
                            {post.title}
                          </div>
                          {post.featured && <Star className='text-primary h-4 w-4' />}
                        </div>
                        <div className='text-muted-foreground text-sm'>/{post.slug}</div>
                        {post.tags.length > 0 && (
                          <div className='mt-1 flex gap-1'>
                            {post.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className='bg-primary/10 text-primary inline-flex items-center rounded px-2 py-0.5 text-xs font-medium'
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className='text-muted-foreground text-xs'>
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    {getStatusBadge(post.status ?? 'draft')}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center'>
                      {post.author?.image && (
                        <Image
                          className='mr-3 h-8 w-8 rounded-full'
                          src={post.author.image}
                          alt={post.author.name ?? 'Author'}
                          width={32}
                          height={32}
                        />
                      )}
                      <div>
                        <div className='text-sm font-medium'>
                          {post.author?.name ?? 'Unknown'}
                        </div>
                        <div className='text-muted-foreground text-sm'>
                          {post.author?.email ?? ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm'>
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center gap-1'>
                        <Eye className='text-muted-foreground h-4 w-4' />
                        {post.views}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Star className='text-muted-foreground h-4 w-4' />
                        {post.likes}
                      </div>
                    </div>
                  </td>
                  <td className='text-muted-foreground whitespace-nowrap px-6 py-4 text-sm'>
                    <div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className='text-xs'>Updated {formatDate(post.updatedAt)}</div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                    <div className='flex items-center justify-end gap-2'>
                      <Button size='sm' variant='outline'>
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button size='sm' variant='outline'>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletePost.isPending}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!postsData?.posts || postsData.posts.length === 0) && (
          <div className='py-12 text-center'>
            <FileText className='text-muted-foreground mx-auto h-12 w-12' />
            <h3 className='mt-2 text-sm font-medium'>
              No posts found
            </h3>
            <p className='text-muted-foreground mt-1 text-sm'>
              Get started by creating your first blog post.
            </p>
            <div className='mt-6'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                New Post
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {postsData && postsData.hasMore && (
        <div className='flex justify-center'>
          <Button variant='outline'>Load More Posts</Button>
        </div>
      )}
    </div>
  )
}
