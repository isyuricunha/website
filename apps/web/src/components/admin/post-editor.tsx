'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Eye, Wand2, Languages, Hash, FileText } from 'lucide-react'

import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from '@tszhong0411/ui'
import { toast } from 'sonner'

interface PostData {
  slug: string
  title: string
  summary: string
  content: string
  tags?: string[]
}

interface PostEditorProps {
  initialData?: Partial<PostData>
  mode: 'create' | 'edit'
  locale: string
}

export function PostEditor({ initialData, mode, locale }: PostEditorProps) {
  const router = useRouter()
  
  const [postData, setPostData] = useState<PostData>({
    slug: initialData?.slug || '',
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    tags: initialData?.tags || []
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)

  // Auto-generate slug from title
  const handleTitleChange = useCallback((title: string) => {
    setPostData(prev => ({
      ...prev,
      title,
      slug: mode === 'create' ? generateSlug(title) : prev.slug
    }))
  }, [mode])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // AI Content Generation
  const generateWithAI = async (action: 'tags' | 'summary') => {
    if (!postData.content.trim()) {
      toast.error("Please write some content first before generating AI suggestions.")
      return
    }

    setAiLoading(action)
    
    try {
      const response = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          content: postData.content,
          title: postData.title,
          provider: 'ollama',
          language: 'en'
        })
      })

      if (!response.ok) throw new Error('AI generation failed')
      
      const result = await response.json()
      
      if (action === 'tags') {
        const tags = result.result.split(',').map((tag: string) => tag.trim())
        setPostData(prev => ({ ...prev, tags }))
      } else if (action === 'summary') {
        setPostData(prev => ({ ...prev, summary: result.result }))
      }
      
      toast.success(`${action} generated successfully!`)
    } catch {
      toast.error("AI generation failed. Please try again.")
    } finally {
      setAiLoading(null)
    }
  }

  // Save post
  const handleSave = async () => {
    if (!postData.title.trim() || !postData.content.trim()) {
      toast.error("Please fill in title and content.")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/posts', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postData,
          locale,
          date: new Date().toISOString(),
          modifiedTime: new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error('Save failed')
      
      toast.success(`Post ${mode === 'create' ? 'created' : 'updated'} successfully!`)
      router.push(`/admin/posts`)
    } catch {
      toast.error("Failed to save post. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'create' ? 'Create New Post' : 'Edit Post'}
          </h1>
          <p className="text-muted-foreground">
            Write your content and let AI help with optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Post
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={postData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={postData.slug}
                  onChange={(e) => setPostData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={postData.content}
                onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post content here... (Markdown supported)"
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="space-y-6">
          {/* AI Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateWithAI('tags')}
                disabled={aiLoading === 'tags'}
              >
                {aiLoading === 'tags' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Hash className="mr-2 h-4 w-4" />
                )}
                Generate Tags
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateWithAI('summary')}
                disabled={aiLoading === 'summary'}
              >
                {aiLoading === 'summary' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate Summary
              </Button>
              
              <Separator />
              
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!postData.slug}
              >
                <Languages className="mr-2 h-4 w-4" />
                Auto-Translate
              </Button>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={postData.summary}
                onChange={(e) => setPostData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary of your post..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {postData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (comma separated)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim()
                      if (value) {
                        const newTags = value.split(',').map(tag => tag.trim())
                        setPostData(prev => ({
                          ...prev,
                          tags: [...(prev.tags || []), ...newTags]
                        }))
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Quick Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Title:</span> {postData.title || 'Untitled'}
                </div>
                <div>
                  <span className="font-medium">Slug:</span> {postData.slug || 'no-slug'}
                </div>
                <div>
                  <span className="font-medium">Content:</span> {postData.content.length} characters
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
