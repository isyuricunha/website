'use client'

import { useMemo, useState } from 'react'
import { Button } from '@isyuricunha/ui'
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
  parameters: unknown
  results: unknown
  errorMessage?: string | null
}

const exportJson = (fileName: string, data: unknown) => {
  const content = JSON.stringify(data, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()

  URL.revokeObjectURL(url)
}

export const BulkOperations = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<'delete' | 'ban' | 'unban' | 'update_role'>(
    'ban'
  )
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')

  const utils = api.useUtils()

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

  const operationsQuery = api.bulk.listBulkOperations.useQuery(
    {
      limit: 20,
      offset: 0
    },
    {
      refetchInterval: (query) => {
        const data = query.state.data
        const hasActive =
          data?.some(
            (op: { status: BulkOperationStatus['status'] }) =>
              op.status === 'pending' || op.status === 'running'
          ) ?? false
        return hasActive ? 2000 : false
      }
    }
  )

  const operations = useMemo(() => {
    return (operationsQuery.data ?? []) as unknown as BulkOperationStatus[]
  }, [operationsQuery.data])

  // Bulk user action mutation
  const bulkUserAction = api.bulk.bulkUserAction.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Bulk operation completed: ${result.summary.successful}/${result.summary.total} successful`
      )
      setSelectedUsers([])
      refetchUsers()
      utils.bulk.listBulkOperations.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Bulk operation failed')
    }
  })

  // Cancel bulk operation mutation
  const cancelOperation = api.bulk.cancelBulkOperation.useMutation({
    onSuccess: () => {
      toast.success('Operation cancelled')
      utils.bulk.listBulkOperations.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel operation')
    }
  })

  const handleExportOperation = (operation: BulkOperationStatus) => {
    exportJson(`bulk-operation-${operation.id}.json`, {
      ...operation,
      exportedAt: new Date().toISOString()
    })
  }

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
        return <CheckCircle className='text-primary h-5 w-5' />
      case 'failed':
        return <XCircle className='text-destructive h-5 w-5' />
      case 'running':
        return <Play className='text-primary h-5 w-5' />
      case 'cancelled':
        return <Pause className='text-muted-foreground h-5 w-5' />
      default:
        return <Clock className='text-muted-foreground h-5 w-5' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary/10 text-primary'
      case 'failed':
        return 'bg-destructive/10 text-destructive'
      case 'running':
        return 'bg-primary/10 text-primary'
      case 'cancelled':
        return 'bg-muted/30 text-muted-foreground'
      default:
        return 'bg-muted/30 text-muted-foreground'
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
          <h1 className='text-2xl font-bold'>Bulk Operations</h1>
          <p className='text-muted-foreground'>Perform bulk actions on users and content</p>
        </div>
      </div>

      {/* Bulk User Actions */}
      <div className='bg-card border-border rounded-lg border'>
        <div className='border-border border-b px-6 py-4'>
          <h3 className='text-lg font-medium'>Bulk User Actions</h3>
        </div>
        <div className='p-6'>
          {/* Search and Filters */}
          <div className='mb-6 flex flex-col gap-4 sm:flex-row'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform' />
                <input
                  type='text'
                  placeholder='Search users...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full rounded-md border py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-offset-2'
                />
              </div>
            </div>
            <Button variant='outline' size='sm'>
              <Filter className='mr-2 h-4 w-4' />
              Filters
            </Button>
          </div>

          {/* Action Selection */}
          <div className='bg-muted/30 mb-6 flex flex-col gap-4 rounded-lg p-4 sm:flex-row'>
            <div className='flex-1'>
              <label className='mb-2 block text-sm font-medium'>Select Action</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as any)}
                className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'
              >
                <option value='ban'>Ban Users</option>
                <option value='unban'>Unban Users</option>
                <option value='update_role'>Update Role</option>
                <option value='delete'>Delete Users</option>
              </select>
            </div>

            {selectedAction === 'update_role' && (
              <div className='flex-1'>
                <label className='mb-2 block text-sm font-medium'>New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'
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
            <table className='divide-border min-w-full divide-y'>
              <thead className='bg-muted'>
                <tr>
                  <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                    <input
                      type='checkbox'
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(usersData?.users.map((u) => u.id) || [])
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className='border-border rounded'
                    />
                  </th>
                  <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                    User
                  </th>
                  <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                    Role
                  </th>
                  <th className='text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className='divide-border bg-background divide-y'>
                {usersData?.users.map((user) => (
                  <tr key={user.id} className='hover:bg-muted/30'>
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
                        className='border-border rounded'
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
                          <div className='text-sm font-medium'>{user.name}</div>
                          <div className='text-muted-foreground text-sm'>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className='text-muted-foreground whitespace-nowrap px-6 py-4 text-sm'>
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!usersData?.users || usersData.users.length === 0) && (
            <div className='py-12 text-center'>
              <Users className='text-muted-foreground mx-auto h-12 w-12' />
              <h3 className='mt-2 text-sm font-medium'>No users found</h3>
              <p className='text-muted-foreground mt-1 text-sm'>
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Operations History */}
      <div className='bg-card border-border rounded-lg border'>
        <div className='border-border border-b px-6 py-4'>
          <h3 className='text-lg font-medium'>Recent Operations</h3>
        </div>
        <div className='divide-border divide-y'>
          {operationsQuery.isError && (
            <div className='text-muted-foreground p-6 text-center'>
              Failed to load bulk operations.
            </div>
          )}

          {operationsQuery.isLoading && (
            <div className='text-muted-foreground p-6 text-center'>Loading bulk operations...</div>
          )}

          {operations.map((operation: BulkOperationStatus) => (
            <div key={operation.id} className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {getStatusIcon(operation.status)}
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>
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
                    <div className='text-muted-foreground text-sm'>
                      {operation.successfulItems}/{operation.totalItems} successful • Created by{' '}
                      {operation.createdByUser?.name || 'Unknown'} •
                      {operation.createdAt ? formatDate(operation.createdAt) : 'Unknown date'}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {(operation.status === 'running' || operation.status === 'pending') && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleCancelOperation(operation.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {operation.status === 'completed' && operation.results != null && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleExportOperation(operation)}
                    >
                      <Download className='mr-2 h-4 w-4' />
                      Export
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(operation.status === 'running' || operation.status === 'pending') && (
                <div className='mt-4'>
                  <div className='text-muted-foreground mb-1 flex justify-between text-sm'>
                    <span>Progress</span>
                    <span>
                      {operation.processedItems}/{operation.totalItems}
                    </span>
                  </div>
                  <div className='bg-muted h-2 w-full rounded-full'>
                    <div
                      className='bg-primary h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${operation.progress}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {typeof operation.errorMessage === 'string' && operation.errorMessage.length > 0 && (
                <div className='border-destructive/20 bg-destructive/10 mt-4 rounded-md border p-3'>
                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='text-destructive h-4 w-4' />
                    <span className='text-destructive text-sm'>{operation.errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!operationsQuery.isLoading && !operationsQuery.isError && operations.length === 0 && (
            <div className='text-muted-foreground p-6 text-center'>No bulk operations found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
