'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@isyuricunha/ui'

import { Database, Download, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export default function DataManagement() {
  const t = useTranslations('admin.data-management')
  const [selectedTab, setSelectedTab] = useState('overview')

  // Data management stats query
  const { data: dataStats, isLoading: statsLoading } =
    api.dataManagement.getDataManagementStats.useQuery()

  // Database backups query
  const { data: backups, isLoading: backupsLoading } =
    api.dataManagement.getDatabaseBackups.useQuery({})

  // Data exports query
  const { data: exports, isLoading: exportsLoading } = api.dataManagement.getDataExports.useQuery(
    {}
  )

  // Mutations
  const createBackupMutation = api.dataManagement.createDatabaseBackup.useMutation({
    onSuccess: () => {
      toast.success(t('messages.backup-started'))
    },
    onError: (error) => {
      toast.error(t('messages.backup-failed', { message: error.message }))
    }
  })

  const createExportMutation = api.dataManagement.createDataExport.useMutation({
    onSuccess: () => {
      toast.success(t('messages.export-started'))
    },
    onError: (error) => {
      toast.error(t('messages.export-failed', { message: error.message }))
    }
  })

  const runQualityCheckMutation = api.dataManagement.runDataQualityCheck.useMutation({
    onSuccess: () => {
      toast.success(t('messages.quality-started'))
    },
    onError: (error) => {
      toast.error(t('messages.quality-failed', { message: error.message }))
    }
  })

  const handleCreateBackup = (formData: FormData) => {
    const type = formData.get('type') as 'full' | 'incremental' | 'differential'
    const description = formData.get('description') as string

    createBackupMutation.mutate({
      type,
      description: description || undefined
    })
  }

  const handleCreateExport = (formData: FormData) => {
    const name = formData.get('name') as string
    const format = formData.get('format') as 'csv' | 'json' | 'xml' | 'sql' | 'excel'
    const tablesInput = formData.get('tables') as string

    if (!name || !format || !tablesInput) {
      toast.error(t('messages.export-required'))
      return
    }

    const tables = tablesInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    createExportMutation.mutate({
      name,
      format,
      tables
    })
  }

  const handleRunQualityCheck = (formData: FormData) => {
    const name = formData.get('name') as string
    const tableName = formData.get('tableName') as string
    const rulesInput = formData.get('rules') as string

    if (!name || !tableName || !rulesInput) {
      toast.error(t('messages.quality-required'))
      return
    }

    // Parse rules from comma-separated format
    const rules = rulesInput
      .split(',')
      .map((rule) => {
        const [field, ruleType] = rule.trim().split(':')
        return {
          field: field?.trim(),
          rule: ruleType?.trim() as 'not_null' | 'unique' | 'format' | 'range'
        }
      })
      .filter((rule) => rule.field && rule.rule)
      .map((rule) => ({
        field: rule.field!,
        rule: rule.rule
      }))

    if (rules.length === 0) {
      toast.error(t('messages.rules-invalid'))
      return
    }

    runQualityCheckMutation.mutate({
      name,
      tableName,
      checkRules: rules
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in_progress':
      case 'processing':
      case 'running':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4' />
      case 'in_progress':
      case 'processing':
      case 'running':
        return <Clock className='h-4 w-4' />
      case 'failed':
        return <AlertCircle className='h-4 w-4' />
      default:
        return <Clock className='h-4 w-4' />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return t('file-size.zero')
    const k = 1024
    const sizes = [t('file-size.bytes'), 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t('status.completed')
      case 'in_progress':
        return t('status.in-progress')
      case 'processing':
        return t('status.processing')
      case 'running':
        return t('status.running')
      case 'pending':
        return t('status.pending')
      case 'failed':
        return t('status.failed')
      default:
        return status
    }
  }

  const getBackupTypeLabel = (type: string) => {
    switch (type) {
      case 'full':
        return t('backup-types.full')
      case 'incremental':
        return t('backup-types.incremental')
      case 'differential':
        return t('backup-types.differential')
      default:
        return type
    }
  }

  if (statsLoading) {
    return <div className='p-6'>{t('loading')}</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-medium'>{t('title')}</h1>
          <p className='text-text-secondary'>{t('description')}</p>
        </div>
      </div>

      {/* Data Management Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.database-backups')}</CardTitle>
            <Database className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{dataStats?.backups.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.completed-count', { count: dataStats?.backups.completed || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.backup-size')}</CardTitle>
            <Database className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>
              {formatFileSize(dataStats?.backups.totalSize || 0)}
            </div>
            <p className='text-text-secondary text-xs'>{t('stats.total-storage-used')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.data-exports')}</CardTitle>
            <Download className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{dataStats?.exports.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.completed-count', { count: dataStats?.exports.completed || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.records-exported')}</CardTitle>
            <Upload className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>
              {(dataStats?.exports.totalRecords || 0).toLocaleString()}
            </div>
            <p className='text-text-secondary text-xs'>{t('stats.total-records-processed')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value='backups'>{t('tabs.backups')}</TabsTrigger>
          <TabsTrigger value='exports'>{t('tabs.exports')}</TabsTrigger>
          <TabsTrigger value='quality'>{t('tabs.quality')}</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Recent Backups */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.recent-backups.title')}</CardTitle>
                <CardDescription>{t('overview.recent-backups.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {backupsLoading ? (
                  <div>{t('backups.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {backups?.backups.slice(0, 5).map((backup) => (
                      <div key={backup.id} className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          {getStatusIcon(backup.status)}
                          <Badge variant={getStatusColor(backup.status)}>
                            {getStatusLabel(backup.status)}
                          </Badge>
                          <span className='text-sm'>
                            {t('backups.backup-label', { type: getBackupTypeLabel(backup.type) })}
                          </span>
                        </div>
                        <span className='text-text-secondary text-xs'>
                          {new Date(backup.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )) || <div className='text-text-secondary text-sm'>{t('backups.empty')}</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Exports */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.recent-exports.title')}</CardTitle>
                <CardDescription>{t('overview.recent-exports.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {exportsLoading ? (
                  <div>{t('exports.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {exports?.exports.slice(0, 5).map((exportItem) => (
                      <div key={exportItem.id} className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          {getStatusIcon(exportItem.status)}
                          <Badge variant={getStatusColor(exportItem.status)}>
                            {getStatusLabel(exportItem.status)}
                          </Badge>
                          <span className='text-sm'>{exportItem.name}</span>
                        </div>
                        <span className='text-text-secondary text-xs'>
                          {new Date(exportItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )) || <div className='text-text-secondary text-sm'>{t('exports.empty')}</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='backups' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Create Backup Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('backups.create-title')}</CardTitle>
                <CardDescription>{t('backups.create-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateBackup} className='space-y-4'>
                  <div>
                    <Label htmlFor='backupType'>{t('fields.backup-type')}</Label>
                    <Select name='type' defaultValue='full'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='full'>{t('backup-types.full-backup')}</SelectItem>
                        <SelectItem value='incremental'>
                          {t('backup-types.incremental-backup')}
                        </SelectItem>
                        <SelectItem value='differential'>
                          {t('backup-types.differential-backup')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='backupDescription'>{t('fields.description-optional')}</Label>
                    <Input
                      id='backupDescription'
                      name='description'
                      placeholder={t('fields.backup-description-placeholder')}
                    />
                  </div>
                  <Button type='submit' disabled={createBackupMutation.isPending}>
                    {createBackupMutation.isPending
                      ? t('actions.creating-backup')
                      : t('actions.create-backup')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Backups List */}
            <Card>
              <CardHeader>
                <CardTitle>{t('backups.list-title')}</CardTitle>
                <CardDescription>{t('backups.list-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {backupsLoading ? (
                  <div>{t('backups.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {backups?.backups.map((backup) => (
                      <div key={backup.id} className='rounded border p-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            {getStatusIcon(backup.status)}
                            <span className='font-medium'>
                              {t('backups.backup-label', {
                                type: getBackupTypeLabel(backup.type)
                              })}
                            </span>
                          </div>
                          <Badge variant={getStatusColor(backup.status)}>
                            {getStatusLabel(backup.status)}
                          </Badge>
                        </div>
                        {backup.name && (
                          <div className='text-text-secondary mb-2 text-sm'>{backup.name}</div>
                        )}
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-text-secondary'>
                            {backup.fileSize
                              ? formatFileSize(backup.fileSize)
                              : t('file-size.unknown')}
                          </span>
                          <span className='text-text-secondary'>
                            {new Date(backup.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {backup.completedAt && (
                          <div className='text-text-secondary mt-1 text-xs'>
                            {t('date.completed', {
                              date: new Date(backup.completedAt).toLocaleString()
                            })}
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className='text-text-secondary text-center'>{t('backups.empty')}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='exports' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Create Export Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('exports.create-title')}</CardTitle>
                <CardDescription>{t('exports.create-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateExport} className='space-y-4'>
                  <div>
                    <Label htmlFor='exportName'>{t('fields.export-name')}</Label>
                    <Input
                      id='exportName'
                      name='name'
                      placeholder={t('fields.export-name-placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='exportFormat'>{t('fields.format')}</Label>
                    <Select name='format' defaultValue='csv'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='csv'>CSV</SelectItem>
                        <SelectItem value='json'>JSON</SelectItem>
                        <SelectItem value='xml'>XML</SelectItem>
                        <SelectItem value='excel'>Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='exportTables'>{t('fields.tables')}</Label>
                    <Input
                      id='exportTables'
                      name='tables'
                      placeholder={t('fields.tables-placeholder')}
                      required
                    />
                  </div>
                  <Button type='submit' disabled={createExportMutation.isPending}>
                    {createExportMutation.isPending
                      ? t('actions.creating-export')
                      : t('actions.create-export')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Exports List */}
            <Card>
              <CardHeader>
                <CardTitle>{t('exports.list-title')}</CardTitle>
                <CardDescription>{t('exports.list-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {exportsLoading ? (
                  <div>{t('exports.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {exports?.exports.map((exportItem) => (
                      <div key={exportItem.id} className='rounded border p-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            {getStatusIcon(exportItem.status)}
                            <span className='font-medium'>{exportItem.name}</span>
                          </div>
                          <Badge variant={getStatusColor(exportItem.status)}>
                            {getStatusLabel(exportItem.status)}
                          </Badge>
                        </div>
                        <div className='text-text-secondary mb-2 text-sm'>
                          {t('exports.format', { format: exportItem.format.toUpperCase() })}
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-text-secondary'>
                            {exportItem.recordCount
                              ? t('exports.records', {
                                  count: exportItem.recordCount.toLocaleString()
                                })
                              : t('exports.processing')}
                          </span>
                          <span className='text-text-secondary'>
                            {new Date(exportItem.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {exportItem.completedAt && (
                          <div className='text-text-secondary mt-1 text-xs'>
                            {t('date.completed', {
                              date: new Date(exportItem.completedAt).toLocaleString()
                            })}
                          </div>
                        )}
                        {exportItem.fileSize && (
                          <div className='text-text-secondary text-xs'>
                            {t('file-size.size', { size: formatFileSize(exportItem.fileSize) })}
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className='text-text-secondary text-center'>{t('exports.empty')}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='quality' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Run Quality Check Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quality.create-title')}</CardTitle>
                <CardDescription>{t('quality.create-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleRunQualityCheck} className='space-y-4'>
                  <div>
                    <Label htmlFor='qualityCheckName'>{t('fields.check-name')}</Label>
                    <Input
                      id='qualityCheckName'
                      name='name'
                      placeholder={t('fields.check-name-placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='qualityTableName'>{t('fields.table-name')}</Label>
                    <Input
                      id='qualityTableName'
                      name='tableName'
                      placeholder={t('fields.table-name-placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='qualityRules'>{t('fields.rules')}</Label>
                    <Textarea
                      id='qualityRules'
                      name='rules'
                      placeholder={t('fields.rules-placeholder')}
                      rows={3}
                      required
                    />
                    <div className='text-text-secondary mt-1 text-xs'>{t('fields.rules-help')}</div>
                  </div>
                  <Button type='submit' disabled={runQualityCheckMutation.isPending}>
                    {runQualityCheckMutation.isPending
                      ? t('actions.running-check')
                      : t('actions.run-quality-check')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quality Check Results */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quality.overview-title')}</CardTitle>
                <CardDescription>{t('quality.overview-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-text-secondary py-8 text-center'>
                  <CheckCircle className='mx-auto mb-4 h-12 w-12 opacity-50' />
                  <p>{t('quality.empty-title')}</p>
                  <p className='mt-2 text-sm'>{t('quality.empty-description')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
