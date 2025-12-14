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
        return <CheckCircle className='h-5 w-5 text-green-500' />
      case 'warning':
        return <AlertTriangle className='h-5 w-5 text-yellow-500' />
      case 'critical':
        return <XCircle className='h-5 w-5 text-red-500' />
      default:
        return <AlertCircle className='h-5 w-5 text-gray-500' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
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
          <div className='mb-4 h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-24 rounded bg-gray-200 dark:bg-gray-700'></div>
            ))}
          </div>
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='h-20 rounded bg-gray-200 dark:bg-gray-700'></div>
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
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>System Health</h1>
          <p className='text-gray-600 dark:text-gray-400'>Monitor system performance and health</p>
        </div>
        <div className='flex items-center gap-2'>
          <label className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
            <input
              type='checkbox'
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className='rounded border-gray-300 dark:border-gray-600'
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
        <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {getStatusIcon(healthData.overallStatus)}
              <div>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  System Status:{' '}
                  {healthData.overallStatus.charAt(0).toUpperCase() +
                    healthData.overallStatus.slice(1)}
                </h2>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Last checked: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            {statsData && (
              <div className='text-right'>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {formatUptime(statsData.health.uptime)}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>Uptime</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {statsData && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Healthy Checks
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {statsData.health.healthy}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-center'>
              <AlertTriangle className='h-8 w-8 text-yellow-500' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Warnings</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {statsData.health.warning}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-center'>
              <XCircle className='h-8 w-8 text-red-500' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Critical Issues
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {statsData.health.critical}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-center'>
              <AlertCircle className='h-8 w-8 text-blue-500' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Unresolved Errors
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {statsData.errors.unresolved}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Health Checks */}
      {healthData && (
        <div className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
          <div className='border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Service Health</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {healthData.checks.map((check, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${getStatusColor(check.status)}`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {getServiceIcon(check.type)}
                      <div>
                        <h4 className='font-medium capitalize'>{check.type.replace('_', ' ')}</h4>
                        <p className='text-sm opacity-75'>{check.message}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      {getStatusIcon(check.status)}
                      <div className='mt-1 text-xs'>{formatResponseTime(check.responseTime)}</div>
                    </div>
                  </div>
                  {check.details && Object.keys(check.details).length > 0 && (
                    <div className='mt-3 text-xs opacity-75'>
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
        <div className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
          <div className='border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Recent Errors</h3>
              <Button variant='outline' size='sm'>
                View All Errors
              </Button>
            </div>
          </div>
          <div className='divide-y divide-gray-200 dark:divide-gray-700'>
            {errorLogs.logs.slice(0, 5).map((error) => (
              <div key={error.id} className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${error.level === 'error'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : error.level === 'warning'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }`}
                      >
                        {error.level.toUpperCase()}
                      </span>
                      <span className='text-sm text-gray-500 dark:text-gray-400'>
                        {new Date(error.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className='mb-1 text-sm font-medium text-gray-900 dark:text-white'>
                      {error.message}
                    </p>
                    {error.url && (
                      <p className='mb-1 text-xs text-gray-500 dark:text-gray-400'>
                        URL: {error.url}
                      </p>
                    )}
                    {error.user && (
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
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
                    <summary className='cursor-pointer text-xs text-gray-500 dark:text-gray-400'>
                      Stack trace
                    </summary>
                    <pre className='mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900'>
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
      <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <h3 className='mb-4 text-lg font-medium text-gray-900 dark:text-white'>Health Trends</h3>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Last {filtered_history.length} checks
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-sm text-gray-600 dark:text-gray-400'>Filter</label>
              <select
                value={selected_check_type}
                onChange={(e) => set_selected_check_type(e.target.value)}
                className='h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
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
            <div className='rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900'>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Healthy</div>
              <div className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {history_stats.healthy}
              </div>
            </div>
            <div className='rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900'>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Warnings</div>
              <div className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {history_stats.warning}
              </div>
            </div>
            <div className='rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900'>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Critical</div>
              <div className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {history_stats.critical}
              </div>
            </div>
            <div className='rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900'>
              <div className='text-xs text-gray-600 dark:text-gray-400'>Unknown</div>
              <div className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {history_stats.unknown}
              </div>
            </div>
          </div>

          {filtered_history.length === 0 ? (
            <div className='flex h-40 items-center justify-center text-gray-500 dark:text-gray-400'>
              <div className='text-center'>
                <TrendingUp className='mx-auto mb-2 h-12 w-12 opacity-50' />
                <p>No health history yet</p>
                <p className='text-sm'>Trigger a refresh to record health checks</p>
              </div>
            </div>
          ) : (
            <div className='overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 text-left text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400'>
                  <tr>
                    <th className='px-3 py-2'>Time</th>
                    <th className='px-3 py-2'>Service</th>
                    <th className='px-3 py-2'>Status</th>
                    <th className='px-3 py-2'>Latency</th>
                    <th className='px-3 py-2'>Message</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 dark:divide-gray-800'>
                  {filtered_history.slice(0, 15).map((row) => (
                    <tr key={row.id} className='bg-white dark:bg-gray-950'>
                      <td className='px-3 py-2 text-gray-600 dark:text-gray-400'>
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className='px-3 py-2 font-medium text-gray-900 dark:text-gray-100'>
                        {row.checkType}
                      </td>
                      <td className='px-3 py-2'>
                        <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 ${getStatusColor(row.status)}`}>
                          {getStatusIcon(row.status)}
                          <span className='text-xs font-medium'>
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>
                        </span>
                      </td>
                      <td className='px-3 py-2 text-gray-600 dark:text-gray-400'>
                        {typeof row.responseTime === 'number' ? formatResponseTime(row.responseTime) : '—'}
                      </td>
                      <td className='px-3 py-2 text-gray-700 dark:text-gray-300'>{row.message}</td>
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
