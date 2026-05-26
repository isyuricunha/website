'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
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

import { Activity, AlertTriangle, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d'

const is_time_range = (value: string): value is TimeRange => {
  return value === '1h' || value === '6h' || value === '24h' || value === '7d' || value === '30d'
}

export default function MonitoringDashboard() {
  const t = useTranslations('admin.monitoring-dashboard')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')

  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasSentPageViewRef = useRef(false)
  const snapshotInFlightRef = useRef(false)

  const utils = api.useUtils()

  // Monitoring stats query
  const { data: monitoringStats, isLoading: statsLoading } =
    api.monitoring.getMonitoringStats.useQuery(undefined, { refetchInterval: 30_000 })

  // Performance metrics query
  const { data: performanceMetrics, isLoading: metricsLoading } =
    api.monitoring.getPerformanceMetrics.useQuery(
      {
        timeRange
      },
      { refetchInterval: 30_000 }
    )

  // API usage query
  const { data: apiUsage, isLoading: apiLoading } = api.monitoring.getApiUsage.useQuery(
    {
      timeRange
    },
    { refetchInterval: 30_000 }
  )

  // Error tracking query
  const { data: errorTracking, isLoading: errorsLoading } =
    api.monitoring.getErrorTracking.useQuery(
      {
        timeRange
      },
      { refetchInterval: 30_000 }
    )

  // Resource usage query
  const { data: resourceUsage, isLoading: resourceLoading } =
    api.monitoring.getResourceUsage.useQuery(
      {
        timeRange
      },
      { refetchInterval: 30_000 }
    )

  // Analytics events query
  const { data: analyticsEvents, isLoading: analyticsLoading } =
    api.monitoring.getAnalyticsEvents.useQuery(
      {
        timeRange
      },
      { refetchInterval: 30_000 }
    )

  // Mutations
  const recordAnalyticsEventMutation = api.monitoring.recordAnalyticsEvent.useMutation({
    retry: false,
    onSuccess: () => {
      utils.monitoring.getAnalyticsEvents.invalidate()
    }
  })

  const recordResourceSnapshotMutation = api.monitoring.recordResourceSnapshot.useMutation({
    retry: false,
    onSuccess: () => {
      utils.monitoring.getResourceUsage.invalidate()
    }
  })

  const resolveErrorMutation = api.monitoring.resolveError.useMutation({
    onSuccess: () => {
      toast.success(t('messages.error-resolved'))

      utils.monitoring.getErrorTracking.invalidate()
      utils.monitoring.getMonitoringStats.invalidate()
      utils.monitoring.getAlerts.invalidate()
    },
    onError: (error) => {
      toast.error(t('messages.resolve-error-failed', { message: error.message }))
    }
  })

  const resolveAllErrorsMutation = api.monitoring.resolveAllErrors.useMutation({
    onSuccess: () => {
      toast.success(t('messages.all-errors-resolved'))
      utils.monitoring.getErrorTracking.invalidate()
      utils.monitoring.getMonitoringStats.invalidate()
    },
    onError: (error) => {
      toast.error(t('messages.resolve-all-errors-failed', { message: error.message }))
    }
  })

  useEffect(() => {
    if (!hasSentPageViewRef.current) {
      hasSentPageViewRef.current = true
      recordAnalyticsEventMutation.mutate({
        eventType: 'page_view',
        page: '/admin/monitoring',
        properties: {
          tab: selectedTab,
          timeRange
        }
      })
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps, react-hooks/exhaustive-deps -- fire once on mount to avoid request loops
  }, [])

  useEffect(() => {
    const record_snapshot = async () => {
      if (snapshotInFlightRef.current) return
      snapshotInFlightRef.current = true

      try {
        await recordResourceSnapshotMutation.mutateAsync()
      } finally {
        snapshotInFlightRef.current = false
      }
    }

    void record_snapshot()

    if (snapshotIntervalRef.current) {
      clearInterval(snapshotIntervalRef.current)
    }

    snapshotIntervalRef.current = setInterval(() => {
      void record_snapshot()
    }, 60_000)

    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current)
        snapshotIntervalRef.current = null
      }
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps, react-hooks/exhaustive-deps -- interval lifecycle should be mount/unmount
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
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
        <Select
          value={timeRange}
          onValueChange={(value) => {
            if (is_time_range(value)) {
              setTimeRange(value)
            }
          }}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1h'>{t('time-range.last-hour')}</SelectItem>
            <SelectItem value='6h'>{t('time-range.last-6-hours')}</SelectItem>
            <SelectItem value='24h'>{t('time-range.last-24-hours')}</SelectItem>
            <SelectItem value='7d'>{t('time-range.last-7-days')}</SelectItem>
            <SelectItem value='30d'>{t('time-range.last-30-days')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Monitoring Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.performance')}</CardTitle>
            <Zap className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>
              {monitoringStats?.performance.avgResponseTime?.toFixed(0) || 0}ms
            </div>
            <p className='text-text-secondary text-xs'>
              {t('stats.metrics-recorded', {
                count: monitoringStats?.performance.totalMetrics || 0
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.api-requests')}</CardTitle>
            <Activity className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{monitoringStats?.api.totalRequests || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.error-rate', { rate: monitoringStats?.api.errorRate?.toFixed(1) || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.errors')}</CardTitle>
            <AlertTriangle className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{monitoringStats?.errors.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.unresolved', { count: monitoringStats?.errors.unresolved || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.active-alerts')}</CardTitle>
            <AlertTriangle className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{monitoringStats?.alerts.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.critical-alerts', { count: monitoringStats?.alerts.critical || 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value='performance'>{t('tabs.performance')}</TabsTrigger>
          <TabsTrigger value='api'>{t('tabs.api')}</TabsTrigger>
          <TabsTrigger value='errors'>{t('tabs.errors')}</TabsTrigger>
          <TabsTrigger value='resources'>{t('tabs.resources')}</TabsTrigger>
          <TabsTrigger value='analytics'>{t('tabs.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* System Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.system-health.title')}</CardTitle>
                <CardDescription>{t('overview.system-health.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span>{t('overview.system-health.api-response-time')}</span>
                    <Badge variant='default'>
                      {monitoringStats?.api.avgResponseTime?.toFixed(0) || 0}ms
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>{t('overview.system-health.error-rate')}</span>
                    <Badge
                      variant={
                        (monitoringStats?.api.errorRate || 0) > 5 ? 'destructive' : 'default'
                      }
                    >
                      {monitoringStats?.api.errorRate?.toFixed(1) || 0}%
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>{t('overview.system-health.critical-errors')}</span>
                    <Badge
                      variant={
                        (monitoringStats?.errors.critical || 0) > 0 ? 'destructive' : 'default'
                      }
                    >
                      {monitoringStats?.errors.critical || 0}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>{t('overview.system-health.active-alerts')}</span>
                    <Badge
                      variant={(monitoringStats?.alerts.total || 0) > 0 ? 'secondary' : 'default'}
                    >
                      {monitoringStats?.alerts.total || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.recent-activity.title')}</CardTitle>
                <CardDescription>{t('overview.recent-activity.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div>{t('overview.recent-activity.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {analyticsEvents?.events.slice(0, 5).map((event) => (
                      <div key={event.id} className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='outline'>{event.eventType}</Badge>
                          <span className='text-sm'>{event.user?.name || t('common.system')}</span>
                        </div>
                        <span className='text-text-secondary text-xs'>
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {(analyticsEvents?.events.length ?? 0) === 0 && (
                      <div className='text-text-secondary text-sm'>
                        {t('overview.recent-activity.empty')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>{t('performance.metrics.title')}</CardTitle>
                <CardDescription>{t('performance.metrics.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div>{t('performance.metrics.loading')}</div>
                ) : (
                  <div className='space-y-4'>
                    {Object.entries(performanceMetrics?.metrics || {}).map(
                      ([type, data]: [string, any]) => (
                        <div key={type} className='rounded border p-3'>
                          <div className='mb-2 flex items-center justify-between'>
                            <span className='font-medium capitalize'>{type.replace('_', ' ')}</span>
                            <Badge variant='outline'>{data.latest?.value?.toFixed(2) || 0}</Badge>
                          </div>
                          <div className='text-text-secondary grid grid-cols-3 gap-2 text-sm'>
                            <div>{t('metrics.avg', { value: data.avg?.toFixed(2) || 0 })}</div>
                            <div>{t('metrics.min', { value: data.min?.toFixed(2) || 0 })}</div>
                            <div>{t('metrics.max', { value: data.max?.toFixed(2) || 0 })}</div>
                          </div>
                        </div>
                      )
                    )}
                    {Object.keys(performanceMetrics?.metrics || {}).length === 0 && (
                      <div className='text-text-secondary text-center'>
                        {t('performance.metrics.empty')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>{t('performance.resources.title')}</CardTitle>
                <CardDescription>{t('performance.resources.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {resourceLoading ? (
                  <div>{t('resources.loading')}</div>
                ) : (
                  <div className='space-y-4'>
                    {Object.entries(resourceUsage?.usage || {}).map(
                      ([type, data]: [string, any]) => (
                        <div key={type} className='rounded border p-3'>
                          <div className='mb-2 flex items-center justify-between'>
                            <span className='font-medium capitalize'>{type}</span>
                            <Badge variant={data.alerts > 0 ? 'destructive' : 'default'}>
                              {data.currentUsage?.toFixed(1) || 0}%
                            </Badge>
                          </div>
                          <div className='text-text-secondary grid grid-cols-2 gap-2 text-sm'>
                            <div>
                              {t('metrics.avg-percent', { value: data.avgUsage?.toFixed(1) || 0 })}
                            </div>
                            <div>
                              {t('metrics.max-percent', { value: data.maxUsage?.toFixed(1) || 0 })}
                            </div>
                          </div>
                          {data.alerts > 0 && (
                            <div className='text-destructive mt-1 text-xs'>
                              {t('performance.resources.threshold-breaches', {
                                count: data.alerts
                              })}
                            </div>
                          )}
                        </div>
                      )
                    )}
                    {Object.keys(resourceUsage?.usage || {}).length === 0 && (
                      <div className='text-text-secondary text-center'>
                        {t('performance.resources.empty')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='api' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* API Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>{t('api.stats.title')}</CardTitle>
                <CardDescription>{t('api.stats.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {apiLoading ? (
                  <div>{t('api.loading')}</div>
                ) : (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='text-center'>
                        <div className='text-2xl font-medium'>
                          {apiUsage?.stats.totalRequests || 0}
                        </div>
                        <div className='text-text-secondary text-sm'>
                          {t('api.stats.total-requests')}
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-medium'>
                          {apiUsage?.stats.uniqueUsers || 0}
                        </div>
                        <div className='text-text-secondary text-sm'>
                          {t('api.stats.unique-users')}
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='text-center'>
                        <div className='text-2xl font-medium'>
                          {apiUsage?.stats.avgResponseTime?.toFixed(0) || 0}ms
                        </div>
                        <div className='text-text-secondary text-sm'>
                          {t('api.stats.avg-response-time')}
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-medium'>
                          {apiUsage?.stats.errorRate?.toFixed(1) || 0}%
                        </div>
                        <div className='text-text-secondary text-sm'>
                          {t('api.stats.error-rate')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>{t('api.top-endpoints.title')}</CardTitle>
                <CardDescription>{t('api.top-endpoints.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {apiLoading ? (
                  <div>{t('api.top-endpoints.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {Object.entries(apiUsage?.stats.topEndpoints || {})
                      .toSorted(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([endpoint, count]) => (
                        <div key={endpoint} className='flex items-center justify-between'>
                          <span className='font-mono text-sm'>{endpoint}</span>
                          <Badge variant='outline'>{count}</Badge>
                        </div>
                      ))}
                    {Object.keys(apiUsage?.stats.topEndpoints || {}).length === 0 && (
                      <div className='text-text-secondary text-center'>
                        {t('api.top-endpoints.empty')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='errors' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between gap-2'>
                <div>
                  <CardTitle>{t('errors.title')}</CardTitle>
                  <CardDescription>{t('errors.description')}</CardDescription>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  isPending={resolveAllErrorsMutation.isPending}
                  disabled={resolveAllErrorsMutation.isPending}
                  onClick={() => resolveAllErrorsMutation.mutate()}
                >
                  {t('actions.resolve-all')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errorsLoading ? (
                <div>{t('errors.loading')}</div>
              ) : (
                <div className='space-y-4'>
                  {errorTracking?.errors.map((error) => (
                    <div key={error.id} className='rounded-lg border p-4'>
                      <div className='mb-2 flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <Badge variant={getSeverityColor(error.errorType || 'unknown')}>
                            {error.errorType || 'unknown'}
                          </Badge>
                          <span className='font-medium'>{error.message}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='text-text-secondary text-sm'>
                            {new Date(error.firstSeen).toLocaleString()}
                          </span>
                          {!error.resolved && (
                            <Button
                              size='sm'
                              onClick={() => resolveErrorMutation.mutate({ errorId: error.id })}
                              disabled={resolveErrorMutation.isPending}
                              isPending={resolveErrorMutation.isPending}
                            >
                              {t('actions.resolve')}
                            </Button>
                          )}
                        </div>
                      </div>
                      {error.errorType && (
                        <div className='text-text-secondary mb-1 text-sm'>
                          {t('errors.type', { type: error.errorType })}
                        </div>
                      )}
                      {error.user && (
                        <div className='text-text-secondary mb-1 text-sm'>
                          {t('errors.user', {
                            name: error.user.name,
                            email: error.user.email
                          })}
                        </div>
                      )}
                      {error.fingerprint && (
                        <div className='text-text-secondary text-xs'>
                          {t('errors.fingerprint', { fingerprint: error.fingerprint })}
                        </div>
                      )}
                      {error.resolved && (
                        <Badge variant='outline' className='mt-2'>
                          {t('errors.resolved', {
                            date: error.resolvedAt
                              ? new Date(error.resolvedAt).toLocaleString()
                              : ''
                          })}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {(errorTracking?.errors.length ?? 0) === 0 && (
                    <div className='text-text-secondary text-center'>{t('errors.empty')}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='resources' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>{t('resources.title')}</CardTitle>
              <CardDescription>{t('resources.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {resourceLoading ? (
                <div>{t('resources.loading')}</div>
              ) : (
                <div className='grid gap-4 md:grid-cols-2'>
                  {Object.entries(resourceUsage?.usage || {}).map(([type, data]: [string, any]) => (
                    <Card key={type}>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-lg capitalize'>{type}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-2'>
                          <div className='flex justify-between'>
                            <span>{t('resources.current-usage')}</span>
                            <Badge variant={data.currentUsage > 80 ? 'destructive' : 'default'}>
                              {data.currentUsage?.toFixed(1) || 0}%
                            </Badge>
                          </div>
                          <div className='flex justify-between'>
                            <span>{t('resources.average')}</span>
                            <span>{data.avgUsage?.toFixed(1) || 0}%</span>
                          </div>
                          <div className='flex justify-between'>
                            <span>{t('resources.peak')}</span>
                            <span>{data.maxUsage?.toFixed(1) || 0}%</span>
                          </div>
                          <div className='flex justify-between'>
                            <span>{t('resources.alerts')}</span>
                            <Badge variant={data.alerts > 0 ? 'destructive' : 'outline'}>
                              {data.alerts || 0}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {Object.keys(resourceUsage?.usage || {}).length === 0 && (
                    <div className='text-text-secondary col-span-2 text-center'>
                      {t('resources.empty')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Event Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.event-types.title')}</CardTitle>
                <CardDescription>{t('analytics.event-types.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div>{t('analytics.event-types.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {Object.entries(analyticsEvents?.eventTypes || {})
                      .toSorted(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <div key={type} className='flex items-center justify-between'>
                          <span className='text-sm'>{type}</span>
                          <Badge variant='outline'>{count}</Badge>
                        </div>
                      ))}
                    {Object.keys(analyticsEvents?.eventTypes || {}).length === 0 && (
                      <div className='text-text-secondary text-center'>
                        {t('analytics.event-types.empty')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.recent-events.title')}</CardTitle>
                <CardDescription>{t('analytics.recent-events.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div>{t('analytics.recent-events.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {analyticsEvents?.events.slice(0, 10).map((event) => (
                      <div key={event.id} className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='outline'>{event.eventType}</Badge>
                          <span className='text-sm'>
                            {event.user?.name || t('common.anonymous')}
                          </span>
                        </div>
                        <span className='text-text-secondary text-xs'>
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {(analyticsEvents?.events.length ?? 0) === 0 && (
                      <div className='text-text-secondary text-center'>
                        {t('analytics.recent-events.empty')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
