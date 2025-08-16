'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Copy, Download, Loader2, Code, Sparkles, MessageSquare, Image, Mic, Eye, Wand2 } from 'lucide-react'
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

interface PuterAIPlaygroundProps {
  isOpen: boolean
  onClose: () => void
}

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)' },
  { value: 'o1', label: 'o1 (OpenAI)' },
  { value: 'o1-mini', label: 'o1 Mini (OpenAI)' },
  { value: 'claude-sonnet-4', label: 'Claude Sonnet 4 (Anthropic)' },
  { value: 'claude-opus-4', label: 'Claude Opus 4 (Anthropic)' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Google)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Google)' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  { value: 'grok-beta', label: 'Grok Beta (xAI)' },
  { value: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', label: 'Llama 3.1 70B (Meta)' }
]

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

export default function PuterAIPlayground({ isOpen, onClose }: PuterAIPlaygroundProps) {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState<'chat' | 'txt2img' | 'img2txt' | 'txt2speech'>('chat')
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [useStreaming, setUseStreaming] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const responseRef = useRef<HTMLDivElement>(null)

  // Auto-scroll response area
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [response])

  const runChatPrompt = async () => {
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
        })

        setResponse(result.message?.content?.[0]?.text || result.toString())
      }
    } catch (error) {
      console.error('AI Chat error:', error)
      setHasError(true)
      setResponse(`Error: ${error.message || 'Failed to get response. Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const runTxt2Img = async () => {
    if (!prompt.trim() || isLoading) return
    if (!window.puter) {
      setHasError(true)
      setResponse('Error: Puter.js not loaded. Please refresh the page.')
      return
    }

    setIsLoading(true)
    setHasError(false)
    setGeneratedImage('')

    try {
      const result = await window.puter.ai.txt2img(prompt)
      setGeneratedImage(result.url)
      setResponse('Image generated successfully!')
    } catch (error) {
      console.error('Text to Image error:', error)
      setHasError(true)
      setResponse(`Error: ${error.message || 'Failed to generate image. Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const runImg2Txt = async () => {
    if (!imageUrl.trim() || isLoading) return
    if (!window.puter) {
      setHasError(true)
      setResponse('Error: Puter.js not loaded. Please refresh the page.')
      return
    }

    setIsLoading(true)
    setHasError(false)
    setResponse('')

    try {
      const result = await window.puter.ai.img2txt(imageUrl, prompt || 'Describe this image')
      setResponse(result.text)
    } catch (error) {
      console.error('Image to Text error:', error)
      setHasError(true)
      setResponse(`Error: ${error.message || 'Failed to analyze image. Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const runTxt2Speech = async () => {
    if (!prompt.trim() || isLoading) return
    if (!window.puter) {
      setHasError(true)
      setResponse('Error: Puter.js not loaded. Please refresh the page.')
      return
    }

    setIsLoading(true)
    setHasError(false)
    setAudioUrl('')

    try {
      const result = await window.puter.ai.txt2speech(prompt)
      setAudioUrl(result.url)
      setResponse('Audio generated successfully!')
    } catch (error) {
      console.error('Text to Speech error:', error)
      setHasError(true)
      setResponse(`Error: ${error.message || 'Failed to generate audio. Please try again.'}`)
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
      a.download = `puter-ai-response-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const loadExample = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  const getRunFunction = () => {
    switch (activeTab) {
      case 'chat': return runChatPrompt
      case 'txt2img': return runTxt2Img
      case 'img2txt': return runImg2Txt
      case 'txt2speech': return runTxt2Speech
      default: return runChatPrompt
    }
  }

  const getButtonText = () => {
    if (isLoading) return 'Processing...'
    switch (activeTab) {
      case 'chat': return 'Send Message'
      case 'txt2img': return 'Generate Image'
      case 'img2txt': return 'Analyze Image'
      case 'txt2speech': return 'Generate Audio'
      default: return 'Run'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-popover border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Puter.js AI Playground</h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Free & Unlimited
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm hover:bg-muted rounded transition-colors"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-muted/20">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat' 
                ? 'bg-background text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('txt2img')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'txt2img' 
                ? 'bg-background text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            Text to Image
          </button>
          <button
            onClick={() => setActiveTab('img2txt')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'img2txt' 
                ? 'bg-background text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-4 w-4" />
            Image to Text
          </button>
          <button
            onClick={() => setActiveTab('txt2speech')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'txt2speech' 
                ? 'bg-background text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mic className="h-4 w-4" />
            Text to Speech
          </button>
        </div>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Left Panel - Input */}
          <div className="w-1/2 border-r flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b bg-muted/20 space-y-3">
              {activeTab === 'chat' && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground">Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm bg-background border rounded-lg"
                    >
                      {AI_MODELS.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
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
              )}
            </div>

            {/* Example Prompts for Chat */}
            {activeTab === 'chat' && (
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
            )}

            {/* Input Area */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {activeTab === 'chat' && 'Your Message'}
                  {activeTab === 'txt2img' && 'Image Description'}
                  {activeTab === 'img2txt' && 'Image URL & Optional Prompt'}
                  {activeTab === 'txt2speech' && 'Text to Convert'}
                </label>
                <button
                  onClick={getRunFunction()}
                  disabled={!prompt.trim() || isLoading || (activeTab === 'img2txt' && !imageUrl.trim())}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {getButtonText()}
                </button>
              </div>

              {activeTab === 'img2txt' && (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL..."
                  className="mb-3 p-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  disabled={isLoading}
                />
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeTab === 'chat' ? 'Enter your message here...' :
                  activeTab === 'txt2img' ? 'Describe the image you want to generate...' :
                  activeTab === 'img2txt' ? 'Optional: Ask a specific question about the image...' :
                  'Enter text to convert to speech...'
                }
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
                <span className="text-sm font-medium">AI Response</span>
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
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is processing...</span>
                </div>
              )}
              
              {response && (
                <div className={`text-sm whitespace-pre-wrap ${hasError ? 'text-destructive' : ''}`}>
                  {response}
                </div>
              )}

              {generatedImage && (
                <div className="mt-4">
                  <img 
                    src={generatedImage} 
                    alt="Generated image" 
                    className="max-w-full rounded-lg border"
                  />
                </div>
              )}

              {audioUrl && (
                <div className="mt-4">
                  <audio controls className="w-full">
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              
              {!response && !isLoading && !generatedImage && !audioUrl && (
                <div className="text-center text-muted-foreground py-8">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {activeTab === 'chat' && 'Send a message to see AI response here'}
                    {activeTab === 'txt2img' && 'Generate an image to see it here'}
                    {activeTab === 'img2txt' && 'Analyze an image to see description here'}
                    {activeTab === 'txt2speech' && 'Generate audio to hear it here'}
                  </p>
                  <p className="text-xs mt-2 opacity-75">
                    Free unlimited access via Puter.js - No authentication required
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Powered by Puter.js - Free unlimited AI access</span>
            <span>
              {activeTab === 'chat' && `Model: ${selectedModel} | Streaming: ${useStreaming ? 'On' : 'Off'}`}
              {activeTab !== 'chat' && `Mode: ${activeTab}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
