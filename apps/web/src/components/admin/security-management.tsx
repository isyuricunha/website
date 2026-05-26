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
import { useTranslations } from 'next-intl'
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

const all_categories_value = 'all'

export default function SecurityManagement() {
  const t = useTranslations('admin.security-management')
  const commonT = useTranslations('common')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [settingsSearchTerm, setSettingsSearchTerm] = useState('')
  const [selectedSettingsCategory, setSelectedSettingsCategory] =
    useState<string>(all_categories_value)
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
      toast.success(t('messages.ip-rule-added'))
      utils.security.getIpAccessRules.invalidate()
      utils.security.getSecurityEvents.invalidate()
      utils.security.getSecurityStats.invalidate()
    },
    onError: (error) => {
      toast.error(t('messages.ip-rule-failed', { message: error.message }))
    }
  })

  const resolveEventMutation = api.security.resolveSecurityEvent.useMutation({
    onSuccess: () => {
      toast.success(t('messages.event-resolved'))
      utils.security.getSecurityEvents.invalidate()
      utils.security.getSecurityStats.invalidate()
    },
    onError: (error) => {
      toast.error(t('messages.event-resolve-failed', { message: error.message }))
    }
  })

  const unlockAccountMutation = api.security.unlockAccount.useMutation({
    onSuccess: () => {
      toast.success(t('messages.account-unlocked'))
      utils.security.getAccountLockouts.invalidate()
      utils.security.getSecurityStats.invalidate()
      utils.security.getSecurityEvents.invalidate()
    },
    onError: (error) => {
      toast.error(t('messages.account-unlock-failed', { message: error.message }))
    }
  })

  const updateSecuritySettingMutation = api.security.updateSecuritySetting.useMutation({
    onSuccess: () => {
      toast.success(t('messages.setting-updated'))
      setEditingSettingKey(null)
      utils.security.getSecuritySettings.invalidate()
      utils.security.getSecurityEvents.invalidate()
      utils.security.getSecurityStats.invalidate()
    },
    onError: (error) => {
      toast.error(t('messages.setting-update-failed', { message: error.message }))
    }
  })

  const categories = useMemo(() => {
    const keys = Object.keys(securitySettings?.settings ?? {})
    return keys.toSorted((a, b) => a.localeCompare(b))
  }, [securitySettings?.settings])

  const filteredSettings = useMemo(() => {
    const grouped = securitySettings?.settings ?? {}
    const result: Record<string, SecuritySetting[]> = {}

    for (const [category, settings] of Object.entries(grouped)) {
      if (
        selectedSettingsCategory !== all_categories_value &&
        category !== selectedSettingsCategory
      )
        continue

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
      toast.error(t('messages.ip-type-required'))
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

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return t('severity.critical')
      case 'high':
        return t('severity.high')
      case 'medium':
        return t('severity.medium')
      case 'low':
        return t('severity.low')
      default:
        return severity
    }
  }

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case 'whitelist':
        return t('rule-types.whitelist')
      case 'blacklist':
        return t('rule-types.blacklist')
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
          <h1 className='text-xl font-medium sm:text-2xl'>{t('title')}</h1>
          <p className='text-text-secondary text-sm'>{t('description')}</p>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.security-events')}</CardTitle>
            <AlertTriangle className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{securityStats?.events.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.critical-events', { count: securityStats?.events.critical || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.login-attempts')}</CardTitle>
            <Users className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{securityStats?.loginAttempts.total || 0}</div>
            <p className='text-text-secondary text-xs'>
              {t('stats.failed-attempts', { count: securityStats?.loginAttempts.failed || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.account-lockouts')}</CardTitle>
            <Lock className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>{securityStats?.lockouts.active || 0}</div>
            <p className='text-text-secondary text-xs'>{t('stats.active-lockouts')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('stats.two-factor-adoption')}</CardTitle>
            <Shield className='text-text-secondary h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-medium'>
              {securityStats?.twoFactor.adoptionRate?.toFixed(1) || 0}%
            </div>
            <p className='text-text-secondary text-xs'>
              {t('stats.users-enabled', { count: securityStats?.twoFactor.enabledUsers || 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value='events'>{t('tabs.events')}</TabsTrigger>
          <TabsTrigger value='ip-control'>{t('tabs.ip-control')}</TabsTrigger>
          <TabsTrigger value='lockouts'>{t('tabs.lockouts')}</TabsTrigger>
          <TabsTrigger value='settings'>{t('tabs.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.recent-events.title')}</CardTitle>
                <CardDescription>{t('overview.recent-events.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div>{t('events.loading')}</div>
                ) : (
                  <div className='space-y-3'>
                    {(securityEvents?.events?.length ?? 0) > 0 ? (
                      securityEvents?.events.slice(0, 5).map((event) => (
                        <div key={event.id} className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Badge variant={getSeverityColor(event.severity)}>
                              {getSeverityLabel(event.severity)}
                            </Badge>
                            <span className='text-sm'>{event.eventType}</span>
                          </div>
                          <span className='text-text-secondary text-xs'>
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className='text-text-secondary text-sm'>{t('events.no-recent')}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Login Attempts Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.login-attempts.title')}</CardTitle>
                <CardDescription>{t('overview.login-attempts.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {attemptsLoading ? (
                  <div>{t('overview.login-attempts.loading')}</div>
                ) : (
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span>{t('overview.login-attempts.total')}</span>
                      <span className='font-medium'>{loginAttempts?.summary.total || 0}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>{t('overview.login-attempts.successful')}</span>
                      <span className='text-accent-earth-text font-medium'>
                        {loginAttempts?.summary.successful || 0}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>{t('overview.login-attempts.failed')}</span>
                      <span className='text-destructive font-medium'>
                        {loginAttempts?.summary.failed || 0}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>{t('overview.login-attempts.unique-ips')}</span>
                      <span className='font-medium'>{loginAttempts?.summary.uniqueIPs || 0}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>{t('overview.login-attempts.success-rate')}</span>
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
              <CardTitle>{t('events.title')}</CardTitle>
              <CardDescription>{t('events.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div>{t('events.loading-security-events')}</div>
              ) : (
                <div className='space-y-4'>
                  {(securityEvents?.events?.length ?? 0) > 0 ? (
                    securityEvents?.events.map((event) => (
                      <div key={event.id} className='rounded-lg border p-4'>
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Badge variant={getSeverityColor(event.severity)}>
                              {getSeverityLabel(event.severity)}
                            </Badge>
                            <span className='font-medium'>{event.eventType}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className='text-text-secondary text-sm'>
                              {new Date(event.createdAt).toLocaleString()}
                            </span>
                            {!event.resolved && (
                              <Button
                                size='sm'
                                onClick={() => resolveEventMutation.mutate({ eventId: event.id })}
                                disabled={resolveEventMutation.isPending}
                              >
                                {t('actions.resolve')}
                              </Button>
                            )}
                          </div>
                        </div>
                        {event.ipAddress && (
                          <div className='text-text-secondary text-sm'>
                            {t('events.ip', { ip: event.ipAddress })}
                          </div>
                        )}
                        {event.user && (
                          <div className='text-text-secondary text-sm'>
                            {t('events.user', {
                              name: event.user.name,
                              email: event.user.email
                            })}
                          </div>
                        )}
                        {event.resolved && (
                          <Badge variant='outline' className='mt-2'>
                            {t('events.resolved', {
                              date: event.resolvedAt
                                ? new Date(event.resolvedAt).toLocaleString()
                                : ''
                            })}
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className='text-text-secondary text-center'>{t('events.empty')}</div>
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
                <CardTitle>{t('ip-control.add-title')}</CardTitle>
                <CardDescription>{t('ip-control.add-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleAddIpRule} className='space-y-4'>
                  <div>
                    <Label htmlFor='ipAddress'>{t('fields.ip-address')}</Label>
                    <Input
                      id='ipAddress'
                      name='ipAddress'
                      placeholder='192.168.1.1 or 192.168.1.0/24'
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='type'>{t('fields.rule-type')}</Label>
                    <Select name='type' required>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.rule-type-placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='whitelist'>{t('rule-types.whitelist-allow')}</SelectItem>
                        <SelectItem value='blacklist'>{t('rule-types.blacklist-block')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='description'>{t('fields.description-optional')}</Label>
                    <Input
                      id='description'
                      name='description'
                      placeholder={t('fields.rule-description-placeholder')}
                    />
                  </div>
                  <Button type='submit' disabled={addIpRuleMutation.isPending}>
                    {addIpRuleMutation.isPending ? t('actions.adding') : t('actions.add-rule')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* IP Rules List */}
            <Card>
              <CardHeader>
                <CardTitle>{t('ip-control.rules-title')}</CardTitle>
                <CardDescription>{t('ip-control.rules-description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {ipRulesLoading ? (
                  <div>{t('ip-control.loading-rules')}</div>
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
                            <div className='text-text-secondary text-sm'>
                              {rule.description || t('ip-control.no-description')}
                            </div>
                          </div>
                          <Badge variant={rule.type === 'whitelist' ? 'default' : 'destructive'}>
                            {getRuleTypeLabel(rule.type)}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className='text-text-secondary text-center'>{t('ip-control.empty')}</div>
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
              <CardTitle>{t('lockouts.title')}</CardTitle>
              <CardDescription>{t('lockouts.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {lockoutsLoading ? (
                <div>{t('lockouts.loading')}</div>
              ) : (
                <div className='space-y-4'>
                  {(lockouts?.lockouts?.length ?? 0) > 0 ? (
                    lockouts?.lockouts.map((lockout: SecurityLockout) => (
                      <div key={lockout.id} className='rounded-lg border p-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='font-medium'>
                              {t('lockouts.user-id', { userId: lockout.userId })}
                            </div>
                            <div className='text-text-secondary text-sm'>
                              {t('lockouts.lockout-id', { lockoutId: lockout.id })}
                            </div>
                            <div className='text-text-secondary text-sm'>
                              {t('lockouts.locked', {
                                date: new Date(lockout.lockedAt).toLocaleString()
                              })}
                            </div>
                            <div className='text-text-secondary text-sm'>
                              {t('lockouts.reason', { reason: lockout.reason })}
                            </div>
                          </div>
                          <Button
                            onClick={() => unlockAccountMutation.mutate({ lockoutId: lockout.id })}
                            disabled={unlockAccountMutation.isPending}
                          >
                            {t('actions.unlock-account')}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-text-secondary text-center'>{t('lockouts.empty')}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.title')}</CardTitle>
              <CardDescription>{t('settings.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid gap-3 md:grid-cols-2'>
                  <div>
                    <Label htmlFor='security-settings-search'>{t('fields.search')}</Label>
                    <Input
                      id='security-settings-search'
                      value={settingsSearchTerm}
                      onChange={(e) => setSettingsSearchTerm(e.target.value)}
                      placeholder={t('settings.search-placeholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor='security-settings-category'>{t('fields.category')}</Label>
                    <Select
                      value={selectedSettingsCategory}
                      onValueChange={setSelectedSettingsCategory}
                    >
                      <SelectTrigger id='security-settings-category'>
                        <SelectValue placeholder={t('settings.all-categories')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={all_categories_value}>
                          {t('settings.all-categories')}
                        </SelectItem>
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
                  <div className='text-text-secondary py-8 text-center'>
                    {t('settings.loading')}
                  </div>
                ) : null}

                {!settingsLoading && Object.keys(filteredSettings).length === 0 ? (
                  <div className='text-text-secondary py-8 text-center'>{t('settings.empty')}</div>
                ) : null}

                {!settingsLoading && Object.keys(filteredSettings).length > 0 ? (
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
                                            <Label htmlFor={`setting-value-${setting.id}`}>
                                              {t('fields.value')}
                                            </Label>
                                            <Textarea
                                              id={`setting-value-${setting.id}`}
                                              value={draftSettingValue}
                                              onChange={(e) => setDraftSettingValue(e.target.value)}
                                              rows={3}
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor={`setting-description-${setting.id}`}>
                                              {t('fields.description')}
                                            </Label>
                                            <Input
                                              id={`setting-description-${setting.id}`}
                                              value={draftSettingDescription}
                                              onChange={(e) =>
                                                setDraftSettingDescription(e.target.value)
                                              }
                                              placeholder={t(
                                                'fields.optional-description-placeholder'
                                              )}
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor={`setting-category-${setting.id}`}>
                                              {t('fields.category')}
                                            </Label>
                                            <Input
                                              id={`setting-category-${setting.id}`}
                                              value={draftSettingCategory}
                                              onChange={(e) =>
                                                setDraftSettingCategory(e.target.value)
                                              }
                                              placeholder={t('fields.category-placeholder')}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className='space-y-1'>
                                          <div className='text-text-secondary text-sm break-words'>
                                            {setting.value}
                                          </div>
                                          {setting.description ? (
                                            <div className='text-text-secondary text-xs break-words'>
                                              {setting.description}
                                            </div>
                                          ) : null}
                                        </div>
                                      )}

                                      <div className='text-text-secondary text-xs'>
                                        {t('settings.updated', {
                                          date: new Date(setting.updatedAt).toLocaleString()
                                        })}
                                        {setting.updatedByUser ? (
                                          <span>
                                            {' '}
                                            {t('settings.updated-by', {
                                              name: setting.updatedByUser.name
                                            })}
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
                                            {t('actions.save')}
                                          </Button>
                                          <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={cancelEditingSetting}
                                            disabled={updateSecuritySettingMutation.isPending}
                                          >
                                            {commonT('cancel')}
                                          </Button>
                                        </>
                                      ) : (
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          onClick={() => startEditingSetting(setting)}
                                        >
                                          {t('actions.edit')}
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
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
