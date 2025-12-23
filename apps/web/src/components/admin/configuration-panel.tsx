'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@isyuricunha/ui'
import {
  Settings,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Globe,
  Mail,
  BarChart3,
  Shield,
  Zap,
  Edit,
  Plus
} from 'lucide-react'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

type ConfigType = 'general' | 'seo' | 'social' | 'email' | 'analytics' | 'security' | 'features'

const is_config_type = (value: string): value is ConfigType => {
  return (
    value === 'general' ||
    value === 'seo' ||
    value === 'social' ||
    value === 'email' ||
    value === 'analytics' ||
    value === 'security' ||
    value === 'features'
  )
}

const normalize_config_value = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    switch (typeof value) {
      case 'number':
      case 'boolean':
      case 'bigint':
        return `${value}`
      case 'symbol':
        return value.description ? `Symbol(${value.description})` : 'Symbol()'
      case 'function':
        return '[function]'
      case 'object':
        return Object.prototype.toString.call(value)
      default:
        return ''
    }
  }
}

interface ConfigItem {
  id: string
  key: string
  value?: unknown
  type: ConfigType
  description?: string
  isPublic: boolean
  updatedBy: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

interface ConfigGroup {
  [key: string]: ConfigItem[]
}

export const ConfigurationPanel = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null)
  const edit_textarea_ref = useRef<HTMLTextAreaElement | null>(null)
  const [newConfigKey, setNewConfigKey] = useState('')
  const [newConfigValue, setNewConfigValue] = useState('')
  const [newConfigType, setNewConfigType] = useState<ConfigType>('general')
  const [newConfigDescription, setNewConfigDescription] = useState('')
  const [newConfigIsPublic, setNewConfigIsPublic] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const utils = api.useUtils()

  useEffect(() => {
    if (!editingConfig) return

    const handle = globalThis.setTimeout(() => {
      edit_textarea_ref.current?.focus()
      edit_textarea_ref.current?.select()
    }, 0)

    return () => globalThis.clearTimeout(handle)
  }, [editingConfig])

  // Fetch site configuration
  const { data: configData, isLoading, refetch } = api.system.getSiteConfig.useQuery()

  // Update site configuration mutation
  const updateConfig = api.system.updateSiteConfig.useMutation({
    onSuccess: () => {
      toast.success('Configuration updated successfully')
      setEditingConfig(null)
      setShowAddForm(false)
      setNewConfigKey('')
      setNewConfigValue('')
      setNewConfigDescription('')
      utils.system.getSiteConfig.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update configuration')
    }
  })

  const handleSaveConfig = async (config: ConfigItem, newValue: string) => {
    await updateConfig.mutateAsync({
      key: config.key,
      value: newValue,
      type: config.type,
      description: config.description,
      isPublic: config.isPublic
    })
  }

  const handleAddConfig = async () => {
    if (!newConfigKey || !newConfigValue) {
      toast.error('Please provide both key and value')
      return
    }

    await updateConfig.mutateAsync({
      key: newConfigKey,
      value: newConfigValue,
      type: newConfigType,
      description: newConfigDescription || undefined,
      isPublic: newConfigIsPublic
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <Settings className='text-primary h-5 w-5' />
      case 'seo':
        return <Search className='text-primary h-5 w-5' />
      case 'social':
        return <Globe className='text-primary h-5 w-5' />
      case 'email':
        return <Mail className='text-primary h-5 w-5' />
      case 'analytics':
        return <BarChart3 className='text-primary h-5 w-5' />
      case 'security':
        return <Shield className='text-primary h-5 w-5' />
      case 'features':
        return <Zap className='text-primary h-5 w-5' />
      default:
        return <Settings className='text-muted-foreground h-5 w-5' />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-primary/10 text-primary'
      case 'seo':
        return 'bg-primary/10 text-primary'
      case 'social':
        return 'bg-primary/10 text-primary'
      case 'email':
        return 'bg-primary/10 text-primary'
      case 'analytics':
        return 'bg-primary/10 text-primary'
      case 'security':
        return 'bg-primary/10 text-primary'
      case 'features':
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-muted/30 text-muted-foreground'
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter configurations based on search and type
  const filteredConfig: ConfigGroup = {}
  if (configData?.config) {
    Object.entries(configData.config).forEach(([type, configs]) => {
      if (selectedType && type !== selectedType) return

      const filtered = configs.filter(
        (config) =>
          !searchTerm ||
          config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          normalize_config_value(config.value).toLowerCase().includes(searchTerm.toLowerCase()) ||
          config.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (filtered.length > 0) {
        filteredConfig[type] = filtered
      }
    })
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='bg-muted mb-4 h-8 w-1/4 rounded'></div>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
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
          <h1 className='text-2xl font-bold'>Configuration</h1>
          <p className='text-muted-foreground'>Manage site settings and configuration</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={() => setShowAddForm(true)} className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Add Setting
          </Button>
          <Button onClick={() => refetch()} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-card border-border rounded-lg border p-4'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
              <input
                type='text'
                placeholder='Search configuration...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full rounded-md border py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-offset-2'
              />
            </div>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'
          >
            <option value=''>All Categories</option>
            <option value='general'>General</option>
            <option value='seo'>SEO</option>
            <option value='social'>Social</option>
            <option value='email'>Email</option>
            <option value='analytics'>Analytics</option>
            <option value='security'>Security</option>
            <option value='features'>Features</option>
          </select>
        </div>
      </div>

      {/* Add New Configuration Form */}
      {showAddForm && (
        <div className='bg-card border-border rounded-lg border p-6'>
          <h3 className='mb-4 text-lg font-medium'>Add New Configuration</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-2 block text-sm font-medium'>Key</label>
              <input
                type='text'
                value={newConfigKey}
                onChange={(e) => setNewConfigKey(e.target.value)}
                placeholder='config_key'
                className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Value</label>
              <input
                type='text'
                value={newConfigValue}
                onChange={(e) => setNewConfigValue(e.target.value)}
                placeholder='Configuration value'
                className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Category</label>
              <select
                value={newConfigType}
                onChange={(e) => {
                  if (is_config_type(e.target.value)) {
                    setNewConfigType(e.target.value)
                  }
                }}
                className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'
              >
                <option value='general'>General</option>
                <option value='seo'>SEO</option>
                <option value='social'>Social</option>
                <option value='email'>Email</option>
                <option value='analytics'>Analytics</option>
                <option value='security'>Security</option>
                <option value='features'>Features</option>
              </select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Description</label>
              <input
                type='text'
                value={newConfigDescription}
                onChange={(e) => setNewConfigDescription(e.target.value)}
                placeholder='Optional description'
                className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'
              />
            </div>
          </div>

          <div className='mt-4'>
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={newConfigIsPublic}
                onChange={(e) => setNewConfigIsPublic(e.target.checked)}
                className='border-border rounded'
              />
              <span className='text-muted-foreground text-sm'>
                Public (accessible by non-admin users)
              </span>
            </label>
          </div>

          <div className='mt-6 flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddConfig} disabled={updateConfig.isPending}>
              Add Configuration
            </Button>
          </div>
        </div>
      )}

      {/* Configuration Groups */}
      {Object.entries(filteredConfig).map(([type, configs]) => (
        <div key={type} className='bg-card border-border rounded-lg border'>
          <div className='border-border border-b px-6 py-4'>
            <div className='flex items-center gap-3'>
              {getTypeIcon(type)}
              <h3 className='text-lg font-medium capitalize'>{type} Settings</h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(type)}`}
              >
                {configs.length} items
              </span>
            </div>
          </div>

          <div className='divide-border divide-y'>
            {configs.map((config) => (
              <div key={config.id} className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      <h4 className='text-sm font-medium'>{config.key}</h4>
                      {config.isPublic ? (
                        <Eye className='text-primary h-4 w-4' />
                      ) : (
                        <EyeOff className='text-muted-foreground h-4 w-4' />
                      )}
                    </div>

                    {editingConfig?.id === config.id ? (
                      <div className='space-y-3'>
                        <textarea
                          ref={edit_textarea_ref}
                          defaultValue={normalize_config_value(config.value)}
                          onBlur={(e) => {
                            if (e.target.value === normalize_config_value(config.value)) {
                              setEditingConfig(null)
                            } else {
                              handleSaveConfig(config, e.target.value)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSaveConfig(config, e.currentTarget.value)
                            } else if (e.key === 'Escape') {
                              setEditingConfig(null)
                            }
                          }}
                          className='bg-background border-border text-foreground focus:ring-ring focus:ring-offset-background w-full resize-none rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-offset-2'
                          rows={3}
                        />
                        <div className='text-muted-foreground text-xs'>
                          Press Enter to save, Escape to cancel
                        </div>
                      </div>
                    ) : (
                      <div
                        className='text-muted-foreground hover:text-foreground cursor-pointer text-sm'
                        onClick={() => setEditingConfig(config)}
                      >
                        {normalize_config_value(config.value) || <em>No value set</em>}
                      </div>
                    )}

                    {config.description && (
                      <p className='text-muted-foreground mt-1 text-xs'>{config.description}</p>
                    )}

                    <div className='text-muted-foreground mt-2 text-xs'>
                      Updated by {config.updatedBy.name} on {formatDate(config.updatedAt)}
                    </div>
                  </div>

                  <div className='ml-4 flex items-center gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setEditingConfig(config)}
                      disabled={editingConfig?.id === config.id}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {Object.keys(filteredConfig).length === 0 && (
        <div className='py-12 text-center'>
          <Settings className='text-muted-foreground mx-auto h-12 w-12' />
          <h3 className='mt-2 text-sm font-medium'>No configuration found</h3>
          <p className='text-muted-foreground mt-1 text-sm'>
            {searchTerm || selectedType
              ? 'Try adjusting your filters.'
              : 'Get started by adding your first configuration setting.'}
          </p>
          {!searchTerm && !selectedType && (
            <div className='mt-6'>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Add Setting
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
