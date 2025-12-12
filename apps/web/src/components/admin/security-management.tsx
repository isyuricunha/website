'use client'

import { useState } from 'react'
import { Button , Card, CardContent, CardDescription, CardHeader, CardTitle , Badge , Input , Label , Select, SelectContent, SelectItem, SelectTrigger, SelectValue , Tabs, TabsContent, TabsList, TabsTrigger } from '@tszhong0411/ui'






import { AlertTriangle, Shield, Users, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export default function SecurityManagement() {
  const [selectedTab, setSelectedTab] = useState('overview')

  // Security stats query
  const { data: securityStats, isLoading: statsLoading } = api.security.getSecurityStats.useQuery()

  // Security events query
  const { data: securityEvents, isLoading: eventsLoading } = api.security.getSecurityEvents.useQuery({
    limit: 10
  })

  // IP access rules query
  const { data: ipRules, isLoading: ipRulesLoading } = api.security.getIpAccessRules.useQuery()

  // Login attempts query
  const { data: loginAttempts, isLoading: attemptsLoading } = api.security.getLoginAttempts.useQuery()

  // Account lockouts query - get all active lockouts for admin view
  const { data: lockouts, isLoading: lockoutsLoading } = api.security.getAccountLockouts.useQuery({})

  // Mutations
  const addIpRuleMutation = api.security.addIpAccessRule.useMutation({
    onSuccess: () => {
      toast.success('IP access rule added successfully')
      // Refetch IP rules
    },
    onError: (error) => {
      toast.error(`Failed to add IP rule: ${error.message}`)
    }
  })

  const resolveEventMutation = api.security.resolveSecurityEvent.useMutation({
    onSuccess: () => {
      toast.success('Security event resolved')
      // Refetch events
    },
    onError: (error) => {
      toast.error(`Failed to resolve event: ${error.message}`)
    }
  })

  const unlockAccountMutation = api.security.unlockAccount.useMutation({
    onSuccess: () => {
      toast.success('Account unlocked successfully')
      // Refetch lockouts
    },
    onError: (error) => {
      toast.error(`Failed to unlock account: ${error.message}`)
    }
  })

  const handleAddIpRule = (formData: FormData) => {
    const ipAddress = formData.get('ipAddress') as string
    const type = formData.get('type') as 'whitelist' | 'blacklist'
    const description = formData.get('description') as string

    if (!ipAddress || !type) {
      toast.error('IP address and type are required')
      return
    }

    addIpRuleMutation.mutate({
      ipAddress,
      type,
      description: description || undefined
    })
  }

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
    return <div className="p-6">Loading security dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Security Management</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage system security</p>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.events.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {securityStats?.events.critical || 0} critical events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.loginAttempts.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {securityStats?.loginAttempts.failed || 0} failed attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Lockouts</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.lockouts.active || 0}</div>
            <p className="text-xs text-muted-foreground">Active lockouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA Adoption</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityStats?.twoFactor.adoptionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {securityStats?.twoFactor.enabledUsers || 0} users enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="ip-control">IP Control</TabsTrigger>
          <TabsTrigger value="lockouts">Lockouts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security incidents and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div>Loading events...</div>
                ) : (
                  <div className="space-y-3">
                    {securityEvents?.events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(event.severity) as any}>
                            {event.severity}
                          </Badge>
                          <span className="text-sm">{event.eventType}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No recent events</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Login Attempts Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Login Attempts (24h)</CardTitle>
                <CardDescription>Authentication activity summary</CardDescription>
              </CardHeader>
              <CardContent>
                {attemptsLoading ? (
                  <div>Loading attempts...</div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Attempts:</span>
                      <span className="font-medium">{loginAttempts?.summary.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful:</span>
                      <span className="font-medium text-green-600">{loginAttempts?.summary.successful || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{loginAttempts?.summary.failed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unique IPs:</span>
                      <span className="font-medium">{loginAttempts?.summary.uniqueIPs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{loginAttempts?.summary.successRate?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Monitor and resolve security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div>Loading security events...</div>
              ) : (
                <div className="space-y-4">
                  {securityEvents?.events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(event.severity) as any}>
                            {event.severity}
                          </Badge>
                          <span className="font-medium">{event.eventType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                          {!event.resolved && (
                            <Button
                              size="sm"
                              onClick={() => resolveEventMutation.mutate({ eventId: event.id })}
                              disabled={resolveEventMutation.isPending}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                      {event.ipAddress && (
                        <div className="text-sm text-muted-foreground">
                          IP: {event.ipAddress}
                        </div>
                      )}
                      {event.user && (
                        <div className="text-sm text-muted-foreground">
                          User: {event.user.name} ({event.user.email})
                        </div>
                      )}
                      {event.resolved && (
                        <Badge variant="outline" className="mt-2">
                          Resolved {event.resolvedAt && new Date(event.resolvedAt).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  )) || <div className="text-center text-muted-foreground">No security events found</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ip-control" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Add IP Rule Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add IP Access Rule</CardTitle>
                <CardDescription>Control access by IP address</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleAddIpRule} className="space-y-4">
                  <div>
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input
                      id="ipAddress"
                      name="ipAddress"
                      placeholder="192.168.1.1 or 192.168.1.0/24"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Rule Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whitelist">Whitelist (Allow)</SelectItem>
                        <SelectItem value="blacklist">Blacklist (Block)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Rule description"
                    />
                  </div>
                  <Button type="submit" disabled={addIpRuleMutation.isPending}>
                    {addIpRuleMutation.isPending ? 'Adding...' : 'Add Rule'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* IP Rules List */}
            <Card>
              <CardHeader>
                <CardTitle>IP Access Rules</CardTitle>
                <CardDescription>Current IP access control rules</CardDescription>
              </CardHeader>
              <CardContent>
                {ipRulesLoading ? (
                  <div>Loading IP rules...</div>
                ) : (
                  <div className="space-y-3">
                    {ipRules?.rules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between border rounded p-3">
                        <div>
                          <div className="font-medium">{rule.ipAddress}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.description || 'No description'}
                          </div>
                        </div>
                        <Badge variant={rule.type === 'whitelist' ? 'default' : 'destructive'}>
                          {rule.type}
                        </Badge>
                      </div>
                    )) || <div className="text-center text-muted-foreground">No IP rules configured</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lockouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Lockouts</CardTitle>
              <CardDescription>Manage locked user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {lockoutsLoading ? (
                <div>Loading account lockouts...</div>
              ) : (
                <div className="space-y-4">
                  {lockouts?.lockouts.map((lockout: any) => (
                    <div key={lockout.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">User ID: {lockout.userId}</div>
                          <div className="text-sm text-muted-foreground">Lockout ID: {lockout.id}</div>
                          <div className="text-sm text-muted-foreground">
                            Locked: {new Date(lockout.lockedAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Reason: {lockout.reason}
                          </div>
                        </div>
                        <Button
                          onClick={() => unlockAccountMutation.mutate({ lockoutId: lockout.id })}
                          disabled={unlockAccountMutation.isPending}
                        >
                          Unlock Account
                        </Button>
                      </div>
                    </div>
                  )) || <div className="text-center text-muted-foreground">No active account lockouts</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Security settings configuration coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
