'use client'

import { useState } from 'react'
import { Button } from '@tszhong0411/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Badge } from '@tszhong0411/ui'
import { Input } from '@tszhong0411/ui'
import { Label } from '@tszhong0411/ui'
import { Textarea } from '@tszhong0411/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@tszhong0411/ui'
import { Database, Download, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export default function DataManagement() {
  const [selectedTab, setSelectedTab] = useState('overview')

  // Data management stats query
  const { data: dataStats, isLoading: statsLoading } = api.dataManagement.getDataManagementStats.useQuery()

  // Database backups query
  const { data: backups, isLoading: backupsLoading } = api.dataManagement.getDatabaseBackups.useQuery({})

  // Data exports query
  const { data: exports, isLoading: exportsLoading } = api.dataManagement.getDataExports.useQuery({})

  // Mutations
  const createBackupMutation = api.dataManagement.createDatabaseBackup.useMutation({
    onSuccess: () => {
      toast.success('Database backup started successfully')
    },
    onError: (error) => {
      toast.error(`Failed to start backup: ${error.message}`)
    }
  })

  const createExportMutation = api.dataManagement.createDataExport.useMutation({
    onSuccess: () => {
      toast.success('Data export started successfully')
    },
    onError: (error) => {
      toast.error(`Failed to start export: ${error.message}`)
    }
  })

  const runQualityCheckMutation = api.dataManagement.runDataQualityCheck.useMutation({
    onSuccess: () => {
      toast.success('Data quality check started successfully')
    },
    onError: (error) => {
      toast.error(`Failed to start quality check: ${error.message}`)
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
    const format = formData.get('format') as 'csv' | 'json' | 'xml' | 'xlsx'
    const tablesInput = formData.get('tables') as string

    if (!name || !format || !tablesInput) {
      toast.error('Name, format, and tables are required')
      return
    }

    const tables = tablesInput.split(',').map(t => t.trim()).filter(Boolean)

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
      toast.error('Name, table name, and rules are required')
      return
    }

    // Parse rules from comma-separated format
    const rules = rulesInput.split(',').map(rule => {
      const [field, ruleType] = rule.trim().split(':')
      return {
        field: field?.trim(),
        rule: ruleType?.trim() as 'not_null' | 'unique' | 'format' | 'range'
      }
    }).filter(rule => rule.field && rule.rule).map(rule => ({
      field: rule.field!,
      rule: rule.rule
    }))

    if (rules.length === 0) {
      toast.error('Please provide valid rules in format: field:rule_type')
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
      case 'completed': return 'default'
      case 'in_progress': 
      case 'processing':
      case 'running': return 'secondary'
      case 'pending': return 'outline'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress':
      case 'processing':
      case 'running': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (statsLoading) {
    return <div className="p-6">Loading data management dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">Backup, export, and manage your data</p>
        </div>
      </div>

      {/* Data Management Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataStats?.backups.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dataStats?.backups.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(dataStats?.backups.totalSize || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataStats?.exports.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dataStats?.exports.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Exported</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dataStats?.exports.totalRecords || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total records processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Backups */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Backups</CardTitle>
                <CardDescription>Latest database backup activity</CardDescription>
              </CardHeader>
              <CardContent>
                {backupsLoading ? (
                  <div>Loading backups...</div>
                ) : (
                  <div className="space-y-3">
                    {backups?.backups.slice(0, 5).map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(backup.status)}
                          <Badge variant={getStatusColor(backup.status) as any}>
                            {backup.status}
                          </Badge>
                          <span className="text-sm">{backup.type} backup</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(backup.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No backups yet</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Exports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Exports</CardTitle>
                <CardDescription>Latest data export activity</CardDescription>
              </CardHeader>
              <CardContent>
                {exportsLoading ? (
                  <div>Loading exports...</div>
                ) : (
                  <div className="space-y-3">
                    {exports?.exports.slice(0, 5).map((exportItem) => (
                      <div key={exportItem.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(exportItem.status)}
                          <Badge variant={getStatusColor(exportItem.status) as any}>
                            {exportItem.status}
                          </Badge>
                          <span className="text-sm">{exportItem.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(exportItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No exports yet</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Create Backup Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Database Backup</CardTitle>
                <CardDescription>Backup your database for safety</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateBackup} className="space-y-4">
                  <div>
                    <Label htmlFor="backupType">Backup Type</Label>
                    <Select name="type" defaultValue="full">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Backup</SelectItem>
                        <SelectItem value="incremental">Incremental Backup</SelectItem>
                        <SelectItem value="differential">Differential Backup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backupDescription">Description (Optional)</Label>
                    <Input
                      id="backupDescription"
                      name="description"
                      placeholder="Pre-deployment backup"
                    />
                  </div>
                  <Button type="submit" disabled={createBackupMutation.isPending}>
                    {createBackupMutation.isPending ? 'Creating Backup...' : 'Create Backup'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Backups List */}
            <Card>
              <CardHeader>
                <CardTitle>Database Backups</CardTitle>
                <CardDescription>Your database backup history</CardDescription>
              </CardHeader>
              <CardContent>
                {backupsLoading ? (
                  <div>Loading backups...</div>
                ) : (
                  <div className="space-y-3">
                    {backups?.backups.map((backup) => (
                      <div key={backup.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(backup.status)}
                            <span className="font-medium">{backup.type} backup</span>
                          </div>
                          <Badge variant={getStatusColor(backup.status) as any}>
                            {backup.status}
                          </Badge>
                        </div>
                        {backup.name && (
                          <div className="text-sm text-muted-foreground mb-2">
                            {backup.name}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {backup.fileSize ? formatFileSize(backup.fileSize) : 'Size unknown'}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(backup.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {backup.completedAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Completed: {new Date(backup.completedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )) || <div className="text-center text-muted-foreground">No backups yet</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Create Export Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Data Export</CardTitle>
                <CardDescription>Export data in various formats</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleCreateExport} className="space-y-4">
                  <div>
                    <Label htmlFor="exportName">Export Name</Label>
                    <Input
                      id="exportName"
                      name="name"
                      placeholder="User Data Export"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="exportFormat">Format</Label>
                    <Select name="format" defaultValue="csv">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="exportTables">Tables (comma-separated)</Label>
                    <Input
                      id="exportTables"
                      name="tables"
                      placeholder="users, posts, comments"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createExportMutation.isPending}>
                    {createExportMutation.isPending ? 'Creating Export...' : 'Create Export'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Exports List */}
            <Card>
              <CardHeader>
                <CardTitle>Data Exports</CardTitle>
                <CardDescription>Your data export history</CardDescription>
              </CardHeader>
              <CardContent>
                {exportsLoading ? (
                  <div>Loading exports...</div>
                ) : (
                  <div className="space-y-3">
                    {exports?.exports.map((exportItem) => (
                      <div key={exportItem.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(exportItem.status)}
                            <span className="font-medium">{exportItem.name}</span>
                          </div>
                          <Badge variant={getStatusColor(exportItem.status) as any}>
                            {exportItem.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Format: {exportItem.format.toUpperCase()}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {exportItem.recordCount ? 
                              `${exportItem.recordCount.toLocaleString()} records` : 
                              'Processing...'
                            }
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(exportItem.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {exportItem.completedAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Completed: {new Date(exportItem.completedAt).toLocaleString()}
                          </div>
                        )}
                        {exportItem.fileSize && (
                          <div className="text-xs text-muted-foreground">
                            Size: {formatFileSize(exportItem.fileSize)}
                          </div>
                        )}
                      </div>
                    )) || <div className="text-center text-muted-foreground">No exports yet</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Run Quality Check Form */}
            <Card>
              <CardHeader>
                <CardTitle>Run Data Quality Check</CardTitle>
                <CardDescription>Validate data integrity and quality</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleRunQualityCheck} className="space-y-4">
                  <div>
                    <Label htmlFor="qualityCheckName">Check Name</Label>
                    <Input
                      id="qualityCheckName"
                      name="name"
                      placeholder="User Data Validation"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualityTableName">Table Name</Label>
                    <Input
                      id="qualityTableName"
                      name="tableName"
                      placeholder="users"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualityRules">Rules (field:rule_type)</Label>
                    <Textarea
                      id="qualityRules"
                      name="rules"
                      placeholder="email:not_null, email:format, id:unique"
                      rows={3}
                      required
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Available rules: not_null, unique, format, range
                    </div>
                  </div>
                  <Button type="submit" disabled={runQualityCheckMutation.isPending}>
                    {runQualityCheckMutation.isPending ? 'Running Check...' : 'Run Quality Check'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quality Check Results */}
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Overview</CardTitle>
                <CardDescription>Data quality metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Run a quality check to see results here</p>
                  <p className="text-sm mt-2">
                    Quality checks help identify data issues like missing values, 
                    duplicates, and format problems.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
