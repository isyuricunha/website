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
import { useTranslations } from '@isyuricunha/i18n/client'
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilterField,
  DataTableToolbar,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  toast
} from '@isyuricunha/ui'
import { useState, useMemo } from 'react'
import { MoreHorizontalIcon, TrashIcon, Download, Search, X } from 'lucide-react'

import { api } from '@/trpc/react'
import { useDebounceSearch } from '@/hooks/use-debounced-search'
import { exportToCSV, COMMENT_EXPORT_COLUMNS } from '@/utils/csv-export'
import ConfirmationDialog from './confirmation-dialog'

type Comment = GetCommentsOutput['comments'][number]

type CommentsTableProps = {
  data: Comment[]
}

const CommentsTable = (props: CommentsTableProps) => {
  const { data } = props
  const t = useTranslations()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const utils = api.useUtils()
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action?: () => void
    variant?: 'default' | 'destructive'
  }>({ open: false, title: '', description: '' })

  const { searchTerm, debouncedSearchTerm, updateSearchTerm, clearSearch } = useDebounceSearch()

  const deleteCommentMutation = api.comments.deleteComment.useMutation({
    onSuccess: () => {
      toast.success(t('admin.table.comments.delete-success'))
      utils.comments.getComments.invalidate()
    },
    onError: () => {
      toast.error(t('admin.table.comments.delete-error'))
    }
  })

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data

    return data.filter(
      (comment) =>
        comment.body?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        comment.userId?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        comment.type?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [data, debouncedSearchTerm])

  const handleDeleteComment = (commentId: string, commentBody: string) => {
    const truncatedBody = commentBody.length > 50 ? commentBody.slice(0, 50) + '...' : commentBody
    setConfirmDialog({
      open: true,
      title: 'Delete Comment',
      description: `Are you sure you want to delete this comment: "${truncatedBody}"? This action cannot be undone.`,
      variant: 'destructive',
      action: () => {
        deleteCommentMutation.mutate({ commentId })
        setConfirmDialog((prev) => ({ ...prev, open: false }))
      }
    })
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredData,
      `comments-${new Date().toISOString().split('T')[0]}`,
      COMMENT_EXPORT_COLUMNS
    )
    toast.success('Comments exported to CSV successfully')
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
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontalIcon className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <TrashIcon className='mr-2 h-4 w-4' />
                    {t('admin.table.comments.delete')}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('admin.modals.delete-confirmation.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('admin.table.comments.confirm-delete')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t('admin.modals.delete-confirmation.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteComment(comment.id, comment.body)}
                    >
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
    data: filteredData,
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
    <>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
              <Input
                placeholder='Search comments...'
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.target.value)}
                className='w-64 pl-8'
              />
              {searchTerm && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute right-1 top-1 h-6 w-6 p-0'
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
        loading={deleteCommentMutation.isPending}
      />
    </>
  )
}

export default CommentsTable
