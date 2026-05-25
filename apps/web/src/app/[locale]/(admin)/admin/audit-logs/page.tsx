'use client'

import { useTranslations } from '@isyuricunha/i18n/client'
import { DataTableSkeleton } from '@isyuricunha/ui'

import AdminPageHeader from '@/components/admin/admin-page-header'
import AuditLogsTable from '@/components/admin/audit-logs-table'
import { api } from '@/trpc/react'

const Page = () => {
  const t = useTranslations()
  const { status, data } = api.admin.getAuditLogs.useQuery()

  const isSuccess = status === 'success'
  const isLoading = status === 'pending'
  const isError = status === 'error'

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        title={t('admin.page-header.audit-logs.title')}
        description={t('admin.page-header.audit-logs.description')}
      />
      {isLoading ? <DataTableSkeleton columnCount={6} searchableColumnsCount={1} /> : null}
      {isError ? <div>{t('admin.audit-logs.failed-to-fetch')}</div> : null}
      {isSuccess ? <AuditLogsTable data={data.logs} /> : null}
    </div>
  )
}

export default Page
