'use client'

import { useState, useEffect } from 'react'
import { Button } from '@tszhong0411/ui'
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
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Fetch system health
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = api.system.getSystemHealth.useQuery()

  // Fetch system stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = api.system.getSystemStats.useQuery()

  // Fetch error logs
  const { data: errorLogs, refetch: refetchErrors } = api.system.getErrorLogs.useQuery({
    resolved: false,
    limit: 10
  })

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetchHealth()
        refetchStats()
        refetchErrors()
      }, 30_000) // Refresh every 30 seconds

      setRefreshInterval(interval)
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
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
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
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
        return <Database className="w-6 h-6" />
      case 'email':
        return <Mail className="w-6 h-6" />
      case 'api':
        return <Server className="w-6 h-6" />
      case 'storage':
        return <HardDrive className="w-6 h-6" />
      case 'external_service':
        return <Globe className="w-6 h-6" />
      default:
        return <Activity className="w-6 h-6" />
    }
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatUptime = (percentage: number) => {
    return `${percentage.toFixed(2)}%`
  }

  if (healthLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({length: 3}).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor system performance and health</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Auto-refresh (30s)
          </label>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(healthData.overallStatus)}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Status: {healthData.overallStatus.charAt(0).toUpperCase() + healthData.overallStatus.slice(1)}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last checked: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            {statsData && (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatUptime(statsData.health.uptime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Healthy Checks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.health.healthy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.health.warning}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Issues</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.health.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unresolved Errors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.errors.unresolved}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Health Checks */}
      {healthData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Service Health</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthData.checks.map((check, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(check.type)}
                      <div>
                        <h4 className="font-medium capitalize">
                          {check.type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm opacity-75">{check.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusIcon(check.status)}
                      <div className="text-xs mt-1">
                        {formatResponseTime(check.responseTime)}
                      </div>
                    </div>
                  </div>
                  {check.details && Object.keys(check.details).length > 0 && (
                    <div className="mt-3 text-xs opacity-75">
                      <pre className="whitespace-pre-wrap">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Errors</h3>
              <Button variant="outline" size="sm">
                View All Errors
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {errorLogs.logs.slice(0, 5).map((error) => (
              <div key={error.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${error.level === 'error'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : error.level === 'warning'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                        {error.level.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(error.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {error.message}
                    </p>
                    {error.url && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        URL: {error.url}
                      </p>
                    )}
                    {error.user && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        User: {error.user.name} ({error.user.email})
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="outline">
                    Resolve
                  </Button>
                </div>
                {error.stack && (
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Health Trends</h3>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Health trends chart coming soon</p>
            <p className="text-sm">Will show system health over time</p>
          </div>
        </div>
      </div>
    </div>
  )
}
