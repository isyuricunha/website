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
import { useTranslations } from '@tszhong0411/i18n/client'
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilterField,
  DataTableToolbar
} from '@tszhong0411/ui'
import { UserCogIcon, UserIcon, MoreHorizontalIcon, TrashIcon, BanIcon, EditIcon, MailIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'
import UserEditModal from './user-edit-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@tszhong0411/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@tszhong0411/ui'
import { Button } from '@tszhong0411/ui'

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

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate({ userId })
  }

  const handleBanUser = (userId: string) => {
    banUserMutation.mutate({ userId })
  }

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate({ userId })
  }

  const handleResetPassword = (userId: string) => {
    resetPasswordMutation.mutate({ userId })
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditModalOpen(true)
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
      accessorKey: 'banned',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isBanned = row.original.banned
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isBanned 
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {isBanned ? 'Banned' : 'Active'}
          </span>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.users.createdAt')} />
      ),
      cell: ({ row }) => row.original.createdAt.toLocaleDateString()
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                <EditIcon className="mr-2 h-4 w-4" />
                {t('admin.table.users.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                <MailIcon className="mr-2 h-4 w-4" />
                {t('admin.table.users.reset-password')}
              </DropdownMenuItem>
              {user.banned ? (
                <DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
                  <BanIcon className="mr-2 h-4 w-4" />
                  {t('admin.table.users.unban')}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleBanUser(user.id)}>
                  <BanIcon className="mr-2 h-4 w-4" />
                  {t('admin.table.users.ban')}
                </DropdownMenuItem>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <TrashIcon className="mr-2 h-4 w-4" />
                    {t('admin.table.users.delete')}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('admin.modals.delete-confirmation.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('admin.table.users.confirm-delete')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('admin.modals.delete-confirmation.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                      {t('admin.modals.delete-confirmation.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} filterFields={filterFields} />
      </DataTable>

      <UserEditModal
        user={editingUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </>
  )
}

export default UsersTable
