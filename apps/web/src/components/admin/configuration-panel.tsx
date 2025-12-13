'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@tszhong0411/ui'
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

interface ConfigItem {
  id: string
  key: string
  value?: string
  type: 'general' | 'seo' | 'social' | 'email' | 'analytics' | 'security' | 'features'
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
  const [newConfigType, setNewConfigType] = useState<
    'general' | 'seo' | 'social' | 'email' | 'analytics' | 'security' | 'features'
  >('general')
  const [newConfigDescription, setNewConfigDescription] = useState('')
  const [newConfigIsPublic, setNewConfigIsPublic] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

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
      refetch()
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
        return <Settings className='h-5 w-5 text-gray-500' />
      case 'seo':
        return <Search className='h-5 w-5 text-green-500' />
      case 'social':
        return <Globe className='h-5 w-5 text-blue-500' />
      case 'email':
        return <Mail className='h-5 w-5 text-purple-500' />
      case 'analytics':
        return <BarChart3 className='h-5 w-5 text-orange-500' />
      case 'security':
        return <Shield className='h-5 w-5 text-red-500' />
      case 'features':
        return <Zap className='h-5 w-5 text-yellow-500' />
      default:
        return <Settings className='h-5 w-5 text-gray-500' />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      case 'seo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'social':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'email':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'analytics':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'features':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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
          config.value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <div className='mb-4 h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
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
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Configuration</h1>
          <p className='text-gray-600 dark:text-gray-400'>Manage site settings and configuration</p>
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
      <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <input
                type='text'
                placeholder='Search configuration...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              />
            </div>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className='rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
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
        <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-medium text-gray-900 dark:text-white'>
            Add New Configuration
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Key
              </label>
              <input
                type='text'
                value={newConfigKey}
                onChange={(e) => setNewConfigKey(e.target.value)}
                placeholder='config_key'
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Value
              </label>
              <input
                type='text'
                value={newConfigValue}
                onChange={(e) => setNewConfigValue(e.target.value)}
                placeholder='Configuration value'
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Category
              </label>
              <select
                value={newConfigType}
                onChange={(e) => setNewConfigType(e.target.value as any)}
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
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
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Description
              </label>
              <input
                type='text'
                value={newConfigDescription}
                onChange={(e) => setNewConfigDescription(e.target.value)}
                placeholder='Optional description'
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              />
            </div>
          </div>

          <div className='mt-4'>
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={newConfigIsPublic}
                onChange={(e) => setNewConfigIsPublic(e.target.checked)}
                className='rounded border-gray-300 dark:border-gray-600'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
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
        <div
          key={type}
          className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
        >
          <div className='border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
            <div className='flex items-center gap-3'>
              {getTypeIcon(type)}
              <h3 className='text-lg font-medium capitalize text-gray-900 dark:text-white'>
                {type} Settings
              </h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(type)}`}
              >
                {configs.length} items
              </span>
            </div>
          </div>

          <div className='divide-y divide-gray-200 dark:divide-gray-700'>
            {configs.map((config) => (
              <div key={config.id} className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                        {config.key}
                      </h4>
                      {config.isPublic ? (
                        <Eye className='h-4 w-4 text-green-500' />
                      ) : (
                        <EyeOff className='h-4 w-4 text-gray-400' />
                      )}
                    </div>

                    {editingConfig?.id === config.id ? (
                      <div className='space-y-3'>
                        <textarea
                          ref={edit_textarea_ref}
                          defaultValue={config.value || ''}
                          onBlur={(e) => {
                            if (e.target.value === config.value) {
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
                          className='w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                          rows={3}
                        />
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          Press Enter to save, Escape to cancel
                        </div>
                      </div>
                    ) : (
                      <div
                        className='cursor-pointer text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        onClick={() => setEditingConfig(config)}
                      >
                        {config.value || <em>No value set</em>}
                      </div>
                    )}

                    {config.description && (
                      <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                        {config.description}
                      </p>
                    )}

                    <div className='mt-2 text-xs text-gray-400'>
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
          <Settings className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
            No configuration found
          </h3>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
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
