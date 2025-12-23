'use client'

import type { GetUsersOutput } from '@/trpc/routers/users'

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useTranslations } from '@isyuricunha/i18n/client'
import {
  Badge,
  Button,
  DataTable,
  DataTableColumnHeader,
  type DataTableFilterField,
  DataTableToolbar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  toast
} from '@isyuricunha/ui'
import {
  BanIcon,
  Download,
  EditIcon,
  MailIcon,
  MoreHorizontalIcon,
  Search,
  TrashIcon,
  UserCogIcon,
  UserIcon,
  X
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { useDebounceSearch } from '@/hooks/use-debounced-search'
import { api } from '@/trpc/react'
import { exportToCSV, USER_EXPORT_COLUMNS } from '@/utils/csv-export'

import ConfirmationDialog from './confirmation-dialog'
import UserEditModal from './user-edit-modal'

type User = GetUsersOutput['users'][number]

type UsersTableProps = {
  data: User[]
}

const roles = [
  {
    value: 'user',
    label: 'User',
    icon: UserIcon
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: UserCogIcon
  }
]

const UsersTable = (props: UsersTableProps) => {
  const { data } = props
  const t = useTranslations()
  const utils = api.useUtils()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
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

  const { searchTerm, debouncedSearchTerm, updateSearchTerm, clearSearch } = useDebounceSearch()

  const deleteUserMutation = api.users.deleteUser.useMutation({
    onSuccess: () => {
      toast.success(t('admin.table.users.delete-success'))
      utils.users.getUsers.invalidate()
    },
    onError: () => {
      toast.error(t('admin.table.users.delete-error'))
    }
  })

  const banUserMutation = api.users.banUser.useMutation({
    onSuccess: () => {
      toast.success(t('admin.table.users.ban-success'))
      utils.users.getUsers.invalidate()
    },
    onError: () => {
      toast.error(t('admin.table.users.ban-error'))
    }
  })

  const unbanUserMutation = api.users.unbanUser.useMutation({
    onSuccess: () => {
      toast.success(t('admin.table.users.unban-success'))
      utils.users.getUsers.invalidate()
    },
    onError: () => {
      toast.error(t('admin.table.users.unban-error'))
    }
  })

  const resetPasswordMutation = api.users.sendPasswordReset.useMutation({
    onSuccess: () => {
      toast.success(t('admin.table.users.reset-password-success'))
    },
    onError: () => {
      toast.error(t('admin.table.users.reset-password-error'))
    }
  })

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data

    return data.filter(
      (user) =>
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (user.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ?? false) ||
        user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [data, debouncedSearchTerm])

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      description: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      variant: 'destructive',
      action: () => {
        deleteUserMutation.mutate({ userId })
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      }
    })
  }

  const handleBanUser = (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Ban User',
      description: `Are you sure you want to ban user "${userName}"?`,
      variant: 'destructive',
      action: () => {
        banUserMutation.mutate({ userId })
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      }
    })
  }

  const handleUnbanUser = (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Unban User',
      description: `Are you sure you want to unban user "${userName}"?`,
      action: () => {
        unbanUserMutation.mutate({ userId })
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      }
    })
  }

  const handleResetPassword = (userId: string) => {
    resetPasswordMutation.mutate({ userId })
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditModalOpen(true)
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredData,
      `users-${new Date().toISOString().split('T')[0]}`,
      USER_EXPORT_COLUMNS
    )
    toast.success('Users exported to CSV successfully')
  }

  const columns: Array<ColumnDef<User>> = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.users.name')} />
      )
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.users.email')} />
      )
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.users.role')} />
      )
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.users.createdAt')} />
      ),
      cell: ({ row }) => <>{row.original.createdAt.toLocaleDateString()}</>
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.users.status')} />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'admin' ? 'secondary' : 'default'}>
          {row.original.role}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.users.actions')} />
      ),
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontalIcon className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                <EditIcon className='mr-2 h-4 w-4' />
                {t('admin.table.users.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                <MailIcon className='mr-2 h-4 w-4' />
                {t('admin.table.users.reset-password')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBanUser(user.id, user.name)}>
                <BanIcon className='mr-2 h-4 w-4' />
                {t('admin.table.users.ban')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUnbanUser(user.id, user.name)}>
                <BanIcon className='mr-2 h-4 w-4' />
                {t('admin.table.users.unban')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteUser(user.id, user.name)}>
                <TrashIcon className='mr-2 h-4 w-4' />
                {t('admin.table.users.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const filterFields: Array<DataTableFilterField<User>> = [
    {
      id: 'name',
      label: t('admin.table.users.name'),
      placeholder: t('admin.table.users.filter-names')
    },
    {
      id: 'role',
      label: t('admin.table.users.role'),
      options: roles
    }
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  return (
    <>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
              <Input
                placeholder='Search users...'
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.target.value)}
                className='w-64 pl-8'
              />
              {searchTerm && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute top-1 right-1 h-6 w-6 p-0'
                  onClick={clearSearch}
                >
                  <X className='h-3 w-3' />
                </Button>
              )}
            </div>
          </div>
          <Button onClick={handleExportCSV} variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            Export CSV
          </Button>
        </div>

        <DataTable table={table}>
          <DataTableToolbar table={table} filterFields={filterFields} />
        </DataTable>
      </div>

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
        loading={
          deleteUserMutation.isPending || banUserMutation.isPending || unbanUserMutation.isPending
        }
      />

      <UserEditModal user={editingUser} open={editModalOpen} onOpenChange={setEditModalOpen} />
    </>
  )
}

export default UsersTable
