'use client'

import type { RouterOutputs } from '@/trpc/react'

import {
    type ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table'
import {
    Badge,
    DataTable,
    DataTableColumnHeader,
    type DataTableFilterField,
    DataTableToolbar,
    Input
} from '@isyuricunha/ui'
import { Search } from 'lucide-react'
import { useMemo } from 'react'

import { useDebounceSearch } from '@/hooks/use-debounced-search'

type AuditLog = RouterOutputs['admin']['getAuditLogs']['logs'][number]

type AuditLogsTableProps = {
    data: AuditLog[]
}

const AuditLogsTable = (props: AuditLogsTableProps) => {
    const { data } = props

    const { searchTerm, debouncedSearchTerm, updateSearchTerm } = useDebounceSearch()

    const filteredData = useMemo(() => {
        if (!debouncedSearchTerm) return data

        const query = debouncedSearchTerm.toLowerCase()

        return data.filter((log) => {
            const createdAt = log.createdAt ? new Date(log.createdAt).toLocaleString() : ''
            const details = log.details ? JSON.stringify(log.details) : ''

            return (
                log.action.toLowerCase().includes(query) ||
                (log.targetType ?? '').toLowerCase().includes(query) ||
                (log.targetId ?? '').toLowerCase().includes(query) ||
                (log.adminUser?.email ?? '').toLowerCase().includes(query) ||
                (log.adminUser?.name ?? '').toLowerCase().includes(query) ||
                (log.ipAddress ?? '').toLowerCase().includes(query) ||
                (log.userAgent ?? '').toLowerCase().includes(query) ||
                createdAt.toLowerCase().includes(query) ||
                details.toLowerCase().includes(query)
            )
        })
    }, [data, debouncedSearchTerm])

    const columns: Array<ColumnDef<AuditLog>> = [
        {
            accessorKey: 'createdAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Created At' />,
            cell: ({ row }) => <>{new Date(row.original.createdAt).toLocaleString()}</>
        },
        {
            accessorKey: 'action',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Action' />,
            cell: ({ row }) => <Badge variant='secondary'>{row.original.action}</Badge>
        },
        {
            accessorKey: 'adminUser.email',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Admin' />,
            cell: ({ row }) => <>{row.original.adminUser.email}</>
        },
        {
            accessorKey: 'targetType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Target Type' />
        },
        {
            accessorKey: 'targetId',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Target ID' />
        },
        {
            accessorKey: 'ipAddress',
            header: ({ column }) => <DataTableColumnHeader column={column} title='IP Address' />
        }
    ]

    const filterFields: Array<DataTableFilterField<AuditLog>> = [
        {
            id: 'action',
            label: 'Action',
            placeholder: 'Filter actions...'
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
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                    <div className='relative'>
                        <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                        <Input
                            placeholder='Search audit logs...'
                            value={searchTerm}
                            onChange={(e) => updateSearchTerm(e.target.value)}
                            className='w-80 pl-8'
                        />
                    </div>
                </div>
            </div>

            <DataTable table={table}>
                <DataTableToolbar table={table} filterFields={filterFields} />
            </DataTable>
        </div>
    )
}

export default AuditLogsTable
