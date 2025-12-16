'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { Button } from '@isyuricunha/ui'
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Mail,
  Server,
  HardDrive,
  Globe,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

export const SystemHealthDashboard = () => {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [selected_check_type, set_selected_check_type] = useState<string>('all')
  const refresh_interval_ref = useRef<ReturnType<typeof setInterval> | null>(null)

  const utils = api.useUtils()

  // Fetch system health
  const {
    data: healthData,
    isLoading: healthLoading,
    refetch: refetchHealth
  } = api.system.getSystemHealth.useQuery()

  // Fetch system stats
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats
  } = api.system.getSystemStats.useQuery()

  // Fetch error logs
  const { data: errorLogs, refetch: refetchErrors } = api.system.getErrorLogs.useQuery({
    resolved: false,
    limit: 10
  })

  const resolveErrorMutation = api.system.resolveError.useMutation({
    onSuccess: async () => {
      toast.success('Error resolved')
      await utils.system.getErrorLogs.invalidate()
      await utils.system.getSystemStats.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to resolve error: ${error.message}`)
    }
  })

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) {
      if (refresh_interval_ref.current) {
        clearInterval(refresh_interval_ref.current)
        refresh_interval_ref.current = null
      }
      return
    }

    refresh_interval_ref.current = setInterval(() => {
      refetchHealth()
      refetchStats()
      refetchErrors()
    }, 30_000) // Refresh every 30 seconds

    return () => {
      if (refresh_interval_ref.current) {
        clearInterval(refresh_interval_ref.current)
        refresh_interval_ref.current = null
      }
    }
  }, [autoRefresh, refetchHealth, refetchStats, refetchErrors])

  const handleRefresh = () => {
    refetchHealth()
    refetchStats()
    refetchErrors()
    toast.success('System health refreshed')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='text-primary h-5 w-5' />
      case 'warning':
        return <AlertTriangle className='text-primary h-5 w-5' />
      case 'critical':
        return <XCircle className='text-destructive h-5 w-5' />
      default:
        return <AlertCircle className='text-muted-foreground h-5 w-5' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-primary bg-primary/10'
      case 'warning':
        return 'text-primary bg-primary/10'
      case 'critical':
        return 'text-destructive bg-destructive/10'
      default:
        return 'text-muted-foreground bg-muted/30'
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className='h-6 w-6' />
      case 'email':
        return <Mail className='h-6 w-6' />
      case 'api':
        return <Server className='h-6 w-6' />
      case 'storage':
        return <HardDrive className='h-6 w-6' />
      case 'external_service':
        return <Globe className='h-6 w-6' />
      default:
        return <Activity className='h-6 w-6' />
    }
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatUptime = (percentage: number) => {
    return `${percentage.toFixed(2)}%`
  }

  const history = useMemo(() => {
    return healthData?.history ?? []
  }, [healthData?.history])

  const available_check_types = useMemo(() => {
    const set = new Set<string>()
    for (const row of history) {
      if (row?.checkType) {
        set.add(row.checkType)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [history])

  const filtered_history = useMemo(() => {
    if (selected_check_type === 'all') return history
    return history.filter((row) => row.checkType === selected_check_type)
  }, [history, selected_check_type])

  const history_stats = useMemo(() => {
    const stats = {
      healthy: 0,
      warning: 0,
      critical: 0,
      unknown: 0
    }

    for (const row of filtered_history) {
      switch (row.status) {
        case 'healthy':
          stats.healthy += 1
          break
        case 'warning':
          stats.warning += 1
          break
        case 'critical':
          stats.critical += 1
          break
        default:
          stats.unknown += 1
          break
      }
    }

    return stats
  }, [filtered_history])

  if (healthLoading || statsLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='bg-muted mb-4 h-8 w-1/4 rounded'></div>
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='bg-muted h-24 rounded'></div>
            ))}
          </div>
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='bg-muted h-20 rounded'></div>
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
          <h1 className='text-2xl font-bold'>System Health</h1>
          <p className='text-muted-foreground'>Monitor system performance and health</p>
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-muted-foreground flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className='border-border rounded'
            />
            Auto-refresh (30s)
          </label>
          <Button onClick={handleRefresh} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthData && (
        <div className='bg-card border-border rounded-lg border p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {getStatusIcon(healthData.overallStatus)}
              <div>
                <h2 className='text-lg font-semibold'>
                  System Status:{' '}
                  {healthData.overallStatus.charAt(0).toUpperCase() +
                    healthData.overallStatus.slice(1)}
                </h2>
                <p className='text-muted-foreground text-sm'>
                  Last checked: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            {statsData && (
              <div className='text-right'>
                <div className='text-2xl font-bold'>{formatUptime(statsData.health.uptime)}</div>
                <div className='text-muted-foreground text-sm'>Uptime</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {statsData && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='bg-card border-border rounded-lg border p-6'>
            <div className='flex items-center'>
              <CheckCircle className='text-primary h-8 w-8' />
              <div className='ml-4'>
                <p className='text-muted-foreground text-sm font-medium'>Healthy Checks</p>
                <p className='text-2xl font-bold'>{statsData.health.healthy}</p>
              </div>
            </div>
          </div>

          <div className='bg-card border-border rounded-lg border p-6'>
            <div className='flex items-center'>
              <AlertTriangle className='text-primary h-8 w-8' />
              <div className='ml-4'>
                <p className='text-muted-foreground text-sm font-medium'>Warnings</p>
                <p className='text-2xl font-bold'>{statsData.health.warning}</p>
              </div>
            </div>
          </div>

          <div className='bg-card border-border rounded-lg border p-6'>
            <div className='flex items-center'>
              <XCircle className='text-destructive h-8 w-8' />
              <div className='ml-4'>
                <p className='text-muted-foreground text-sm font-medium'>Critical Issues</p>
                <p className='text-2xl font-bold'>{statsData.health.critical}</p>
              </div>
            </div>
          </div>

          <div className='bg-card border-border rounded-lg border p-6'>
            <div className='flex items-center'>
              <AlertCircle className='text-primary h-8 w-8' />
              <div className='ml-4'>
                <p className='text-muted-foreground text-sm font-medium'>Unresolved Errors</p>
                <p className='text-2xl font-bold'>{statsData.errors.unresolved}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Health Checks */}
      {healthData && (
        <div className='bg-card border-border rounded-lg border'>
          <div className='border-border border-b px-6 py-4'>
            <h3 className='text-lg font-medium'>Service Health</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {healthData.checks.map((check, index) => (
                <div
                  key={index}
                  className={`border-border rounded-lg border p-4 ${getStatusColor(check.status)}`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {getServiceIcon(check.type)}
                      <div>
                        <h4 className='font-medium capitalize'>{check.type.replace('_', ' ')}</h4>
                        <p className='text-muted-foreground text-sm'>{check.message}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      {getStatusIcon(check.status)}
                      <div className='mt-1 text-xs'>{formatResponseTime(check.responseTime)}</div>
                    </div>
                  </div>
                  {check.details && Object.keys(check.details).length > 0 && (
                    <div className='text-muted-foreground mt-3 text-xs'>
                      <pre className='whitespace-pre-wrap'>
                        {JSON.stringify(check.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Errors */}
      {errorLogs && errorLogs.logs.length > 0 && (
        <div className='bg-card border-border rounded-lg border'>
          <div className='border-border border-b px-6 py-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Recent Errors</h3>
              <Button variant='outline' size='sm'>
                View All Errors
              </Button>
            </div>
          </div>
          <div className='divide-border divide-y'>
            {errorLogs.logs.slice(0, 5).map((error) => (
              <div key={error.id} className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          error.level === 'error'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {error.level.toUpperCase()}
                      </span>
                      <span className='text-muted-foreground text-sm'>
                        {new Date(error.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className='mb-1 text-sm font-medium'>{error.message}</p>
                    {error.url && (
                      <p className='text-muted-foreground mb-1 text-xs'>URL: {error.url}</p>
                    )}
                    {error.user && (
                      <p className='text-muted-foreground text-xs'>
                        User: {error.user.name} ({error.user.email})
                      </p>
                    )}
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    isPending={resolveErrorMutation.isPending}
                    onClick={() => resolveErrorMutation.mutate({ errorId: error.id })}
                  >
                    Resolve
                  </Button>
                </div>
                {error.stack && (
                  <details className='mt-3'>
                    <summary className='text-muted-foreground cursor-pointer text-xs'>
                      Stack trace
                    </summary>
                    <pre className='bg-muted mt-2 overflow-x-auto rounded p-2 text-xs'>
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health History Chart Placeholder */}
      <div className='bg-card border-border rounded-lg border p-6'>
        <h3 className='mb-4 text-lg font-medium'>Health Trends</h3>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='text-muted-foreground text-sm'>
              Last {filtered_history.length} checks
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-muted-foreground text-sm'>Filter</label>
              <select
                value={selected_check_type}
                onChange={(e) => set_selected_check_type(e.target.value)}
                className='bg-background border-border text-foreground h-9 rounded-md border px-3 text-sm'
              >
                <option value='all'>All services</option>
                {available_check_types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            <div className='bg-background border-border rounded-md border p-3'>
              <div className='text-muted-foreground text-xs'>Healthy</div>
              <div className='text-foreground text-lg font-semibold'>{history_stats.healthy}</div>
            </div>
            <div className='bg-background border-border rounded-md border p-3'>
              <div className='text-muted-foreground text-xs'>Warnings</div>
              <div className='text-foreground text-lg font-semibold'>{history_stats.warning}</div>
            </div>
            <div className='bg-background border-border rounded-md border p-3'>
              <div className='text-muted-foreground text-xs'>Critical</div>
              <div className='text-foreground text-lg font-semibold'>{history_stats.critical}</div>
            </div>
            <div className='bg-background border-border rounded-md border p-3'>
              <div className='text-muted-foreground text-xs'>Unknown</div>
              <div className='text-foreground text-lg font-semibold'>{history_stats.unknown}</div>
            </div>
          </div>

          {filtered_history.length === 0 ? (
            <div className='text-muted-foreground flex h-40 items-center justify-center'>
              <div className='text-center'>
                <TrendingUp className='mx-auto mb-2 h-12 w-12 opacity-50' />
                <p>No health history yet</p>
                <p className='text-sm'>Trigger a refresh to record health checks</p>
              </div>
            </div>
          ) : (
            <div className='border-border overflow-x-auto rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted text-muted-foreground text-left text-xs'>
                  <tr>
                    <th className='px-3 py-2'>Time</th>
                    <th className='px-3 py-2'>Service</th>
                    <th className='px-3 py-2'>Status</th>
                    <th className='px-3 py-2'>Latency</th>
                    <th className='px-3 py-2'>Message</th>
                  </tr>
                </thead>
                <tbody className='divide-border divide-y'>
                  {filtered_history.slice(0, 15).map((row) => (
                    <tr key={row.id} className='bg-background'>
                      <td className='text-muted-foreground px-3 py-2'>
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className='text-foreground px-3 py-2 font-medium'>{row.checkType}</td>
                      <td className='px-3 py-2'>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 ${getStatusColor(row.status)}`}
                        >
                          {getStatusIcon(row.status)}
                          <span className='text-xs font-medium'>
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>
                        </span>
                      </td>
                      <td className='text-muted-foreground px-3 py-2'>
                        {typeof row.responseTime === 'number'
                          ? formatResponseTime(row.responseTime)
                          : '—'}
                      </td>
                      <td className='text-muted-foreground px-3 py-2'>{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
