// Exemplos práticos de uso do sistema de IA

// 1. Gerar tags para um post
export async function generatePostTags(content: string, existingTags: string[] = []) {
  const response = await fetch('/api/ai/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'tags',
      content,
      existingTags,
      provider: 'ollama' // ou 'gemini'
    })
  })
  
  const data = await response.json()
  return data.result // Array de strings: ['nextjs', 'react', 'typescript']
}

// 2. Gerar resumo para excerpt
export async function generatePostSummary(content: string, maxLength: number = 200) {
  const response = await fetch('/api/ai/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'summary',
      content,
      maxLength,
      provider: 'ollama'
    })
  })
  
  const data = await response.json()
  return data.result // String: "Este tutorial ensina como..."
}

// 3. Gerar meta description SEO
export async function generateMetaDescription(title: string, content: string) {
  const response = await fetch('/api/ai/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'meta',
      title,
      content,
      provider: 'ollama'
    })
  })
  
  const data = await response.json()
  return data.result // String: "Aprenda Next.js 15 com Server Components..."
}

// 4. Traduzir conteúdo
export async function translateContent(
  content: string, 
  fromLang: string = 'en', 
  toLang: string = 'pt'
) {
  const response = await fetch('/api/ai/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'translate',
      content,
      fromLang,
      toLang,
      provider: 'ollama'
    })
  })
  
  const data = await response.json()
  return data.result // String traduzida
}

// 5. Exemplo de uso completo em um componente
export async function processNewBlogPost(postData: {
  title: string
  content: string
  existingTags: string[]
}) {
  try {
    // Gerar tudo em paralelo para ser mais rápido
    const [tags, summary, metaDescription] = await Promise.all([
      generatePostTags(postData.content, postData.existingTags),
      generatePostSummary(postData.content),
      generateMetaDescription(postData.title, postData.content)
    ])

    return {
      ...postData,
      tags,
      excerpt: summary,
      metaDescription,
      seoOptimized: true
    }
  } catch (error) {
    console.error('Erro ao processar post:', error)
    return postData // Retorna original se houver erro
  }
}

// 6. Hook React personalizado
import { useState } from 'react'

export function useAIContentGeneration() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (action: string, data: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })

      if (!response.ok) {
        throw new Error('Falha na geração de conteúdo')
      }

      const result = await response.json()
      return result.result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { generate, isLoading, error }
}
