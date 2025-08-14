'use client'

import { useState } from 'react'
import { Button } from '@tszhong0411/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Badge } from '@tszhong0411/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@tszhong0411/ui'
import { Activity, AlertTriangle, BarChart3, Clock, Database, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export default function MonitoringDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('24h')

  // Monitoring stats query
  const { data: monitoringStats, isLoading: statsLoading } = api.monitoring.getMonitoringStats.useQuery()

  // Performance metrics query
  const { data: performanceMetrics, isLoading: metricsLoading } = api.monitoring.getPerformanceMetrics.useQuery({
    timeRange: timeRange as any
  })

  // API usage query
  const { data: apiUsage, isLoading: apiLoading } = api.monitoring.getApiUsage.useQuery({
    timeRange: timeRange as any
  })

  // Error tracking query
  const { data: errorTracking, isLoading: errorsLoading } = api.monitoring.getErrorTracking.useQuery({
    timeRange: timeRange as any
  })

  // Resource usage query
  const { data: resourceUsage, isLoading: resourceLoading } = api.monitoring.getResourceUsage.useQuery({
    timeRange: timeRange as any
  })

  // Analytics events query
  const { data: analyticsEvents, isLoading: analyticsLoading } = api.monitoring.getAnalyticsEvents.useQuery({
    timeRange: timeRange as any
  })

  // Mutations
  const resolveErrorMutation = api.monitoring.resolveError.useMutation({
    onSuccess: () => {
      toast.success('Error resolved successfully')
    },
    onError: (error) => {
      toast.error(`Failed to resolve error: ${error.message}`)
    }
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  if (statsLoading) {
    return <div className="p-6">Loading monitoring dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Real-time system performance and analytics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="6h">Last 6 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Monitoring Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoringStats?.performance.avgResponseTime?.toFixed(0) || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {monitoringStats?.performance.totalMetrics || 0} metrics recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringStats?.api.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monitoringStats?.api.errorRate?.toFixed(1) || 0}% error rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringStats?.errors.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monitoringStats?.errors.unresolved || 0} unresolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringStats?.alerts.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monitoringStats?.alerts.critical || 0} critical alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="api">API Usage</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>API Response Time</span>
                    <Badge variant="default">
                      {monitoringStats?.api.avgResponseTime?.toFixed(0) || 0}ms
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Error Rate</span>
                    <Badge variant={
                      (monitoringStats?.api.errorRate || 0) > 5 ? 'destructive' : 'default'
                    }>
                      {monitoringStats?.api.errorRate?.toFixed(1) || 0}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Critical Errors</span>
                    <Badge variant={
                      (monitoringStats?.errors.critical || 0) > 0 ? 'destructive' : 'default'
                    }>
                      {monitoringStats?.errors.critical || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Alerts</span>
                    <Badge variant={
                      (monitoringStats?.alerts.total || 0) > 0 ? 'secondary' : 'default'
                    }>
                      {monitoringStats?.alerts.total || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div>Loading recent activity...</div>
                ) : (
                  <div className="space-y-3">
                    {analyticsEvents?.events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{event.eventType}</Badge>
                          <span className="text-sm">{event.user?.name || 'System'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No recent activity</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div>Loading performance metrics...</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(performanceMetrics?.metrics || {}).map(([type, data]: [string, any]) => (
                      <div key={type} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                          <Badge variant="outline">{data.latest?.value?.toFixed(2) || 0}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>Avg: {data.avg?.toFixed(2) || 0}</div>
                          <div>Min: {data.min?.toFixed(2) || 0}</div>
                          <div>Max: {data.max?.toFixed(2) || 0}</div>
                        </div>
                      </div>
                    ))}
                    {Object.keys(performanceMetrics?.metrics || {}).length === 0 && (
                      <div className="text-center text-muted-foreground">No performance data available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>System resource consumption</CardDescription>
              </CardHeader>
              <CardContent>
                {resourceLoading ? (
                  <div>Loading resource usage...</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(resourceUsage?.usage || {}).map(([type, data]: [string, any]) => (
                      <div key={type} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{type}</span>
                          <Badge variant={data.alerts > 0 ? 'destructive' : 'default'}>
                            {data.currentUsage?.toFixed(1) || 0}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>Avg: {data.avgUsage?.toFixed(1) || 0}%</div>
                          <div>Max: {data.maxUsage?.toFixed(1) || 0}%</div>
                        </div>
                        {data.alerts > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {data.alerts} threshold breach(es)
                          </div>
                        )}
                      </div>
                    ))}
                    {Object.keys(resourceUsage?.usage || {}).length === 0 && (
                      <div className="text-center text-muted-foreground">No resource data available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* API Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>API Usage Statistics</CardTitle>
                <CardDescription>Request patterns and performance</CardDescription>
              </CardHeader>
              <CardContent>
                {apiLoading ? (
                  <div>Loading API usage...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{apiUsage?.stats.totalRequests || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{apiUsage?.stats.uniqueUsers || 0}</div>
                        <div className="text-sm text-muted-foreground">Unique Users</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{apiUsage?.stats.avgResponseTime?.toFixed(0) || 0}ms</div>
                        <div className="text-sm text-muted-foreground">Avg Response Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{apiUsage?.stats.errorRate?.toFixed(1) || 0}%</div>
                        <div className="text-sm text-muted-foreground">Error Rate</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Top API Endpoints</CardTitle>
                <CardDescription>Most frequently accessed endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                {apiLoading ? (
                  <div>Loading top endpoints...</div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(apiUsage?.stats.topEndpoints || {})
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([endpoint, count]) => (
                        <div key={endpoint} className="flex items-center justify-between">
                          <span className="text-sm font-mono">{endpoint}</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    {Object.keys(apiUsage?.stats.topEndpoints || {}).length === 0 && (
                      <div className="text-center text-muted-foreground">No endpoint data available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Tracking</CardTitle>
              <CardDescription>System errors and exceptions</CardDescription>
            </CardHeader>
            <CardContent>
              {errorsLoading ? (
                <div>Loading error tracking...</div>
              ) : (
                <div className="space-y-4">
                  {errorTracking?.errors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(error.severity) as any}>
                            {error.severity}
                          </Badge>
                          <span className="font-medium">{error.message}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                          {!error.resolved && (
                            <Button
                              size="sm"
                              onClick={() => resolveErrorMutation.mutate({ errorId: error.id })}
                              disabled={resolveErrorMutation.isPending}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                      {error.source && (
                        <div className="text-sm text-muted-foreground mb-1">
                          Source: {error.source}
                        </div>
                      )}
                      {error.user && (
                        <div className="text-sm text-muted-foreground mb-1">
                          User: {error.user.name} ({error.user.email})
                        </div>
                      )}
                      {error.fingerprint && (
                        <div className="text-xs text-muted-foreground">
                          Fingerprint: {error.fingerprint}
                        </div>
                      )}
                      {error.resolved && (
                        <Badge variant="outline" className="mt-2">
                          Resolved {error.resolvedAt && new Date(error.resolvedAt).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  )) || <div className="text-center text-muted-foreground">No errors found</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>CPU, memory, disk, and network usage</CardDescription>
            </CardHeader>
            <CardContent>
              {resourceLoading ? (
                <div>Loading resource usage...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(resourceUsage?.usage || {}).map(([type, data]: [string, any]) => (
                    <Card key={type}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg capitalize">{type}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Current Usage:</span>
                            <Badge variant={data.currentUsage > 80 ? 'destructive' : 'default'}>
                              {data.currentUsage?.toFixed(1) || 0}%
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Average:</span>
                            <span>{data.avgUsage?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Peak:</span>
                            <span>{data.maxUsage?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Alerts:</span>
                            <Badge variant={data.alerts > 0 ? 'destructive' : 'outline'}>
                              {data.alerts || 0}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {Object.keys(resourceUsage?.usage || {}).length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground">
                      No resource usage data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Event Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
                <CardDescription>Distribution of analytics events</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div>Loading analytics events...</div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(analyticsEvents?.eventTypes || {})
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm">{type}</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    {Object.keys(analyticsEvents?.eventTypes || {}).length === 0 && (
                      <div className="text-center text-muted-foreground">No event data available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest analytics events</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div>Loading recent events...</div>
                ) : (
                  <div className="space-y-3">
                    {analyticsEvents?.events.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{event.eventType}</Badge>
                          <span className="text-sm">{event.user?.name || 'Anonymous'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    )) || <div className="text-center text-muted-foreground">No recent events</div>}
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
