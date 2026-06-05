'use client'

import { useMemo, useState } from 'react'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@isyuricunha/ui'
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
import { useTranslations } from '@isyuricunha/i18n/client'
import { toast } from 'sonner'

import { api } from '@/trpc/react'
import ConfirmationDialog from './confirmation-dialog'

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
  const t = useTranslations('admin.bulk-operations')
  const roleT = useTranslations('admin.modals.edit-user.roles')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<'delete' | 'ban' | 'unban' | 'update_role'>(
    'ban'
  )
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
    variant?: 'default' | 'destructive'
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {
      /* no-op */
    }
  })

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
        t('messages.completed', {
          successful: result.summary.successful,
          total: result.summary.total
        })
      )
      setSelectedUsers([])
      refetchUsers()
      utils.bulk.listBulkOperations.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || t('messages.failed'))
    }
  })

  // Cancel bulk operation mutation
  const cancelOperation = api.bulk.cancelBulkOperation.useMutation({
    onSuccess: () => {
      toast.success(t('messages.cancelled'))
      utils.bulk.listBulkOperations.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || t('messages.cancel-failed'))
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
      toast.error(t('messages.select-users'))
      return
    }

    const confirmMessage = t('confirm.bulk-action', {
      action: getActionLabel(selectedAction),
      count: selectedUsers.length
    })

    setConfirmDialog({
      open: true,
      title: t('confirm.bulk-action-title'),
      description: confirmMessage,
      variant: 'destructive',
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }))
        const parameters = selectedAction === 'update_role' ? { role: newRole } : undefined
        await bulkUserAction.mutateAsync({
          userIds: selectedUsers,
          action: selectedAction,
          parameters
        })
      }
    })
  }

  const handleCancelOperation = async (operationId: string) => {
    setConfirmDialog({
      open: true,
      title: t('confirm.cancel-operation-title'),
      description: t('confirm.cancel-operation'),
      variant: 'destructive',
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }))
        await cancelOperation.mutateAsync({ operationId })
      }
    })
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'delete':
        return t('actions.delete-users')
      case 'ban':
        return t('actions.ban-users')
      case 'unban':
        return t('actions.unban-users')
      case 'update_role':
        return t('actions.update-role')
      default:
        return action
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t('status.completed')
      case 'failed':
        return t('status.failed')
      case 'running':
        return t('status.running')
      case 'cancelled':
        return t('status.cancelled')
      case 'pending':
        return t('status.pending')
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='text-status-success h-5 w-5' />
      case 'failed':
        return <XCircle className='text-status-danger h-5 w-5' />
      case 'running':
        return <Play className='text-status-info h-5 w-5' />
      case 'cancelled':
        return <Pause className='text-text-secondary h-5 w-5' />
      default:
        return <Clock className='text-text-secondary h-5 w-5' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-status-success-soft text-status-success'
      case 'failed':
        return 'bg-status-danger-soft text-status-danger'
      case 'running':
        return 'bg-status-info-soft text-status-info'
      case 'cancelled':
        return 'bg-bg-surface text-text-secondary'
      default:
        return 'bg-bg-surface text-text-secondary'
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
    if (!date) return t('date.never')
    return new Date(date).toLocaleString()
  }

  if (usersLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='bg-bg-hover mb-4 h-8 w-1/4 rounded'></div>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='bg-bg-hover h-16 rounded'></div>
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
          <h1 className='text-2xl font-medium'>{t('title')}</h1>
          <p className='text-text-secondary'>{t('description')}</p>
        </div>
      </div>

      {/* Bulk User Actions */}
      <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)]'>
        <div className='border-b border-[var(--border-subtle)] px-6 py-4'>
          <h3 className='text-lg font-medium'>{t('user-actions.title')}</h3>
        </div>
        <div className='p-6'>
          {/* Search and Filters */}
          <div className='mb-6 flex flex-col gap-4 sm:flex-row'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='text-text-secondary absolute top-2.5 left-2 h-4 w-4' />
                <Input
                  placeholder={t('user-actions.search-placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>
            </div>
            <Button variant='outline' size='sm'>
              <Filter className='mr-2 h-4 w-4' />
              {t('user-actions.filters')}
            </Button>
          </div>

          {/* Action Selection */}
          <div className='bg-bg-surface mb-6 flex flex-col gap-4 rounded-lg p-4 sm:flex-row'>
            <div className='flex-1'>
              <label className='mb-2 block text-sm font-medium'>
                {t('user-actions.select-action')}
              </label>
              <Select
                value={selectedAction}
                onValueChange={(value) =>
                  setSelectedAction(value as 'ban' | 'unban' | 'update_role' | 'delete')
                }
              >
                <SelectTrigger className='bg-bg-base text-text-primary focus:ring-ring focus:ring-offset-background w-full rounded-md border border-[var(--border-subtle)] px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ban'>{t('actions.ban-users')}</SelectItem>
                  <SelectItem value='unban'>{t('actions.unban-users')}</SelectItem>
                  <SelectItem value='update_role'>{t('actions.update-role')}</SelectItem>
                  <SelectItem value='delete'>{t('actions.delete-users')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedAction === 'update_role' && (
              <div className='flex-1'>
                <label className='mb-2 block text-sm font-medium'>
                  {t('user-actions.new-role')}
                </label>
                <Select
                  value={newRole}
                  onValueChange={(value) => setNewRole(value as 'user' | 'admin')}
                >
                  <SelectTrigger className='bg-bg-base text-text-primary focus:ring-ring focus:ring-offset-background w-full rounded-md border border-[var(--border-subtle)] px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user'>{roleT('user')}</SelectItem>
                    <SelectItem value='admin'>{roleT('admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='flex items-end'>
              <Button
                onClick={handleBulkAction}
                disabled={selectedUsers.length === 0 || bulkUserAction.isPending}
                className='flex items-center gap-2'
              >
                {getActionIcon(selectedAction)}
                {t('actions.execute', { count: selectedUsers.length })}
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className='overflow-x-auto'>
            <table className='divide-border min-w-full divide-y'>
              <thead className='bg-bg-hover'>
                <tr>
                  <th className='text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase'>
                    <input
                      type='checkbox'
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(usersData?.users.map((u) => u.id) || [])
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className='rounded border-[var(--border-subtle)]'
                    />
                  </th>
                  <th className='text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase'>
                    {t('table.user')}
                  </th>
                  <th className='text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase'>
                    {t('table.role')}
                  </th>
                  <th className='text-text-secondary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase'>
                    {t('table.joined')}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-border bg-bg-base divide-y'>
                {usersData?.users.map((user) => (
                  <tr key={user.id} className='hover:bg-bg-surface'>
                    <td className='px-6 py-4 whitespace-nowrap'>
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
                        className='rounded border-[var(--border-subtle)]'
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
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
                          <div className='text-text-secondary text-sm'>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'text-status-agent bg-status-agent-soft'
                            : 'bg-bg-surface text-text-secondary'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className='text-text-secondary px-6 py-4 text-sm whitespace-nowrap'>
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!usersData?.users || usersData.users.length === 0) && (
            <div className='py-12 text-center'>
              <Users className='text-text-secondary mx-auto h-12 w-12' />
              <h3 className='mt-2 text-sm font-medium'>{t('user-actions.no-users')}</h3>
              <p className='text-text-secondary mt-1 text-sm'>{t('user-actions.no-users-hint')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Operations History */}
      <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)]'>
        <div className='border-b border-[var(--border-subtle)] px-6 py-4'>
          <h3 className='text-lg font-medium'>{t('operations.title')}</h3>
        </div>
        <div className='divide-border divide-y'>
          {operationsQuery.isError && (
            <div className='text-text-secondary p-6 text-center'>
              {t('operations.failed-to-load')}
            </div>
          )}

          {operationsQuery.isLoading && (
            <div className='text-text-secondary p-6 text-center'>{t('operations.loading')}</div>
          )}

          {operations.map((operation: BulkOperationStatus) => (
            <div key={operation.id} className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {getStatusIcon(operation.status)}
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>{getActionLabel(operation.type)}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(operation.status)}`}
                      >
                        {getStatusLabel(operation.status)}
                      </span>
                    </div>
                    <div className='text-text-secondary text-sm'>
                      {t('operations.summary', {
                        successful: operation.successfulItems,
                        total: operation.totalItems,
                        creator: operation.createdByUser?.name || t('date.unknown'),
                        date: operation.createdAt
                          ? formatDate(operation.createdAt)
                          : t('date.unknown')
                      })}
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
                      {t('actions.cancel')}
                    </Button>
                  )}
                  {operation.status === 'completed' && operation.results != null && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleExportOperation(operation)}
                    >
                      <Download className='mr-2 h-4 w-4' />
                      {t('actions.export')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(operation.status === 'running' || operation.status === 'pending') && (
                <div className='mt-4'>
                  <div className='text-text-secondary mb-1 flex justify-between text-sm'>
                    <span>{t('operations.progress')}</span>
                    <span>
                      {operation.processedItems}/{operation.totalItems}
                    </span>
                  </div>
                  <div className='bg-bg-hover h-2 w-full rounded-full'>
                    <div
                      className='bg-status-info h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${operation.progress}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {typeof operation.errorMessage === 'string' && operation.errorMessage.length > 0 && (
                <div className='bg-status-danger-soft mt-4 rounded-md border border-[var(--status-danger-border)] p-3'>
                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='text-status-danger h-4 w-4' />
                    <span className='text-status-danger text-sm'>{operation.errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!operationsQuery.isLoading && !operationsQuery.isError && operations.length === 0 && (
            <div className='text-text-secondary p-6 text-center'>{t('operations.empty')}</div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
        loading={bulkUserAction.isPending || cancelOperation.isPending}
      />
    </div>
  )
}
