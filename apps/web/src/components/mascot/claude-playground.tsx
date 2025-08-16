'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Copy, Download, Loader2, Code, Sparkles, MessageSquare } from 'lucide-react'
import { useTranslations } from '@tszhong0411/i18n/client'

// Extend Window interface for Puter.js
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string | Array<any>,
          options?: {
            model?: string
            stream?: boolean
            max_tokens?: number
            temperature?: number
            tools?: Array<any>
          }
        ) => Promise<any> | AsyncIterable<{ text?: string }>
        txt2img: (prompt: string, options?: { model?: string }) => Promise<{ url: string }>
        img2txt: (imageUrl: string, prompt?: string, options?: { model?: string }) => Promise<{ text: string }>
        txt2speech: (text: string, options?: { voice?: string }) => Promise<{ url: string }>
      }
      auth?: {
        signIn: () => Promise<void>
        isSignedIn: () => boolean
        getUser: () => Promise<{ username: string }>
      }
    }
  }
}

interface ClaudePlaygroundProps {
  isOpen: boolean
  onClose: () => void
}

const EXAMPLE_PROMPTS = [
  {
    title: 'Creative Writing',
    prompt: 'Write a short story about a robot who discovers emotions for the first time.',
    category: 'creative'
  },
  {
    title: 'Code Generation',
    prompt: 'Create a React component that displays a loading spinner with smooth animations.',
    category: 'code'
  },
  {
    title: 'Explanation',
    prompt: 'Explain quantum computing in simple terms that a 10-year-old could understand.',
    category: 'explain'
  },
  {
    title: 'Problem Solving',
    prompt: 'How can I optimize the performance of a Next.js application?',
    category: 'problem'
  }
]

export default function ClaudePlayground({ isOpen, onClose }: ClaudePlaygroundProps) {
  const t = useTranslations()
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<'claude-sonnet-4' | 'claude-opus-4'>('claude-sonnet-4')
  const [useStreaming, setUseStreaming] = useState(true)
  const [hasError, setHasError] = useState(false)
  const responseRef = useRef<HTMLDivElement>(null)

  // Auto-scroll response area
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [response])

  const runPrompt = async () => {
    if (!prompt.trim() || isLoading) return
    if (!window.puter) {
      setHasError(true)
      setResponse('Error: Puter.js not loaded. Please refresh the page.')
      return
    }

    setIsLoading(true)
    setHasError(false)
    setResponse('')

    try {
      if (useStreaming) {
        const stream = await window.puter.ai.chat(prompt, {
          model: selectedModel,
          stream: true
        }) as AsyncIterable<{ text?: string }>

        for await (const part of stream) {
          if (part?.text) {
            setResponse(prev => prev + part.text)
          }
        }
      } else {
        const result = await window.puter.ai.chat(prompt, {
          model: selectedModel
        }) as { message: { content: Array<{ text: string }> } }

        setResponse(result.message.content[0].text)
      }
    } catch (error) {
      console.error('Claude API error:', error)
      setHasError(true)
      setResponse('Error: Failed to get response from Claude. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyResponse = async () => {
    if (response) {
      await navigator.clipboard.writeText(response)
    }
  }

  const downloadResponse = () => {
    if (response) {
      const blob = new Blob([response], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `claude-response-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const loadExample = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-popover border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Claude API Playground</h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Powered by Puter.js
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm hover:bg-muted rounded transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex h-[calc(90vh-4rem)]">
          {/* Left Panel - Input */}
          <div className="w-1/2 border-r flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b bg-muted/20 space-y-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as 'claude-sonnet-4' | 'claude-opus-4')}
                    className="w-full mt-1 px-3 py-2 text-sm bg-background border rounded-lg"
                  >
                    <option value="claude-sonnet-4">Claude Sonnet 4 (Balanced)</option>
                    <option value="claude-opus-4">Claude Opus 4 (Most Intelligent)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={useStreaming}
                      onChange={(e) => setUseStreaming(e.target.checked)}
                      className="rounded"
                    />
                    Streaming
                  </label>
                </div>
              </div>
            </div>

            {/* Example Prompts */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium mb-2">Example Prompts</h3>
              <div className="grid grid-cols-2 gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(example.prompt)}
                    className="text-left p-2 text-xs bg-muted/50 hover:bg-muted rounded border transition-colors"
                  >
                    <div className="font-medium">{example.title}</div>
                    <div className="text-muted-foreground truncate">{example.prompt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Your Prompt</label>
                <button
                  onClick={runPrompt}
                  disabled={!prompt.trim() || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isLoading ? 'Running...' : 'Run Prompt'}
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here... Try asking Claude to write code, explain concepts, or be creative!"
                className="flex-1 p-3 bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Right Panel - Response */}
          <div className="w-1/2 flex flex-col">
            {/* Response Header */}
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Claude Response</span>
                {response && (
                  <span className="text-xs text-muted-foreground">
                    {response.length} characters
                  </span>
                )}
              </div>
              {response && (
                <div className="flex gap-2">
                  <button
                    onClick={copyResponse}
                    className="p-2 hover:bg-muted rounded transition-colors"
                    title="Copy response"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={downloadResponse}
                    className="p-2 hover:bg-muted rounded transition-colors"
                    title="Download response"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Response Content */}
            <div
              ref={responseRef}
              className="flex-1 p-4 overflow-y-auto bg-muted/5"
            >
              {isLoading && !response && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Claude is thinking...</span>
                </div>
              )}
              
              {response && (
                <div className={`text-sm whitespace-pre-wrap ${hasError ? 'text-destructive' : ''}`}>
                  {response}
                </div>
              )}
              
              {!response && !isLoading && (
                <div className="text-center text-muted-foreground py-8">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Run a prompt to see Claude's response here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Free unlimited access via Puter.js - No API keys required</span>
            <span>Model: {selectedModel} | Streaming: {useStreaming ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
