'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageCircle, X, Image, Mic, Eye, Settings, Upload } from 'lucide-react'
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
        txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>
        img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>
        txt2speech: (
          text: string, 
          options?: {
            language?: string
            voice?: string
            engine?: 'standard' | 'neural' | 'generative'
          }
        ) => Promise<HTMLAudioElement>
      }
      auth?: {
        signIn: () => Promise<void>
        isSignedIn: () => boolean
        getUser: () => Promise<{ username: string }>
      }
    }
  }
}

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: string
  isError?: boolean
  type?: 'text' | 'image' | 'audio'
  imageUrl?: string
  audioUrl?: string
}

interface AIChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
  currentPage?: string
  onMessageSent?: (message: string) => void
}

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)' },
  { value: 'claude-sonnet-4', label: 'Claude Sonnet 4 (Anthropic)' },
  { value: 'claude-opus-4', label: 'Claude Opus 4 (Anthropic)' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Google)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Google)' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'grok-beta', label: 'Grok Beta (xAI)' }
]

export default function AIChatInterface({ 
  isOpen, 
  onClose, 
  currentPage = '',
  onMessageSent 
}: AIChatInterfaceProps) {
  const t = useTranslations()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4')
  const [chatMode, setChatMode] = useState<'text' | 'image-gen' | 'image-analyze' | 'speech'>('text')
  const [showSettings, setShowSettings] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: t('mascot.aiChat.welcomeMessage'),
        isUser: false,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length, t])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setChatMode('image-analyze')
    }
  }

  const sendMessage = async () => {
    if ((!inputValue.trim() && !imageFile) || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue || (chatMode === 'image-analyze' ? 'Analyze this image' : ''),
      isUser: true,
      timestamp: new Date().toISOString(),
      type: chatMode === 'image-analyze' && imageFile ? 'image' : 'text',
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputValue
    setInputValue('')
    setIsLoading(true)
    setHasError(false)
    onMessageSent?.(messageText)

    try {
      if (typeof window !== 'undefined' && window.puter) {
        let aiMessage: ChatMessage

        switch (chatMode) {
          case 'text':
            const response = await window.puter.ai.chat(messageText, {
              model: selectedModel
            })
            aiMessage = {
              id: (Date.now() + 1).toString(),
              text: response.message?.content?.[0]?.text || response.toString(),
              isUser: false,
              timestamp: new Date().toISOString(),
              type: 'text'
            }
            break

          case 'image-gen':
            const imageElement = await window.puter.ai.txt2img(messageText)
            aiMessage = {
              id: (Date.now() + 1).toString(),
              text: 'Generated image:',
              isUser: false,
              timestamp: new Date().toISOString(),
              type: 'image',
              imageUrl: imageElement.src
            }
            break

          case 'image-analyze':
            if (!imageFile) throw new Error('No image selected')
            const analysisText = await window.puter.ai.img2txt(imageFile)
            aiMessage = {
              id: (Date.now() + 1).toString(),
              text: analysisText,
              isUser: false,
              timestamp: new Date().toISOString(),
              type: 'text'
            }
            setImageFile(null)
            setChatMode('text')
            break

          case 'speech':
            const audioElement = await window.puter.ai.txt2speech(messageText, {
              voice: 'Joanna',
              engine: 'neural',
              language: 'en-US'
            })
            aiMessage = {
              id: (Date.now() + 1).toString(),
              text: 'Generated audio:',
              isUser: false,
              timestamp: new Date().toISOString(),
              type: 'audio',
              audioUrl: audioElement.src
            }
            break

          default:
            throw new Error('Invalid chat mode')
        }

        setMessages(prev => [...prev, aiMessage])
      } else {
        // Fallback to original API if Puter.js not available
        const response = await fetch('/api/mascot/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            context: {
              currentPage,
              previousMessages: messages.slice(-5).map(m => m.text)
            }
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response')
        }

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          timestamp: data.timestamp,
          isError: data.isError,
          type: 'text'
        }

        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setHasError(true)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || 'Failed to process request'}`,
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
        type: 'text'
      }

      setMessages(prev => [...prev, errorMessage])
      setImageFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setHasError(false)
  }

  if (!isOpen) return null

  const getModeIcon = () => {
    switch (chatMode) {
      case 'image-gen': return <Image className="h-4 w-4" />
      case 'image-analyze': return <Eye className="h-4 w-4" />
      case 'speech': return <Mic className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getPlaceholder = () => {
    switch (chatMode) {
      case 'image-gen': return 'Describe the image you want to generate...'
      case 'image-analyze': return 'Ask about the uploaded image...'
      case 'speech': return 'Enter text to convert to speech...'
      default: return 'Type your message...'
    }
  }

  return (
    <div className="absolute bottom-full right-0 mb-2 w-80 sm:w-96 max-h-[500px] bg-popover border rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          {getModeIcon()}
          <span className="font-medium text-sm">
            {chatMode === 'text' && 'AI Chat'}
            {chatMode === 'image-gen' && 'Image Generator'}
            {chatMode === 'image-analyze' && 'Image Analyzer'}
            {chatMode === 'speech' && 'Text to Speech'}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            {AI_MODELS.find(m => m.value === selectedModel)?.label.split(' ')[0] || 'AI'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 border-b bg-muted/20 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">AI Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full mt-1 px-2 py-1 text-xs bg-background border rounded"
            >
              {AI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Mode</label>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => setChatMode('text')}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  chatMode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <MessageCircle className="h-3 w-3" />
                Chat
              </button>
              <button
                onClick={() => setChatMode('image-gen')}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  chatMode === 'image-gen' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Image className="h-3 w-3" />
                Generate
              </button>
              <button
                onClick={() => setChatMode('image-analyze')}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  chatMode === 'image-analyze' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Eye className="h-3 w-3" />
                Analyze
              </button>
              <button
                onClick={() => setChatMode('speech')}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  chatMode === 'speech' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Mic className="h-3 w-3" />
                Speech
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-64">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg text-xs ${
                message.isUser
                  ? 'bg-primary text-primary-foreground'
                  : message.isError
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.imageUrl && (
                <img 
                  src={message.imageUrl} 
                  alt="Shared image" 
                  className="mt-2 max-w-full rounded border"
                  style={{ maxHeight: '150px' }}
                />
              )}
              {message.audioUrl && (
                <audio controls className="mt-2 w-full">
                  <source src={message.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground p-2 rounded-lg flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">{t('mascot.aiChat.thinking')}</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-muted/50">
        {chatMode === 'image-analyze' && (
          <div className="mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 w-full p-2 text-xs bg-muted hover:bg-muted/80 rounded border transition-colors"
            >
              <Upload className="h-3 w-3" />
              {imageFile ? `Selected: ${imageFile.name}` : 'Upload image to analyze'}
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            className="flex-1 px-3 py-2 text-xs bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={(!inputValue.trim() && !imageFile) || isLoading}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Powered by Puter.js - Free unlimited AI access
        </p>
      </div>
    </div>
  )
}
