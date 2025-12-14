'use client'

import { useMemo, useState } from 'react'
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

import { AlertTriangle, Shield, Users, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

type SecurityLockout = {
  id: string
  userId: string
  reason: string
  lockedAt: Date
  lockedUntil: Date | null
  lockedBy: string | null
  unlocked: boolean
  unlockedAt: Date | null
  unlockedBy: string | null
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

type SecuritySetting = {
  id: string
  key: string
  value: string
  description: string | null
  category: string
  updatedAt: Date | string
  updatedByUser?: {
    id: string
    name: string
    email: string
  }
}

export default function SecurityManagement() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [settingsSearchTerm, setSettingsSearchTerm] = useState('')
  const [selectedSettingsCategory, setSelectedSettingsCategory] = useState<string>('')
  const [editingSettingKey, setEditingSettingKey] = useState<string | null>(null)
  const [draftSettingValue, setDraftSettingValue] = useState('')
  const [draftSettingDescription, setDraftSettingDescription] = useState('')
  const [draftSettingCategory, setDraftSettingCategory] = useState('')

  const utils = api.useUtils()

  // Security stats query
  const { data: securityStats, isLoading: statsLoading } = api.security.getSecurityStats.useQuery()

  // Security events query
  const { data: securityEvents, isLoading: eventsLoading } =
    api.security.getSecurityEvents.useQuery({
      limit: 10
    })

  // IP access rules query
  const { data: ipRules, isLoading: ipRulesLoading } = api.security.getIpAccessRules.useQuery()

  // Login attempts query
  const { data: loginAttempts, isLoading: attemptsLoading } =
    api.security.getLoginAttempts.useQuery()

  // Account lockouts query - get all active lockouts for admin view
  const { data: lockouts, isLoading: lockoutsLoading } = api.security.getAccountLockouts.useQuery(
    {}
  )

  const { data: securitySettings, isLoading: settingsLoading } =
    api.security.getSecuritySettings.useQuery()

  // Mutations
  const addIpRuleMutation = api.security.addIpAccessRule.useMutation({
    onSuccess: () => {
      toast.success('IP access rule added successfully')
      utils.security.getIpAccessRules.invalidate()
      utils.security.getSecurityEvents.invalidate()
      utils.security.getSecurityStats.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to add IP rule: ${error.message}`)
    }
  })

  const resolveEventMutation = api.security.resolveSecurityEvent.useMutation({
    onSuccess: () => {
      toast.success('Security event resolved')
      utils.security.getSecurityEvents.invalidate()
      utils.security.getSecurityStats.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to resolve event: ${error.message}`)
    }
  })

  const unlockAccountMutation = api.security.unlockAccount.useMutation({
    onSuccess: () => {
      toast.success('Account unlocked successfully')
      utils.security.getAccountLockouts.invalidate()
      utils.security.getSecurityStats.invalidate()
      utils.security.getSecurityEvents.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to unlock account: ${error.message}`)
    }
  })

  const updateSecuritySettingMutation = api.security.updateSecuritySetting.useMutation({
    onSuccess: () => {
      toast.success('Security setting updated successfully')
      setEditingSettingKey(null)
      utils.security.getSecuritySettings.invalidate()
      utils.security.getSecurityEvents.invalidate()
      utils.security.getSecurityStats.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to update security setting: ${error.message}`)
    }
  })

  const categories = useMemo(() => {
    const keys = Object.keys(securitySettings?.settings ?? {})
    return keys.sort((a, b) => a.localeCompare(b))
  }, [securitySettings?.settings])

  const filteredSettings = useMemo(() => {
    const grouped = securitySettings?.settings ?? {}
    const result: Record<string, SecuritySetting[]> = {}

    for (const [category, settings] of Object.entries(grouped)) {
      if (selectedSettingsCategory && category !== selectedSettingsCategory) continue

      const items = (settings as SecuritySetting[]).filter((s) => {
        if (!settingsSearchTerm) return true
        const needle = settingsSearchTerm.toLowerCase()
        return (
          s.key.toLowerCase().includes(needle) ||
          s.value.toLowerCase().includes(needle) ||
          (s.description?.toLowerCase().includes(needle) ?? false)
        )
      })

      if (items.length > 0) {
        result[category] = items
      }
    }

    return result
  }, [securitySettings?.settings, selectedSettingsCategory, settingsSearchTerm])

  const startEditingSetting = (setting: SecuritySetting) => {
    setEditingSettingKey(setting.key)
    setDraftSettingValue(setting.value)
    setDraftSettingDescription(setting.description ?? '')
    setDraftSettingCategory(setting.category)
  }

  const cancelEditingSetting = () => {
    setEditingSettingKey(null)
    setDraftSettingValue('')
    setDraftSettingDescription('')
    setDraftSettingCategory('')
  }

  const saveEditingSetting = async () => {
    if (!editingSettingKey) return

    await updateSecuritySettingMutation.mutateAsync({
      key: editingSettingKey,
      value: draftSettingValue,
      description: draftSettingDescription || undefined,
      category: draftSettingCategory || undefined
    })
  }

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

  const getSeverityColor = (severity: string): BadgeVariant => {
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
    return <div className='p-6'>Loading security dashboard...</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold sm:text-2xl'>Security Management</h1>
          <p className='text-muted-foreground text-sm'>Monitor and manage system security</p>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Security Events</CardTitle>
            <AlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{securityStats?.events.total || 0}</div>
            <p className='text-muted-foreground text-xs'>
              {securityStats?.events.critical || 0} critical events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Login Attempts</CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{securityStats?.loginAttempts.total || 0}</div>
            <p className='text-muted-foreground text-xs'>
              {securityStats?.loginAttempts.failed || 0} failed attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Account Lockouts</CardTitle>
            <Lock className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{securityStats?.lockouts.active || 0}</div>
            <p className='text-muted-foreground text-xs'>Active lockouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>2FA Adoption</CardTitle>
            <Shield className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {securityStats?.twoFactor.adoptionRate?.toFixed(1) || 0}%
            </div>
            <p className='text-muted-foreground text-xs'>
              {securityStats?.twoFactor.enabledUsers || 0} users enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='events'>Events</TabsTrigger>
          <TabsTrigger value='ip-control'>IP Control</TabsTrigger>
          <TabsTrigger value='lockouts'>Lockouts</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
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
                  <div className='space-y-3'>
                    {(securityEvents?.events?.length ?? 0) > 0 ? (
                      securityEvents?.events.slice(0, 5).map((event) => (
                        <div key={event.id} className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Badge variant={getSeverityColor(event.severity)}>{event.severity}</Badge>
                            <span className='text-sm'>{event.eventType}</span>
                          </div>
                          <span className='text-muted-foreground text-xs'>
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className='text-muted-foreground text-sm'>No recent events</div>
                    )}
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
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span>Total Attempts:</span>
                      <span className='font-medium'>{loginAttempts?.summary.total || 0}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Successful:</span>
                      <span className='font-medium text-green-600'>
                        {loginAttempts?.summary.successful || 0}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Failed:</span>
                      <span className='font-medium text-red-600'>
                        {loginAttempts?.summary.failed || 0}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Unique IPs:</span>
                      <span className='font-medium'>{loginAttempts?.summary.uniqueIPs || 0}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Success Rate:</span>
                      <span className='font-medium'>
                        {loginAttempts?.summary.successRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='events' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Monitor and resolve security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div>Loading security events...</div>
              ) : (
                <div className='space-y-4'>
                  {(securityEvents?.events?.length ?? 0) > 0 ? (
                    securityEvents?.events.map((event) => (
                      <div key={event.id} className='rounded-lg border p-4'>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Badge variant={getSeverityColor(event.severity)}>{event.severity}</Badge>
                            <span className='font-medium'>{event.eventType}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className='text-muted-foreground text-sm'>
                              {new Date(event.createdAt).toLocaleString()}
                            </span>
                            {!event.resolved && (
                              <Button
                                size='sm'
                                onClick={() => resolveEventMutation.mutate({ eventId: event.id })}
                                disabled={resolveEventMutation.isPending}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                        {event.ipAddress && (
                          <div className='text-muted-foreground text-sm'>IP: {event.ipAddress}</div>
                        )}
                        {event.user && (
                          <div className='text-muted-foreground text-sm'>
                            User: {event.user.name} ({event.user.email})
                          </div>
                        )}
                        {event.resolved && (
                          <Badge variant='outline' className='mt-2'>
                            Resolved {event.resolvedAt && new Date(event.resolvedAt).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className='text-muted-foreground text-center'>No security events found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='ip-control' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Add IP Rule Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add IP Access Rule</CardTitle>
                <CardDescription>Control access by IP address</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleAddIpRule} className='space-y-4'>
                  <div>
                    <Label htmlFor='ipAddress'>IP Address</Label>
                    <Input
                      id='ipAddress'
                      name='ipAddress'
                      placeholder='192.168.1.1 or 192.168.1.0/24'
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='type'>Rule Type</Label>
                    <Select name='type' required>
                      <SelectTrigger>
                        <SelectValue placeholder='Select rule type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='whitelist'>Whitelist (Allow)</SelectItem>
                        <SelectItem value='blacklist'>Blacklist (Block)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='description'>Description (Optional)</Label>
                    <Input id='description' name='description' placeholder='Rule description' />
                  </div>
                  <Button type='submit' disabled={addIpRuleMutation.isPending}>
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
                  <div className='space-y-3'>
                    {(ipRules?.rules?.length ?? 0) > 0 ? (
                      ipRules?.rules.map((rule) => (
                        <div
                          key={rule.id}
                          className='flex items-center justify-between rounded border p-3'
                        >
                          <div>
                            <div className='font-medium'>{rule.ipAddress}</div>
                            <div className='text-muted-foreground text-sm'>
                              {rule.description || 'No description'}
                            </div>
                          </div>
                          <Badge variant={rule.type === 'whitelist' ? 'default' : 'destructive'}>
                            {rule.type}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className='text-muted-foreground text-center'>No IP rules configured</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='lockouts' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Account Lockouts</CardTitle>
              <CardDescription>Manage locked user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {lockoutsLoading ? (
                <div>Loading account lockouts...</div>
              ) : (
                <div className='space-y-4'>
                  {(lockouts?.lockouts?.length ?? 0) > 0 ? (
                    lockouts?.lockouts.map((lockout: SecurityLockout) => (
                      <div key={lockout.id} className='rounded-lg border p-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='font-medium'>User ID: {lockout.userId}</div>
                            <div className='text-muted-foreground text-sm'>
                              Lockout ID: {lockout.id}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                              Locked: {new Date(lockout.lockedAt).toLocaleString()}
                            </div>
                            <div className='text-muted-foreground text-sm'>
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
                    ))
                  ) : (
                    <div className='text-muted-foreground text-center'>No active account lockouts</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid gap-3 md:grid-cols-2'>
                  <div>
                    <Label htmlFor='security-settings-search'>Search</Label>
                    <Input
                      id='security-settings-search'
                      value={settingsSearchTerm}
                      onChange={(e) => setSettingsSearchTerm(e.target.value)}
                      placeholder='Search by key, value, or description'
                    />
                  </div>
                  <div>
                    <Label htmlFor='security-settings-category'>Category</Label>
                    <Select value={selectedSettingsCategory} onValueChange={setSelectedSettingsCategory}>
                      <SelectTrigger id='security-settings-category'>
                        <SelectValue placeholder='All categories' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=''>All categories</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {settingsLoading ? (
                  <div className='text-muted-foreground py-8 text-center'>Loading security settings...</div>
                ) : Object.keys(filteredSettings).length === 0 ? (
                  <div className='text-muted-foreground py-8 text-center'>No security settings found</div>
                ) : (
                  <div className='space-y-4'>
                    {Object.entries(filteredSettings).map(([category, settings]) => (
                      <Card key={category}>
                        <CardHeader>
                          <CardTitle className='text-base'>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-3'>
                            {settings.map((setting) => {
                              const isEditing = editingSettingKey === setting.key

                              return (
                                <div key={setting.id} className='rounded-lg border p-4'>
                                  <div className='flex items-start justify-between gap-4'>
                                    <div className='min-w-0 flex-1 space-y-2'>
                                      <div className='flex items-center gap-2'>
                                        <span className='truncate font-medium'>{setting.key}</span>
                                        <Badge variant='outline' className='shrink-0'>
                                          {setting.category}
                                        </Badge>
                                      </div>

                                      {isEditing ? (
                                        <div className='space-y-3'>
                                          <div>
                                            <Label htmlFor={`setting-value-${setting.id}`}>Value</Label>
                                            <Textarea
                                              id={`setting-value-${setting.id}`}
                                              value={draftSettingValue}
                                              onChange={(e) => setDraftSettingValue(e.target.value)}
                                              rows={3}
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor={`setting-description-${setting.id}`}>Description</Label>
                                            <Input
                                              id={`setting-description-${setting.id}`}
                                              value={draftSettingDescription}
                                              onChange={(e) => setDraftSettingDescription(e.target.value)}
                                              placeholder='Optional description'
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor={`setting-category-${setting.id}`}>Category</Label>
                                            <Input
                                              id={`setting-category-${setting.id}`}
                                              value={draftSettingCategory}
                                              onChange={(e) => setDraftSettingCategory(e.target.value)}
                                              placeholder='Category'
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className='space-y-1'>
                                          <div className='text-muted-foreground text-sm break-words'>
                                            {setting.value}
                                          </div>
                                          {setting.description ? (
                                            <div className='text-muted-foreground text-xs break-words'>
                                              {setting.description}
                                            </div>
                                          ) : null}
                                        </div>
                                      )}

                                      <div className='text-muted-foreground text-xs'>
                                        Updated {new Date(setting.updatedAt).toLocaleString()}
                                        {setting.updatedByUser ? (
                                          <span>
                                            {' '}
                                            by {setting.updatedByUser.name}
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>

                                    <div className='flex shrink-0 flex-col gap-2'>
                                      {isEditing ? (
                                        <>
                                          <Button
                                            size='sm'
                                            onClick={saveEditingSetting}
                                            disabled={updateSecuritySettingMutation.isPending}
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={cancelEditingSetting}
                                            disabled={updateSecuritySettingMutation.isPending}
                                          >
                                            Cancel
                                          </Button>
                                        </>
                                      ) : (
                                        <Button size='sm' variant='outline' onClick={() => startEditingSetting(setting)}>
                                          Edit
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
