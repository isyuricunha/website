'use client'

import { DataTableSkeleton } from '@isyuricunha/ui'

import AdminPageHeader from '@/components/admin/admin-page-header'
import AuditLogsTable from '@/components/admin/audit-logs-table'
import { api } from '@/trpc/react'

const Page = () => {
  const { status, data } = api.admin.getAuditLogs.useQuery()

  const isSuccess = status === 'success'
  const isLoading = status === 'pending'
  const isError = status === 'error'

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        title='Audit Logs'
        description='Review administrative actions and system changes.'
      />
      {isLoading ? <DataTableSkeleton columnCount={6} searchableColumnsCount={1} /> : null}
      {isError ? <div>Failed to fetch audit logs.</div> : null}
      {isSuccess ? <AuditLogsTable data={data.logs} /> : null}
    </div>
  )
}

export default Page
