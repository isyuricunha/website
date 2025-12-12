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
  const [selectedAction, setSelectedAction] = useState<'delete' | 'ban' | 'unban' | 'update_role'>('ban')
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')

  // Fetch users for bulk operations
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = api.bulk.getUsersForBulkOperation.useQuery({
    search: searchTerm || undefined,
    excludeAdmins: true,
    limit: 100
  })

  // Fetch bulk operations history - this endpoint returns a single operation, not a list
  // We need to create a separate endpoint or modify this to get multiple operations
  const [operationsData] = useState<{ operations: BulkOperationStatus[] } | null>(null)

  // Bulk user action mutation
  const bulkUserAction = api.bulk.bulkUserAction.useMutation({
    onSuccess: (result) => {
      toast.success(`Bulk operation completed: ${result.summary.successful}/${result.summary.total} successful`)
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
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Play className="w-5 h-5 text-blue-500" />
      case 'cancelled':
        return <Pause className="w-5 h-5 text-gray-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
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
        return <Trash2 className="w-4 h-4" />
      case 'ban':
        return <Ban className="w-4 h-4" />
      case 'unban':
        return <UserCheck className="w-4 h-4" />
      case 'update_role':
        return <Settings className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  if (usersLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({length: 5}).map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Operations</h1>
          <p className="text-gray-600 dark:text-gray-400">Perform bulk actions on users and content</p>
        </div>
      </div>

      {/* Bulk User Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bulk User Actions</h3>
        </div>
        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Action Selection */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ban">Ban Users</option>
                <option value="unban">Unban Users</option>
                <option value="update_role">Update Role</option>
                <option value="delete">Delete Users</option>
              </select>
            </div>

            {selectedAction === 'update_role' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <div className="flex items-end">
              <Button
                onClick={handleBulkAction}
                disabled={selectedUsers.length === 0 || bulkUserAction.isPending}
                className="flex items-center gap-2"
              >
                {getActionIcon(selectedAction)}
                Execute ({selectedUsers.length})
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(usersData?.users.map(u => u.id) || [])
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {usersData?.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image && (
                          <img
                            className="h-8 w-8 rounded-full mr-3"
                            src={user.image}
                            alt={user.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!usersData?.users || usersData.users.length === 0) && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Operations History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Operations</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {operationsData?.operations?.map((operation: BulkOperationStatus) => (
            <div key={operation.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(operation.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {operation.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                        {operation.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {operation.successfulItems}/{operation.totalItems} successful •
                      Created by {operation.createdByUser?.name || 'Unknown'} •
                      {operation.createdAt ? formatDate(operation.createdAt) : 'Unknown date'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {operation.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelOperation(operation.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {operation.status === 'completed' && operation.results && (
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {operation.status === 'running' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{operation.processedItems}/{operation.totalItems}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(operation.processedItems / operation.totalItems) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {operation.errorMessage && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      {operation.errorMessage}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {(!operationsData?.operations || operationsData.operations.length === 0) && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No bulk operations found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
