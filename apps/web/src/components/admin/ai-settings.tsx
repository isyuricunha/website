'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ScrollArea
} from '@isyuricunha/ui'
import { cn } from '@isyuricunha/utils'
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  RefreshCwIcon,
  SaveIcon,
  SearchIcon,
  ServerIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { api } from '@/trpc/react'

export const AiSettings = () => {
  const initialized = useRef(false)
  const [endpoint, setEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [modelSearch, setModelSearch] = useState('')
  const [models, setModels] = useState<string[]>([])
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null)
  const [configSource, setConfigSource] = useState<'database' | 'environment' | null>(null)
  const [modelsCached, setModelsCached] = useState<boolean | null>(null)
  const [modelsFetchedAt, setModelsFetchedAt] = useState<string | null>(null)

  const settingsQuery = api.aiSettings.getSettings.useQuery()
  const loadModelsMutation = api.aiSettings.listModels.useMutation({
    onSuccess: (data) => {
      setModels(data.models)
      setModelsCached(data.cached)
      setModelsFetchedAt(data.fetchedAt)
      toast.success(`${data.models.length} models loaded`)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const saveSettingsMutation = api.aiSettings.saveSettings.useMutation({
    onSuccess: async (data) => {
      setApiKey('')
      setApiKeyPreview(data.apiKeyPreview)
      setConfigSource(data.source)
      toast.success('Runtime settings saved')
      await settingsQuery.refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  useEffect(() => {
    const settings = settingsQuery.data
    if (!settings || initialized.current) return

    initialized.current = true
    setEndpoint(settings.endpoint)
    setModel(settings.model)
    setApiKeyPreview(settings.apiKeyPreview)
    setConfigSource(settings.source)
  }, [settingsQuery.data])

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase()
    if (!query) return models
    return models.filter((item) => item.toLowerCase().includes(query))
  }, [modelSearch, models])

  const loadModels = (forceRefresh: boolean) => {
    if (!endpoint.trim()) {
      toast.error('Enter an endpoint before loading models')
      return
    }
    if (!apiKey.trim() && !apiKeyPreview) {
      toast.error('Enter an API key before loading models')
      return
    }

    loadModelsMutation.mutate({
      endpoint: endpoint.trim(),
      apiKey: apiKey.trim() || undefined,
      forceRefresh
    })
  }

  const saveSettings = () => {
    if (!endpoint.trim() || !model.trim()) {
      toast.error('Endpoint and model are required')
      return
    }
    if (!apiKey.trim() && !apiKeyPreview) {
      toast.error('API key is required')
      return
    }

    saveSettingsMutation.mutate({
      endpoint: endpoint.trim(),
      model: model.trim(),
      apiKey: apiKey.trim() || undefined
    })
  }

  const isLoading = settingsQuery.isLoading
  const isBusy = loadModelsMutation.isPending || saveSettingsMutation.isPending

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Runtime AI settings</h1>
        <p className='text-text-secondary mt-1 text-sm'>
          Change the API key, endpoint and model without deploying the website.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <CardTitle>Connection</CardTitle>
              <CardDescription>
                The key is encrypted before it is stored and is never returned to the browser.
              </CardDescription>
            </div>
            {configSource ? (
              <Badge variant={configSource === 'database' ? 'default' : 'secondary'}>
                {configSource === 'database' ? 'Runtime configuration' : 'Environment fallback'}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='ai-api-key'>API key</Label>
            <div className='relative'>
              <KeyRoundIcon className='text-text-tertiary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                id='ai-api-key'
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder={
                  apiKeyPreview ? `Configured key ending in ${apiKeyPreview}` : 'Enter API key'
                }
                autoComplete='new-password'
                className='pr-11 pl-10'
                disabled={isLoading || isBusy}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2'
                onClick={() => setShowApiKey((value) => !value)}
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
              </Button>
            </div>
            <p className='text-text-tertiary text-xs'>
              Leave this field empty to keep the currently stored key.
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ai-endpoint'>Endpoint</Label>
            <div className='relative'>
              <ServerIcon className='text-text-tertiary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                id='ai-endpoint'
                type='url'
                value={endpoint}
                onChange={(event) => setEndpoint(event.target.value)}
                placeholder='https://example.com/v1'
                className='pl-10'
                disabled={isLoading || isBusy}
              />
            </div>
            <p className='text-text-tertiary text-xs'>
              Use the API base URL. The server calls /models and /chat/completions below it.
            </p>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='secondary'
              onClick={() => loadModels(false)}
              disabled={isLoading || isBusy}
            >
              <RefreshCwIcon
                className={cn('mr-2 h-4 w-4', loadModelsMutation.isPending && 'animate-spin')}
              />
              Load models
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => loadModels(true)}
              disabled={isLoading || isBusy}
            >
              Refresh cache
            </Button>
            {modelsCached !== null ? (
              <span className='text-text-tertiary self-center text-xs'>
                {modelsCached ? 'Loaded from cache' : 'Loaded from endpoint'}
                {modelsFetchedAt ? ` · ${new Date(modelsFetchedAt).toLocaleString()}` : ''}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model</CardTitle>
          <CardDescription>Search the models returned by the configured endpoint.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='selected-model'>Selected model</Label>
            <Input id='selected-model' value={model} readOnly placeholder='Load and select a model' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='model-search'>Search models</Label>
            <div className='relative'>
              <SearchIcon className='text-text-tertiary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                id='model-search'
                value={modelSearch}
                onChange={(event) => setModelSearch(event.target.value)}
                placeholder='Search by model ID'
                className='pl-10'
                disabled={models.length === 0 || isBusy}
              />
            </div>
          </div>

          <ScrollArea className='h-72 rounded-md border border-[var(--border-faint)]'>
            <div className='p-2'>
              {filteredModels.length > 0 ? (
                filteredModels.map((item) => {
                  const selected = item === model
                  return (
                    <button
                      key={item}
                      type='button'
                      className={cn(
                        'hover:bg-bg-surface flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                        selected && 'bg-action-primary-soft text-action-primary'
                      )}
                      onClick={() => setModel(item)}
                    >
                      <CheckIcon className={cn('h-4 w-4', !selected && 'opacity-0')} />
                      <span className='min-w-0 flex-1 truncate font-mono'>{item}</span>
                    </button>
                  )
                })
              ) : (
                <div className='text-text-tertiary flex h-64 items-center justify-center px-4 text-center text-sm'>
                  {models.length === 0
                    ? 'Load models from the endpoint to choose one.'
                    : 'No models match the current search.'}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className='flex justify-end'>
            <Button type='button' onClick={saveSettings} disabled={isLoading || isBusy}>
              <SaveIcon className='mr-2 h-4 w-4' />
              {saveSettingsMutation.isPending ? 'Saving...' : 'Save settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
