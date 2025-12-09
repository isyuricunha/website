'use client'

import React, { useState } from 'react'
import { Button } from '@tszhong0411/ui'
import ContentAssistant from '@/components/ai/content-assistant'

// Exemplo de como integrar o ContentAssistant em um editor de blog
export default function BlogEditorWithAI() {
  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [] as string[],
    metaDescription: ''
  })

  const [showAI, setShowAI] = useState(false)

  // Exemplo de tags existentes no sistema
  const existingTags = [
    'nextjs', 'react', 'typescript', 'javascript', 'css', 'html',
    'web-development', 'frontend', 'backend', 'database', 'tutorial',
    'guide', 'tips', 'performance', 'seo', 'accessibility'
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Editor de Blog com IA</h1>
      
      {/* Formulário do Post */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título</label>
          <input
            type="text"
            value={post.title}
            onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            placeholder="Digite o título do post..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Conteúdo</label>
          <textarea
            value={post.content}
            onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
            className="w-full p-3 border rounded-lg h-64"
            placeholder="Escreva o conteúdo do post..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Resumo/Excerpt</label>
            <textarea
              value={post.excerpt}
              onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full p-3 border rounded-lg h-20"
              placeholder="Resumo do post (será gerado automaticamente)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Meta Description</label>
            <textarea
              value={post.metaDescription}
              onChange={(e) => setPost(prev => ({ ...prev, metaDescription: e.target.value }))}
              className="w-full p-3 border rounded-lg h-20"
              placeholder="Meta description para SEO (será gerada automaticamente)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => setPost(prev => ({
                    ...prev,
                    tags: prev.tags.filter((_, i) => i !== index)
                  }))}
                  className="text-primary hover:text-primary/70"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            placeholder="Tags serão geradas automaticamente ou digite manualmente..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim()
                if (value && !post.tags.includes(value)) {
                  setPost(prev => ({ ...prev, tags: [...prev.tags, value] }))
                  e.currentTarget.value = ''
                }
              }
            }}
          />
        </div>
      </div>

      {/* Botão para mostrar/esconder IA */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setShowAI(!showAI)}
          variant={showAI ? "default" : "outline"}
        >
          {showAI ? 'Esconder' : 'Mostrar'} Assistente de IA
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Caracteres no conteúdo: {post.content.length}
        </div>
      </div>

      {/* Content Assistant */}
      {showAI && (
        <ContentAssistant
          content={post.content}
          title={post.title}
          existingTags={existingTags}
          onTagsGenerated={(tags) => {
            setPost(prev => ({ ...prev, tags }))
          }}
          onSummaryGenerated={(summary) => {
            setPost(prev => ({ ...prev, excerpt: summary }))
          }}
          onMetaGenerated={(meta) => {
            setPost(prev => ({ ...prev, metaDescription: meta }))
          }}
          onTranslationGenerated={(translation) => {
            // Você pode fazer algo com a tradução aqui
            console.log('Tradução gerada:', translation)
          }}
        />
      )}

      {/* Preview do Post */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-3">Preview do Post</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Título:</strong> {post.title || 'Sem título'}</div>
          <div><strong>Excerpt:</strong> {post.excerpt || 'Sem resumo'}</div>
          <div><strong>Meta Description:</strong> {post.metaDescription || 'Sem meta description'}</div>
          <div><strong>Tags:</strong> {post.tags.join(', ') || 'Sem tags'}</div>
          <div><strong>Conteúdo:</strong> {post.content.substring(0, 100)}...</div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button 
          onClick={() => console.log('Salvando post:', post)}
          disabled={!post.title || !post.content}
        >
          Salvar Post
        </Button>
        <Button 
          variant="outline"
          onClick={() => setPost({ title: '', content: '', excerpt: '', tags: [], metaDescription: '' })}
        >
          Limpar
        </Button>
      </div>
    </div>
  )
}
