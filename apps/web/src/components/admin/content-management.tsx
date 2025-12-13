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

export const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | 'archived' | undefined>()
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
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
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
          <div className='mb-4 h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-16 rounded bg-gray-200 dark:bg-gray-700'></div>
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
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Content Management</h1>
          <p className='text-gray-600 dark:text-gray-400'>Manage your blog posts and content</p>
        </div>
        <Button className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          New Post
        </Button>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-center'>
              <FileText className='h-8 w-8 text-blue-500' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Total Posts</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {statsData.totals.posts}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-center'>
              <Eye className='h-8 w-8 text-green-500' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Published</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {statsData.totals.published}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-center'>
              <Edit className='h-8 w-8 text-yellow-500' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Drafts</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {statsData.totals.drafts}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-center'>
              <BarChart3 className='h-8 w-8 text-purple-500' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Total Views</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {statsData.totals.views.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <input
                type='text'
                placeholder='Search posts...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter((e.target.value as any) || undefined)}
              className='rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
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
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {selectedPosts.length} posts selected
            </span>
            <Button size='sm' variant='outline' onClick={() => handleBulkAction('publish')}>
              Bulk Publish
            </Button>
            <Button size='sm' variant='outline' onClick={() => handleBulkAction('archive')}>
              Bulk Archive
            </Button>
            <Button size='sm' variant='outline' onClick={() => handleBulkAction('delete')}>
              Bulk Delete
            </Button>
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-900'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  <input
                    type='checkbox'
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(postsData?.posts.map((p) => p.id) || [])
                      } else {
                        setSelectedPosts([])
                      }
                    }}
                    className='rounded border-gray-300 dark:border-gray-600'
                  />
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Post
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Author
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Stats
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Date
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800'>
              {postsData?.posts.map((post) => (
                <tr key={post.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
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
                      className='rounded border-gray-300 dark:border-gray-600'
                    />
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <div className='text-sm font-medium text-gray-900 dark:text-white'>
                            {post.title}
                          </div>
                          {post.featured && <Star className='h-4 w-4 text-yellow-500' />}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>/{post.slug}</div>
                        {post.tags.length > 0 && (
                          <div className='mt-1 flex gap-1'>
                            {post.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className='inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className='text-xs text-gray-500 dark:text-gray-400'>
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
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>
                          {post.author?.name ?? 'Unknown'}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>
                          {post.author?.email ?? ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white'>
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center gap-1'>
                        <Eye className='h-4 w-4 text-gray-400' />
                        {post.views}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Star className='h-4 w-4 text-gray-400' />
                        {post.likes}
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
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
            <FileText className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
              No posts found
            </h3>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
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
