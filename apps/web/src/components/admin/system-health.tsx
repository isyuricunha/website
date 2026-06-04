'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@isyuricunha/ui'
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
import { useTranslations } from '@isyuricunha/i18n/client'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export const SystemHealthDashboard = () => {
  const t = useTranslations('admin.system-health')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [selected_check_type, set_selected_check_type] = useState<string>('all')
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [lastCheckedAt, setLastCheckedAt] = useState(() => new Date().toLocaleString())

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
      toast.success(t('messages.error-resolved'))
      await utils.system.getErrorLogs.invalidate()
      await utils.system.getSystemStats.invalidate()
    },
    onError: (error) => {
      toast.error(t('messages.resolve-error-failed', { message: error.message }))
    }
  })

  const resolveAllErrorsMutation = api.system.resolveAllErrors.useMutation({
    onSuccess: async () => {
      toast.success(t('messages.all-errors-resolved'))
      await utils.system.getErrorLogs.invalidate()
      await utils.system.getSystemStats.invalidate()
    },
    onError: (error) => {
      toast.error(t('messages.resolve-all-errors-failed', { message: error.message }))
    }
  })

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      return
    }

    refreshIntervalRef.current = setInterval(() => {
      refetchHealth()
      refetchStats()
      refetchErrors()
      setLastCheckedAt(new Date().toLocaleString())
    }, 30_000) // Refresh every 30 seconds

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [autoRefresh, refetchHealth, refetchStats, refetchErrors])

  const handleRefresh = () => {
    refetchHealth()
    refetchStats()
    refetchErrors()
    setLastCheckedAt(new Date().toLocaleString())
    toast.success(t('messages.refreshed'))
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy':
        return t('status.healthy')
      case 'warning':
        return t('status.warning')
      case 'critical':
        return t('status.critical')
      default:
        return t('status.unknown')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='text-status-success h-5 w-5' />
      case 'warning':
        return <AlertTriangle className='text-accent-gold h-5 w-5' />
      case 'critical':
        return <XCircle className='text-status-danger h-5 w-5' />
      default:
        return <AlertCircle className='text-text-secondary h-5 w-5' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-status-success bg-status-success-soft'
      case 'warning':
        return 'text-accent-gold bg-action-primary-soft'
      case 'critical':
        return 'text-status-danger bg-status-danger-soft'
      default:
        return 'text-text-secondary bg-bg-surface'
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
    return Array.from(set).toSorted((a, b) => a.localeCompare(b))
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
          <div className='bg-bg-hover mb-4 h-8 w-1/4 rounded'></div>
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='bg-bg-hover h-24 rounded'></div>
            ))}
          </div>
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='bg-bg-hover h-20 rounded'></div>
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
          <h1 className='text-2xl font-medium'>{t('title')}</h1>
          <p className='text-text-secondary'>{t('description')}</p>
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-text-secondary flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className='rounded border-[var(--border-subtle)]'
            />
            {t('auto-refresh')}
          </label>
          <Button onClick={handleRefresh} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            {t('actions.refresh')}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthData && (
        <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {getStatusIcon(healthData.overallStatus)}
              <div>
                <h2 className='text-lg font-medium'>
                  {t('overall.status', { status: getStatusLabel(healthData.overallStatus) })}
                </h2>
                <p className='text-text-secondary text-sm'>
                  {t('overall.last-checked', { date: lastCheckedAt })}
                </p>
              </div>
            </div>
            {statsData && (
              <div className='text-right'>
                <div className='text-2xl font-medium'>{formatUptime(statsData.health.uptime)}</div>
                <div className='text-text-secondary text-sm'>{t('overall.uptime')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {statsData && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6'>
            <div className='flex items-center'>
              <CheckCircle className='text-status-success h-8 w-8' />
              <div className='ml-4'>
                <p className='text-text-secondary text-sm font-medium'>
                  {t('stats.healthy-checks')}
                </p>
                <p className='text-2xl font-medium'>{statsData.health.healthy}</p>
              </div>
            </div>
          </div>

          <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6'>
            <div className='flex items-center'>
              <AlertTriangle className='text-accent-gold h-8 w-8' />
              <div className='ml-4'>
                <p className='text-text-secondary text-sm font-medium'>{t('stats.warnings')}</p>
                <p className='text-2xl font-medium'>{statsData.health.warning}</p>
              </div>
            </div>
          </div>

          <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6'>
            <div className='flex items-center'>
              <XCircle className='text-status-danger h-8 w-8' />
              <div className='ml-4'>
                <p className='text-text-secondary text-sm font-medium'>
                  {t('stats.critical-issues')}
                </p>
                <p className='text-2xl font-medium'>{statsData.health.critical}</p>
              </div>
            </div>
          </div>

          <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6'>
            <div className='flex items-center'>
              <AlertCircle className='text-status-danger h-8 w-8' />
              <div className='ml-4'>
                <p className='text-text-secondary text-sm font-medium'>
                  {t('stats.unresolved-errors')}
                </p>
                <p className='text-2xl font-medium'>{statsData.errors.unresolved}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Health Checks */}
      {healthData && (
        <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)]'>
          <div className='border-b border-[var(--border-subtle)] px-6 py-4'>
            <h3 className='text-lg font-medium'>{t('service-health.title')}</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {healthData.checks.map((check, index) => (
                <div
                  key={index}
                  className={`rounded-lg border border-[var(--border-subtle)] p-4 ${getStatusColor(check.status)}`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {getServiceIcon(check.type)}
                      <div>
                        <h4 className='font-medium capitalize'>{check.type.replace('_', ' ')}</h4>
                        <p className='text-text-secondary text-sm'>{check.message}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      {getStatusIcon(check.status)}
                      <div className='mt-1 text-xs'>{formatResponseTime(check.responseTime)}</div>
                    </div>
                  </div>
                  {check.details && Object.keys(check.details).length > 0 && (
                    <div className='text-text-secondary mt-3 text-xs'>
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
        <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)]'>
          <div className='border-b border-[var(--border-subtle)] px-6 py-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>{t('recent-errors.title')}</h3>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  isPending={resolveAllErrorsMutation.isPending}
                  disabled={resolveAllErrorsMutation.isPending}
                  onClick={() => resolveAllErrorsMutation.mutate()}
                >
                  {t('actions.resolve-all')}
                </Button>
                <Button variant='outline' size='sm'>
                  {t('actions.view-all-errors')}
                </Button>
              </div>
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
                            ? 'bg-status-danger-soft text-status-danger'
                            : 'text-accent-gold bg-action-primary-soft'
                        }`}
                      >
                        {error.level.toUpperCase()}
                      </span>
                      <span className='text-text-secondary text-sm'>
                        {new Date(error.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className='mb-1 text-sm font-medium'>{error.message}</p>
                    {error.url && (
                      <p className='text-text-secondary mb-1 text-xs'>
                        {t('recent-errors.url', { url: error.url })}
                      </p>
                    )}
                    {error.user && (
                      <p className='text-text-secondary text-xs'>
                        {t('recent-errors.user', {
                          name: error.user.name,
                          email: error.user.email
                        })}
                      </p>
                    )}
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    isPending={resolveErrorMutation.isPending}
                    onClick={() => resolveErrorMutation.mutate({ errorId: error.id })}
                  >
                    {t('actions.resolve')}
                  </Button>
                </div>
                {error.stack && (
                  <details className='mt-3'>
                    <summary className='text-text-secondary cursor-pointer text-xs'>
                      {t('recent-errors.stack-trace')}
                    </summary>
                    <pre className='bg-bg-hover mt-2 overflow-x-auto rounded p-2 text-xs'>
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
      <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-6'>
        <h3 className='mb-4 text-lg font-medium'>{t('trends.title')}</h3>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='text-text-secondary text-sm'>
              {t('trends.last-checks', { count: filtered_history.length })}
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-text-secondary text-sm'>{t('trends.filter')}</label>
              <Select value={selected_check_type} onValueChange={set_selected_check_type}>
                <SelectTrigger className='bg-bg-base text-text-primary h-9 rounded-md border border-[var(--border-subtle)] px-3 text-sm'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('trends.all-services')}</SelectItem>
                  {available_check_types.map((checkType) => (
                    <SelectItem key={checkType} value={checkType}>
                      {checkType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            <div className='bg-bg-base rounded-md border border-[var(--border-subtle)] p-3'>
              <div className='text-text-secondary text-xs'>{t('trends.stats.healthy')}</div>
              <div className='text-text-primary text-lg font-medium'>{history_stats.healthy}</div>
            </div>
            <div className='bg-bg-base rounded-md border border-[var(--border-subtle)] p-3'>
              <div className='text-text-secondary text-xs'>{t('trends.stats.warnings')}</div>
              <div className='text-text-primary text-lg font-medium'>{history_stats.warning}</div>
            </div>
            <div className='bg-bg-base rounded-md border border-[var(--border-subtle)] p-3'>
              <div className='text-text-secondary text-xs'>{t('trends.stats.critical')}</div>
              <div className='text-text-primary text-lg font-medium'>{history_stats.critical}</div>
            </div>
            <div className='bg-bg-base rounded-md border border-[var(--border-subtle)] p-3'>
              <div className='text-text-secondary text-xs'>{t('trends.stats.unknown')}</div>
              <div className='text-text-primary text-lg font-medium'>{history_stats.unknown}</div>
            </div>
          </div>

          {filtered_history.length === 0 ? (
            <div className='text-text-secondary flex h-40 items-center justify-center'>
              <div className='text-center'>
                <TrendingUp className='mx-auto mb-2 h-12 w-12 opacity-50' />
                <p>{t('trends.empty-title')}</p>
                <p className='text-sm'>{t('trends.empty-description')}</p>
              </div>
            </div>
          ) : (
            <div className='overflow-x-auto rounded-md border border-[var(--border-subtle)]'>
              <table className='w-full text-sm'>
                <thead className='bg-bg-hover text-text-secondary text-left text-xs'>
                  <tr>
                    <th className='px-3 py-2'>{t('trends.table.time')}</th>
                    <th className='px-3 py-2'>{t('trends.table.service')}</th>
                    <th className='px-3 py-2'>{t('trends.table.status')}</th>
                    <th className='px-3 py-2'>{t('trends.table.latency')}</th>
                    <th className='px-3 py-2'>{t('trends.table.message')}</th>
                  </tr>
                </thead>
                <tbody className='divide-border divide-y'>
                  {filtered_history.slice(0, 15).map((row) => (
                    <tr key={row.id} className='bg-bg-base'>
                      <td className='text-text-secondary px-3 py-2'>
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className='text-text-primary px-3 py-2 font-medium'>{row.checkType}</td>
                      <td className='px-3 py-2'>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 ${getStatusColor(row.status)}`}
                        >
                          {getStatusIcon(row.status)}
                          <span className='text-xs font-medium'>{getStatusLabel(row.status)}</span>
                        </span>
                      </td>
                      <td className='text-text-secondary px-3 py-2'>
                        {typeof row.responseTime === 'number'
                          ? formatResponseTime(row.responseTime)
                          : '—'}
                      </td>
                      <td className='text-text-secondary px-3 py-2'>{row.message}</td>
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
