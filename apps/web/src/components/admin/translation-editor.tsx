'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@tszhong0411/ui'
import { 
  Languages, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import type { BlogPostMetadata } from '@/lib/blog/blog-service'

interface TranslationEditorProps {
  slug: string
  posts: BlogPostMetadata[]
  currentLocale: string
}

const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' }
]

export function TranslationEditor({ slug, posts, currentLocale }: TranslationEditorProps) {
  const router = useRouter()
  const [sourceLocale, setSourceLocale] = useState<string>('en')
  const [targetLocales, setTargetLocales] = useState<string[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResults, setTranslationResults] = useState<any[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [pollIntervalRef, setPollIntervalRef] = useState<NodeJS.Timeout | null>(null)

  const existingLocales = posts.map(p => p.locale)
  const mainPost = posts.find(p => p.locale === 'en') || posts[0]

  const handleTranslate = async () => {
    if (targetLocales.length === 0) {
      toast.error('Please select at least one target language')
      return
    }

    setIsTranslating(true)
    setTranslationResults([])
    setProgress(0)

    try {
      // Start translation job
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          sourceLocale,
          targetLocales,
          provider: 'ollama'
        })
      })

      if (!response.ok) {
        throw new Error('Translation failed to start')
      }

      const result = await response.json()
      console.log('API Response:', result)
      
      if (!result.jobId) {
        throw new Error('No jobId returned from API')
      }
      
      const newJobId = String(result.jobId)
      setJobId(newJobId)
      
      console.log('Translation job started with ID:', newJobId)
      toast.success('Translation started! This may take several minutes...')
      
      // Poll for progress
      pollTranslationStatus(newJobId)
    } catch (error) {
      toast.error('Translation failed. Make sure Ollama is running locally.')
      setIsTranslating(false)
    }
  }

  const pollTranslationStatus = async (jobIdStr: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/translate?jobId=${encodeURIComponent(jobIdStr)}`)
        if (!response.ok) {
          clearInterval(pollInterval)
          setIsTranslating(false)
          toast.error('Failed to check translation status')
          return
        }

        const job = await response.json()
        setProgress(job.progress || 0)
        setTranslationResults(job.results || [])

        if (job.status === 'completed') {
          clearInterval(pollInterval)
          setIsTranslating(false)
          
          const successCount = (job.results || []).filter((r: any) => r.success).length
          const totalCount = (job.results || []).length
          
          if (successCount === totalCount) {
            toast.success(`Successfully translated to ${successCount} languages!`)
            setTimeout(() => router.push('/admin/posts'), 2000)
          } else if (successCount > 0) {
            toast.warning(`Translated to ${successCount}/${totalCount} languages`)
          } else {
            toast.error('Translation failed for all languages')
          }
        } else if (job.status === 'failed') {
          clearInterval(pollInterval)
          setIsTranslating(false)
          toast.error('Translation job failed')
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 3000) // Poll every 3 seconds
    
    setPollIntervalRef(pollInterval)
  }

  const toggleTargetLocale = (localeCode: string) => {
    if (localeCode === sourceLocale) {
      toast.error('Cannot translate to the same language')
      return
    }

    setTargetLocales(prev => 
      prev.includes(localeCode)
        ? prev.filter(l => l !== localeCode)
        : [...prev, localeCode]
    )
  }

  const selectAllMissing = () => {
    const missingLocales = SUPPORTED_LOCALES
      .map(l => l.code)
      .filter(code => code !== sourceLocale && !existingLocales.includes(code))
    
    setTargetLocales(missingLocales)
  }

  const translatedCount = existingLocales.length
  const totalCount = SUPPORTED_LOCALES.length
  const percentage = Math.round((translatedCount / totalCount) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/posts')} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Translate Post</h1>
          <p className="text-muted-foreground">
            {mainPost.title}
          </p>
        </div>
      </div>

      {/* AI Provider Info */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Using Ollama for Local Translation
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Translation preserves formatting and technical terms. This may take several minutes depending on your hardware.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Translation Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Translation Settings</CardTitle>
            <CardDescription>
              Choose source language and target languages for translation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Source Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Language</label>
              <Select value={sourceLocale} onValueChange={setSourceLocale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LOCALES.filter(lang => existingLocales.includes(lang.code)).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Languages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Target Languages</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllMissing}
                >
                  Select All Missing
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUPPORTED_LOCALES.map((lang) => {
                  const isSource = lang.code === sourceLocale
                  const isSelected = targetLocales.includes(lang.code)
                  const hasTranslation = existingLocales.includes(lang.code)
                  
                  return (
                    <Button
                      key={lang.code}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => toggleTargetLocale(lang.code)}
                      disabled={isSource}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.label}</span>
                      {hasTranslation && (
                        <CheckCircle className="h-3 w-3 ml-2 text-green-600" />
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Progress Bar */}
            {isTranslating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Translation Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Processing... This may take several minutes. Do not close this page.
                </p>
              </div>
            )}

            {/* Translate Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleTranslate}
              disabled={targetLocales.length === 0 || isTranslating}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating... {progress}%
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate to {targetLocales.length} Language{targetLocales.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            {/* Translation Results */}
            {translationResults && translationResults.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-medium">Translation Results</h3>
                <div className="space-y-2">
                  {translationResults.map((result, index) => {
                    const lang = SUPPORTED_LOCALES.find(l => l.code === result.locale)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang?.flag}</span>
                          <span className="font-medium">{lang?.label}</span>
                        </div>
                        {result.success ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Success</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">{result.error || 'Failed'}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Translation Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Translation Progress</span>
                <span className="text-sm text-muted-foreground">
                  {translatedCount}/{totalCount}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Available Translations</h4>
              <div className="space-y-1">
                {posts.map((post) => {
                  const lang = SUPPORTED_LOCALES.find(l => l.code === post.locale)
                  return (
                    <div key={post.locale} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{lang?.flag}</span>
                      <span>{lang?.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Missing Translations</h4>
              <div className="space-y-1">
                {SUPPORTED_LOCALES
                  .filter(lang => !existingLocales.includes(lang.code))
                  .map((lang) => (
                    <div key={lang.code} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
