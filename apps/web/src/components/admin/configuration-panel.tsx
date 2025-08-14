'use client'

import { useState, useEffect } from 'react'
import { Button } from '@tszhong0411/ui'
import { 
  Settings, 
  Save, 
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
  Plus,
  Trash2
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
  const [newConfigKey, setNewConfigKey] = useState('')
  const [newConfigValue, setNewConfigValue] = useState('')
  const [newConfigType, setNewConfigType] = useState<'general' | 'seo' | 'social' | 'email' | 'analytics' | 'security' | 'features'>('general')
  const [newConfigDescription, setNewConfigDescription] = useState('')
  const [newConfigIsPublic, setNewConfigIsPublic] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

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
        return <Settings className="w-5 h-5 text-gray-500" />
      case 'seo':
        return <Search className="w-5 h-5 text-green-500" />
      case 'social':
        return <Globe className="w-5 h-5 text-blue-500" />
      case 'email':
        return <Mail className="w-5 h-5 text-purple-500" />
      case 'analytics':
        return <BarChart3 className="w-5 h-5 text-orange-500" />
      case 'security':
        return <Shield className="w-5 h-5 text-red-500" />
      case 'features':
        return <Zap className="w-5 h-5 text-yellow-500" />
      default:
        return <Settings className="w-5 h-5 text-gray-500" />
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
      
      const filtered = configs.filter(config => 
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage site settings and configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Setting
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search configuration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="seo">SEO</option>
            <option value="social">Social</option>
            <option value="email">Email</option>
            <option value="analytics">Analytics</option>
            <option value="security">Security</option>
            <option value="features">Features</option>
          </select>
        </div>
      </div>

      {/* Add New Configuration Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key
              </label>
              <input
                type="text"
                value={newConfigKey}
                onChange={(e) => setNewConfigKey(e.target.value)}
                placeholder="config_key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Value
              </label>
              <input
                type="text"
                value={newConfigValue}
                onChange={(e) => setNewConfigValue(e.target.value)}
                placeholder="Configuration value"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={newConfigType}
                onChange={(e) => setNewConfigType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="seo">SEO</option>
                <option value="social">Social</option>
                <option value="email">Email</option>
                <option value="analytics">Analytics</option>
                <option value="security">Security</option>
                <option value="features">Features</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newConfigDescription}
                onChange={(e) => setNewConfigDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfigIsPublic}
                onChange={(e) => setNewConfigIsPublic(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Public (accessible by non-admin users)
              </span>
            </label>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddConfig}
              disabled={updateConfig.isPending}
            >
              Add Configuration
            </Button>
          </div>
        </div>
      )}

      {/* Configuration Groups */}
      {Object.entries(filteredConfig).map(([type, configs]) => (
        <div key={type} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {getTypeIcon(type)}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                {type} Settings
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
                {configs.length} items
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {configs.map((config) => (
              <div key={config.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {config.key}
                      </h4>
                      {config.isPublic ? (
                        <Eye className="w-4 h-4 text-green-500" title="Public" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" title="Private" />
                      )}
                    </div>
                    
                    {editingConfig?.id === config.id ? (
                      <div className="space-y-3">
                        <textarea
                          defaultValue={config.value || ''}
                          onBlur={(e) => {
                            if (e.target.value !== config.value) {
                              handleSaveConfig(config, e.target.value)
                            } else {
                              setEditingConfig(null)
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
                          autoFocus
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Press Enter to save, Escape to cancel
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                        onClick={() => setEditingConfig(config)}
                      >
                        {config.value || <em>No value set</em>}
                      </div>
                    )}
                    
                    {config.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {config.description}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-400 mt-2">
                      Updated by {config.updatedBy.name} on {formatDate(config.updatedAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingConfig(config)}
                      disabled={editingConfig?.id === config.id}
                    >
                      <Edit className="w-4 h-4" />
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
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No configuration found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || selectedType ? 'Try adjusting your filters.' : 'Get started by adding your first configuration setting.'}
          </p>
          {!searchTerm && !selectedType && (
            <div className="mt-6">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Setting
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
