'use client'

import { useState, useEffect } from 'react'
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
  Globe,
  FileText,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface TranslationManagerProps {
  locale: string
}

interface Post {
  slug: string
  title: string
  summary: string
  locale: string
  date: string
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

export function TranslationManager({ locale }: TranslationManagerProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<Record<string, Post[]>>({})
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [sourceLocale, setSourceLocale] = useState<string>('en')
  const [targetLocales, setTargetLocales] = useState<string[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResults, setTranslationResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/posts/list')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.postsBySlug || {})
      }
    } catch (error) {
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranslate = async () => {
    if (!selectedSlug) {
      toast.error('Please select a post to translate')
      return
    }

    if (targetLocales.length === 0) {
      toast.error('Please select at least one target language')
      return
    }

    setIsTranslating(true)
    setTranslationResults([])

    try {
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSlug,
          sourceLocale,
          targetLocales,
          provider: 'ollama' // Using Ollama for local translation
        })
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const result = await response.json()
      setTranslationResults(result.results || [])
      
      const successCount = result.results.filter((r: any) => r.success).length
      const totalCount = result.results.length
      
      if (successCount === totalCount) {
        toast.success(`Successfully translated to ${successCount} languages!`)
      } else if (successCount > 0) {
        toast.warning(`Translated to ${successCount}/${totalCount} languages`)
      } else {
        toast.error('Translation failed for all languages')
      }

      // Refresh posts list
      await fetchPosts()
    } catch (error) {
      toast.error('Translation failed. Make sure Ollama is running locally.')
    } finally {
      setIsTranslating(false)
    }
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

  const selectAllMissingTranslations = () => {
    if (!selectedSlug || !posts[selectedSlug]) return

    const existingLocales = posts[selectedSlug].map(p => p.locale)
    const missingLocales = SUPPORTED_LOCALES
      .map(l => l.code)
      .filter(code => code !== sourceLocale && !existingLocales.includes(code))
    
    setTargetLocales(missingLocales)
  }

  const getTranslationStatus = (slug: string) => {
    if (!posts[slug]) return { total: 0, translated: 0, percentage: 0 }
    
    const translated = posts[slug].length
    const total = SUPPORTED_LOCALES.length
    const percentage = Math.round((translated / total) * 100)
    
    return { total, translated, percentage }
  }

  const slugs = Object.keys(posts).sort((a, b) => {
    const aPost = posts[a][0]
    const bPost = posts[b][0]
    return new Date(bPost.date).getTime() - new Date(aPost.date).getTime()
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Translation Manager</h1>
          <p className="text-muted-foreground">
            Translate your blog posts to multiple languages using AI
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/posts')}>
          <FileText className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
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
                Make sure Ollama is running locally on port 11434. Set OLLAMA_BASE_URL and OLLAMA_MODEL in your .env.local file.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Post Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Select Post to Translate</CardTitle>
            <CardDescription>
              Choose a post and target languages for translation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Post Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Post</label>
              <Select value={selectedSlug} onValueChange={setSelectedSlug}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a post..." />
                </SelectTrigger>
                <SelectContent>
                  {slugs.map((slug) => {
                    const mainPost = posts[slug].find(p => p.locale === 'en') || posts[slug][0]
                    const status = getTranslationStatus(slug)
                    return (
                      <SelectItem key={slug} value={slug}>
                        <div className="flex items-center justify-between w-full">
                          <span>{mainPost.title}</span>
                          <Badge variant="secondary" className="ml-2">
                            {status.translated}/{status.total}
                          </Badge>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Source Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Language</label>
              <Select value={sourceLocale} onValueChange={setSourceLocale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LOCALES.map((lang) => (
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
                  onClick={selectAllMissingTranslations}
                  disabled={!selectedSlug}
                >
                  Select Missing
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUPPORTED_LOCALES.map((lang) => {
                  const isSource = lang.code === sourceLocale
                  const isSelected = targetLocales.includes(lang.code)
                  const hasTranslation = selectedSlug && posts[selectedSlug]?.some(p => p.locale === lang.code)
                  
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

            {/* Translate Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleTranslate}
              disabled={!selectedSlug || targetLocales.length === 0 || isTranslating}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate to {targetLocales.length} Language{targetLocales.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            {/* Translation Results */}
            {translationResults.length > 0 && (
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
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSlug && posts[selectedSlug] ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Translation Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {getTranslationStatus(selectedSlug).translated}/{getTranslationStatus(selectedSlug).total}
                    </span>
                  </div>
                  <Progress value={getTranslationStatus(selectedSlug).percentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Available Translations</h4>
                  <div className="space-y-1">
                    {posts[selectedSlug].map((post) => {
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
                      .filter(lang => !posts[selectedSlug].some(p => p.locale === lang.code))
                      .map((lang) => (
                        <div key={lang.code} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a post to view translation status</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
