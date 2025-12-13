'use client'

import { useState } from 'react'
import { Button } from '@tszhong0411/ui'
import {
  Users,
  Search,
  Filter,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Trash2,
  Ban,
  UserCheck,
  Settings
} from 'lucide-react'
import Image from 'next/image'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

interface BulkOperationStatus {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  progress: number
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  createdBy: string
  createdByUser: {
    id: string
    name: string
    email: string
  }
  parameters: any
  results: any
  errorMessage?: string
}

export const BulkOperations = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<'delete' | 'ban' | 'unban' | 'update_role'>(
    'ban'
  )
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')

  // Fetch users for bulk operations
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers
  } = api.bulk.getUsersForBulkOperation.useQuery({
    search: searchTerm || undefined,
    excludeAdmins: true,
    limit: 100
  })

  // Fetch bulk operations history - this endpoint returns a single operation, not a list
  // We need to create a separate endpoint or modify this to get multiple operations
  const operations: BulkOperationStatus[] = []

  // Bulk user action mutation
  const bulkUserAction = api.bulk.bulkUserAction.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Bulk operation completed: ${result.summary.successful}/${result.summary.total} successful`
      )
      setSelectedUsers([])
      refetchUsers()
      // refetchOperations() // Temporarily disabled since we're using local state
    },
    onError: (error) => {
      toast.error(error.message || 'Bulk operation failed')
    }
  })

  // Cancel bulk operation mutation
  const cancelOperation = api.bulk.cancelBulkOperation.useMutation({
    onSuccess: () => {
      toast.success('Operation cancelled')
      // refetchOperations() // Temporarily disabled since we're using local state
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel operation')
    }
  })

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to perform bulk actions')
      return
    }

    const confirmMessage = `Are you sure you want to ${selectedAction} ${selectedUsers.length} users? This action cannot be undone.`
    if (!confirm(confirmMessage)) {
      return
    }

    const parameters = selectedAction === 'update_role' ? { role: newRole } : undefined

    await bulkUserAction.mutateAsync({
      userIds: selectedUsers,
      action: selectedAction,
      parameters
    })
  }

  const handleCancelOperation = async (operationId: string) => {
    if (confirm('Are you sure you want to cancel this operation?')) {
      await cancelOperation.mutateAsync({ operationId })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-5 w-5 text-green-500' />
      case 'failed':
        return <XCircle className='h-5 w-5 text-red-500' />
      case 'running':
        return <Play className='h-5 w-5 text-blue-500' />
      case 'cancelled':
        return <Pause className='h-5 w-5 text-gray-500' />
      default:
        return <Clock className='h-5 w-5 text-yellow-500' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'delete':
        return <Trash2 className='h-4 w-4' />
      case 'ban':
        return <Ban className='h-4 w-4' />
      case 'unban':
        return <UserCheck className='h-4 w-4' />
      case 'update_role':
        return <Settings className='h-4 w-4' />
      default:
        return <Users className='h-4 w-4' />
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  if (usersLoading) {
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
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Bulk Operations</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Perform bulk actions on users and content
          </p>
        </div>
      </div>

      {/* Bulk User Actions */}
      <div className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
        <div className='border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Bulk User Actions</h3>
        </div>
        <div className='p-6'>
          {/* Search and Filters */}
          <div className='mb-6 flex flex-col gap-4 sm:flex-row'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <input
                  type='text'
                  placeholder='Search users...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                />
              </div>
            </div>
            <Button variant='outline' size='sm'>
              <Filter className='mr-2 h-4 w-4' />
              Filters
            </Button>
          </div>

          {/* Action Selection */}
          <div className='mb-6 flex flex-col gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row dark:bg-gray-900'>
            <div className='flex-1'>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Select Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as any)}
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              >
                <option value='ban'>Ban Users</option>
                <option value='unban'>Unban Users</option>
                <option value='update_role'>Update Role</option>
                <option value='delete'>Delete Users</option>
              </select>
            </div>

            {selectedAction === 'update_role' && (
              <div className='flex-1'>
                <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                >
                  <option value='user'>User</option>
                  <option value='admin'>Admin</option>
                </select>
              </div>
            )}

            <div className='flex items-end'>
              <Button
                onClick={handleBulkAction}
                disabled={selectedUsers.length === 0 || bulkUserAction.isPending}
                className='flex items-center gap-2'
              >
                {getActionIcon(selectedAction)}
                Execute ({selectedUsers.length})
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-900'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    <input
                      type='checkbox'
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(usersData?.users.map((u) => u.id) || [])
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className='rounded border-gray-300 dark:border-gray-600'
                    />
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Role
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800'>
                {usersData?.users.map((user) => (
                  <tr key={user.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                          }
                        }}
                        className='rounded border-gray-300 dark:border-gray-600'
                      />
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='flex items-center'>
                        {user.image && (
                          <Image
                            className='mr-3 h-8 w-8 rounded-full'
                            src={user.image}
                            alt={user.name}
                            width={32}
                            height={32}
                          />
                        )}
                        <div>
                          <div className='text-sm font-medium text-gray-900 dark:text-white'>
                            {user.name}
                          </div>
                          <div className='text-sm text-gray-500 dark:text-gray-400'>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!usersData?.users || usersData.users.length === 0) && (
            <div className='py-12 text-center'>
              <Users className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
                No users found
              </h3>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Operations History */}
      <div className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
        <div className='border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Recent Operations</h3>
        </div>
        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {operations.map((operation: BulkOperationStatus) => (
            <div key={operation.id} className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {getStatusIcon(operation.status)}
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        {operation.type
                          .replace('_', ' ')
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(operation.status)}`}
                      >
                        {operation.status}
                      </span>
                    </div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>
                      {operation.successfulItems}/{operation.totalItems} successful • Created by{' '}
                      {operation.createdByUser?.name || 'Unknown'} •
                      {operation.createdAt ? formatDate(operation.createdAt) : 'Unknown date'}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {operation.status === 'running' && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleCancelOperation(operation.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {operation.status === 'completed' && operation.results && (
                    <Button size='sm' variant='outline'>
                      <Download className='mr-2 h-4 w-4' />
                      Export
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {operation.status === 'running' && (
                <div className='mt-4'>
                  <div className='mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-400'>
                    <span>Progress</span>
                    <span>
                      {operation.processedItems}/{operation.totalItems}
                    </span>
                  </div>
                  <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                    <div
                      className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                      style={{
                        width: `${(operation.processedItems / operation.totalItems) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {operation.errorMessage && (
                <div className='mt-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='h-4 w-4 text-red-500' />
                    <span className='text-sm text-red-700 dark:text-red-300'>
                      {operation.errorMessage}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {operations.length === 0 && (
            <div className='p-6 text-center text-gray-500 dark:text-gray-400'>
              No bulk operations found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
