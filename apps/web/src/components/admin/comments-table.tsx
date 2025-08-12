'use client'

import type { GetCommentsOutput } from '@/trpc/routers/comments'

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from '@tanstack/react-table'
import { useTranslations } from '@tszhong0411/i18n/client'
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilterField,
  DataTableToolbar
} from '@tszhong0411/ui'
import { useState } from 'react'
import { toast } from 'sonner'
import { MoreHorizontalIcon, TrashIcon } from 'lucide-react'

import { api } from '@/trpc/react'
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

type Comment = GetCommentsOutput['comments'][number]

type CommentsTableProps = {
  data: Comment[]
}

const CommentsTable = (props: CommentsTableProps) => {
  const { data } = props
  const t = useTranslations()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const utils = api.useUtils()

  const deleteCommentMutation = api.comments.deleteComment.useMutation({
    onSuccess: () => {
      toast.success(t('admin.table.comments.delete-success'))
      utils.comments.getComments.invalidate()
    },
    onError: () => {
      toast.error(t('admin.table.comments.delete-error'))
    }
  })

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate({ commentId })
  }

  const columns: Array<ColumnDef<Comment>> = [
    {
      accessorKey: 'userId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.comments.userId')} />
      )
    },
    {
      accessorKey: 'body',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.comments.body')} />
      )
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.comments.type')} />
      )
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.comments.createdAt')} />
      ),
      cell: ({ row }) => row.original.createdAt.toLocaleString()
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.table.comments.actions')} />
      ),
      cell: ({ row }) => {
        const comment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <TrashIcon className="mr-2 h-4 w-4" />
                    {t('admin.table.comments.delete')}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('admin.modals.delete-confirmation.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('admin.table.comments.confirm-delete')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('admin.modals.delete-confirmation.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
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

  const filterFields: Array<DataTableFilterField<Comment>> = [
    {
      id: 'userId',
      label: t('admin.table.comments.userId'),
      placeholder: t('admin.table.comments.filter-userId')
    },
    {
      id: 'body',
      label: t('admin.table.comments.body'),
      placeholder: t('admin.table.comments.filter-body')
    }
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields} />
    </DataTable>
  )
}

export default CommentsTable
