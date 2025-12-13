'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Wand2, Tag, FileText, Globe, Copy, Check, Loader2, Settings } from 'lucide-react'
import { Button } from '@tszhong0411/ui'

const default_existing_tags: string[] = []

type GenerationCardProps = {
  title: string
  icon: React.ComponentType<any>
  content: string | string[]
  isLoading: boolean
  onGenerate: () => void
  onCopy: () => void
  field: string
  copiedField: string | null
  disabled?: boolean
}

const GenerationCard = (props: GenerationCardProps) => {
  const {
    title,
    icon: Icon,
    content,
    isLoading,
    onGenerate,
    onCopy,
    field,
    copiedField,
    disabled
  } = props

  const has_content = Array.isArray(content) ? content.length > 0 : content.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-card space-y-3 rounded-lg border p-4'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon className='text-primary h-4 w-4' />
          <h3 className='text-sm font-medium'>{title}</h3>
        </div>
        <div className='flex items-center gap-2'>
          {has_content && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onCopy}
              className='h-6 w-6 p-0'
              type='button'
            >
              {copiedField === field ? (
                <Check className='h-3 w-3 text-green-500' />
              ) : (
                <Copy className='h-3 w-3' />
              )}
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={onGenerate}
            disabled={isLoading || disabled}
            type='button'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Wand2 className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      {has_content && (
        <div className='text-muted-foreground text-sm'>
          {Array.isArray(content) ? (
            <div className='flex flex-wrap gap-1'>
              {content.map((item, index) => (
                <span key={index} className='bg-muted rounded-md px-2 py-1 text-xs'>
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className='leading-relaxed'>{content}</p>
          )}
        </div>
      )}
    </motion.div>
  )
}

interface ContentAssistantProps {
  content?: string
  title?: string
  existingTags?: string[]
  onTagsGenerated?: (tags: string[]) => void
  onSummaryGenerated?: (summary: string) => void
  onMetaGenerated?: (meta: string) => void
  onTranslationGenerated?: (translation: string) => void
}

export default function ContentAssistant({
  content = '',
  title = '',
  existingTags = default_existing_tags,
  onTagsGenerated,
  onSummaryGenerated,
  onMetaGenerated,
  onTranslationGenerated
}: ContentAssistantProps) {
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<{
    tags: string[]
    summary: string
    metaDescription: string
    translation: string
  }>({
    tags: [],
    summary: '',
    metaDescription: '',
    translation: ''
  })
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'ollama'>('gemini')
  const [targetLanguage, setTargetLanguage] = useState('pt')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [availableProviders, setAvailableProviders] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)

  const get_copy_text = (value: string | string[]) =>
    Array.isArray(value) ? value.join(', ') : value

  React.useEffect(() => {
    // Check available providers on mount
    fetch('/api/ai/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.availableProviders) {
          setAvailableProviders(data.availableProviders)
          if (
            data.availableProviders.length > 0 &&
            !data.availableProviders.includes(selectedProvider)
          ) {
            setSelectedProvider(data.availableProviders[0])
          }
        }
      })
      .catch(console.error)
  }, [selectedProvider])

  const generateContent = async (action: string, additionalData: any = {}) => {
    if (!content && action !== 'translate') return

    setIsGenerating((prev) => ({ ...prev, [action]: true }))

    try {
      const response = await fetch('/api/ai/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          content,
          title,
          existingTags,
          provider: selectedProvider,
          toLang: targetLanguage,
          ...additionalData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      const result = data.result

      switch (action) {
        case 'tags':
          setResults((prev) => ({ ...prev, tags: result }))
          onTagsGenerated?.(result)
          break
        case 'summary':
          setResults((prev) => ({ ...prev, summary: result }))
          onSummaryGenerated?.(result)
          break
        case 'meta':
          setResults((prev) => ({ ...prev, metaDescription: result }))
          onMetaGenerated?.(result)
          break
        case 'translate':
          setResults((prev) => ({ ...prev, translation: result }))
          onTranslationGenerated?.(result)
          break
      }
    } catch (error) {
      console.error(`Error generating ${action}:`, error)
      // You could show a toast notification here
    } finally {
      setIsGenerating((prev) => ({ ...prev, [action]: false }))
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (availableProviders.length === 0) {
    return (
      <div className='space-y-3 rounded-lg border p-6 text-center'>
        <div className='bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
          <Wand2 className='text-muted-foreground h-6 w-6' />
        </div>
        <h3 className='font-medium'>AI Content Assistant</h3>
        <p className='text-muted-foreground text-sm'>
          No AI providers are currently available. Check your environment configuration.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header with Settings */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Wand2 className='text-primary h-5 w-5' />
          <h2 className='font-semibold'>AI Content Assistant</h2>
        </div>
        <Button variant='ghost' size='sm' onClick={() => setShowSettings(!showSettings)}>
          <Settings className='h-4 w-4' />
        </Button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='bg-muted/50 space-y-4 rounded-lg border p-4'
          >
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium'>AI Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as 'gemini' | 'ollama')}
                  className='bg-background w-full rounded-md border p-2 text-sm'
                >
                  {availableProviders.includes('gemini') && (
                    <option value='gemini'>Google Gemini (Free)</option>
                  )}
                  {availableProviders.includes('ollama') && (
                    <option value='ollama'>Ollama (Local)</option>
                  )}
                </select>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium'>Target Language</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className='bg-background w-full rounded-md border p-2 text-sm'
                >
                  <option value='pt'>Português</option>
                  <option value='en'>English</option>
                  <option value='fr'>Français</option>
                  <option value='de'>Deutsch</option>
                  <option value='zh'>中文</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Tools */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <GenerationCard
          title='Generate Tags'
          icon={Tag}
          content={results.tags}
          isLoading={!!isGenerating.tags}
          onGenerate={() => generateContent('tags')}
          onCopy={() => void copyToClipboard(get_copy_text(results.tags), 'tags')}
          field='tags'
          copiedField={copiedField}
          disabled={!content}
        />

        <GenerationCard
          title='Generate Summary'
          icon={FileText}
          content={results.summary}
          isLoading={!!isGenerating.summary}
          onGenerate={() => generateContent('summary')}
          onCopy={() => void copyToClipboard(get_copy_text(results.summary), 'summary')}
          field='summary'
          copiedField={copiedField}
          disabled={!content}
        />

        <GenerationCard
          title='Meta Description'
          icon={FileText}
          content={results.metaDescription}
          isLoading={!!isGenerating.meta}
          onGenerate={() => generateContent('meta')}
          onCopy={() => void copyToClipboard(get_copy_text(results.metaDescription), 'meta')}
          field='meta'
          copiedField={copiedField}
          disabled={!content || !title}
        />

        <GenerationCard
          title={`Translate to ${targetLanguage.toUpperCase()}`}
          icon={Globe}
          content={results.translation}
          isLoading={!!isGenerating.translate}
          onGenerate={() => generateContent('translate')}
          onCopy={() => void copyToClipboard(get_copy_text(results.translation), 'translation')}
          field='translation'
          copiedField={copiedField}
          disabled={!content}
        />
      </div>

      {/* Status Info */}
      <div className='text-muted-foreground bg-muted/30 rounded-lg p-3 text-xs'>
        <div className='flex items-center justify-between'>
          <span>
            Using:{' '}
            <strong>{selectedProvider === 'gemini' ? 'Google Gemini' : 'Ollama (Local)'}</strong>
          </span>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-green-500'></div>
            <span>Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
