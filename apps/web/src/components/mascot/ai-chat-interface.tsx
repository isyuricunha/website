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
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)', features: ['chat', 'image-gen', 'image-analyze', 'speech'] },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)', features: ['chat', 'image-gen', 'image-analyze', 'speech'] },
  { value: 'claude-sonnet-4', label: 'Claude Sonnet 4 (Anthropic)', features: ['chat', 'image-gen', 'image-analyze', 'speech'] },
  { value: 'claude-opus-4', label: 'Claude Opus 4 (Anthropic)', features: ['chat', 'image-gen', 'image-analyze', 'speech'] },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)', features: ['chat', 'image-gen', 'image-analyze', 'speech'] },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Google)', features: ['chat', 'image-gen', 'image-analyze', 'speech'] },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Google)', features: ['chat', 'image-gen', 'image-analyze', 'speech'] },
  { value: 'deepseek-chat', label: 'DeepSeek Chat', features: ['chat', 'image-gen', 'image-analyze', 'speech'] },
  { value: 'grok-beta', label: 'Grok Beta (xAI)', features: ['chat', 'image-gen', 'image-analyze', 'speech'] }
]

// AI Feature compatibility - Puter.js supports all features across models
const getAIFeatures = (t: any) => ({
  chat: { icon: MessageCircle, label: t('mascot.aiChat.modes.chat'), description: t('mascot.aiChat.descriptions.chat') },
  'image-gen': { icon: Image, label: t('mascot.aiChat.modes.imageGen'), description: t('mascot.aiChat.descriptions.imageGen') },
  'image-analyze': { icon: Eye, label: t('mascot.aiChat.modes.imageAnalyze'), description: t('mascot.aiChat.descriptions.imageAnalyze') },
  speech: { icon: Mic, label: t('mascot.aiChat.modes.speech'), description: t('mascot.aiChat.descriptions.speech') }
})

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
  const [chatMode, setChatMode] = useState<'chat' | 'image-gen' | 'image-analyze' | 'speech'>('chat')
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

  const createSystemPrompt = (userMessage: string) => {
    return `You are Yue, the friendly virtual mascot made by Yuri Cunha for his personal website.

Personality:
- Friendly, helpful, and enthusiastic
- Knowledgeable about web development, databases, and technology
- Speaks in a casual, approachable tone
- Sometimes uses emojis to be more expressive
- You can talk in any language
- Reply in the same language the user speaks to you

Context about the website:
- Owner: Yuri Cunha, a database and server specialist from Brazil
- Focus: Modern web development, server/warehouse infrastructure, database optimization, and tech projects
- Current page: ${currentPage || 'unknown'}
- User's previous interactions: ${messages.slice(-3).map(m => m.text).join(', ') || 'none'}

About Yuri:
- Yuri is a Database Administrator (DBA) and Server Infrastructure Specialist
- He has participated in projects using Go programming language, profile ranking via GitHub API, and has helped fix bugs alongside the GitHub team
- Blog: https://yuricunha.com/blog
- PC/Setup/Stacks: https://yuricunha.com/
- Guestbook: https://yuricunha.com/guestbook
- Projects: https://yuricunha.com/projects (functional with GitHub API integration, in development)
- About: https://yuricunha.com/about (may not be up to date)
- Email: me@yuricunha.com
- Music he listens to: https://yuricunha.com/spotify
- His GitHub: https://github.com/isyuricunha

Guidelines:
- If asked about technical topics, provide helpful but brief explanations
- If asked about Yuri or the website, share relevant information
- For general questions, be helpful but stay in character as the website mascot
- Don't provide very long explanations unless specifically requested
- Be concise and engaging

User message: ${userMessage}`
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
          case 'chat':
            const systemPrompt = createSystemPrompt(messageText)
            const response = await window.puter.ai.chat(systemPrompt, {
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
              text: t('mascot.aiChat.generatedImage'),
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
            setChatMode('chat')
            break

          case 'speech':
            const audioElement = await window.puter.ai.txt2speech(messageText, {
              voice: 'Joanna',
              engine: 'neural',
              language: 'en-US'
            })
            aiMessage = {
              id: (Date.now() + 1).toString(),
              text: t('mascot.aiChat.generatedAudio'),
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
    const AI_FEATURES = getAIFeatures(t)
    const feature = AI_FEATURES[chatMode]
    return feature ? <feature.icon className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />
  }

  const getCurrentModel = () => AI_MODELS.find(m => m.value === selectedModel)
  const getAvailableFeatures = () => getCurrentModel()?.features || ['chat']
  const isFeatureAvailable = (feature: string) => getAvailableFeatures().includes(feature)

  const getPlaceholder = () => {
    switch (chatMode) {
      case 'image-gen': return t('mascot.aiChat.placeholders.imageGen')
      case 'image-analyze': return t('mascot.aiChat.placeholders.imageAnalyze')
      case 'speech': return t('mascot.aiChat.placeholders.speech')
      default: return t('mascot.aiChat.placeholders.chat')
    }
  }

  const getModeTitle = () => {
    const AI_FEATURES = getAIFeatures(t)
    const feature = AI_FEATURES[chatMode]
    return feature?.label || t('mascot.aiChat.titles.chat')
  }

  return (
    <div className="absolute bottom-full right-0 mb-2 w-96 sm:w-[28rem] max-h-[600px] bg-popover/95 backdrop-blur-sm border rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            {getModeIcon()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-none">
              {getModeTitle()}
            </span>
            <span className="text-xs text-muted-foreground">
              {AI_MODELS.find(m => m.value === selectedModel)?.label || t('mascot.aiChat.switchModel')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Quick Mode Switcher */}
          <div className="flex items-center gap-0.5 bg-muted/30 rounded-lg p-0.5">
            {Object.entries(getAIFeatures(t)).map(([featureKey, feature]) => {
              const isAvailable = isFeatureAvailable(featureKey)
              const isActive = chatMode === featureKey
              return (
                <button
                  key={featureKey}
                  onClick={() => isAvailable && setChatMode(featureKey as any)}
                  disabled={!isAvailable}
                  className={`p-1 rounded transition-all relative ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : isAvailable
                      ? 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                  title={isAvailable ? feature.description : t('mascot.aiChat.featureNotAvailable', { feature: feature.label })}
                >
                  <feature.icon className="h-3 w-3" />
                  {!isAvailable && (
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
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
              {t('mascot.aiChat.clear')}
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
        <div className="p-3 border-b bg-gradient-to-r from-muted/30 to-muted/10 space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">{t('mascot.aiChat.switchModel')}</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-background/80 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              {AI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">{t('mascot.aiChat.modes.chat')}</label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(getAIFeatures(t)).map(([featureKey, feature]) => {
                const isAvailable = isFeatureAvailable(featureKey)
                const isActive = chatMode === featureKey
                return (
                  <button
                    key={featureKey}
                    onClick={() => isAvailable && setChatMode(featureKey as any)}
                    disabled={!isAvailable}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-all font-medium relative ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : isAvailable
                        ? 'bg-muted/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                        : 'bg-muted/30 text-muted-foreground/50 cursor-not-allowed'
                    }`}
                    title={isAvailable ? feature.description : t('mascot.aiChat.featureNotAvailable', { feature: feature.label })}
                  >
                    <feature.icon className="h-3.5 w-3.5" />
                    {feature.label}
                    {!isAvailable && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full transform translate-x-1 -translate-y-1" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-2 text-xs text-muted-foreground/80">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{t('mascot.aiChat.availableFeatures', { model: getCurrentModel()?.label })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 bg-gradient-to-b from-background/50 to-background/80">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm ${
                message.isUser
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                  : message.isError
                  ? 'bg-gradient-to-br from-destructive/10 to-destructive/5 text-destructive border border-destructive/20 rounded-bl-md'
                  : 'bg-gradient-to-br from-muted/80 to-muted/60 text-foreground border border-border/30 rounded-bl-md'
              }`}
            >
              {!message.isUser && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/20">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">Y</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Yue</span>
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
              {message.imageUrl && (
                <img 
                  src={message.imageUrl} 
                  alt="Shared image" 
                  className="mt-3 max-w-full rounded-lg border border-border/30 shadow-sm"
                  style={{ maxHeight: '150px' }}
                />
              )}
              {message.audioUrl && (
                <audio controls className="mt-3 w-full">
                  <source src={message.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              {!message.isUser && (
                <div className="text-xs text-muted-foreground/60 mt-2 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-br from-muted/80 to-muted/60 text-foreground p-3 rounded-2xl rounded-bl-md flex items-center gap-2 border border-border/30">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/20 w-full">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">Y</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Yue</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs">{t('mascot.aiChat.thinking')}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm">
        {chatMode === 'image-analyze' && (
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 w-full p-3 text-xs bg-gradient-to-r from-muted/60 to-muted/40 hover:from-muted/80 hover:to-muted/60 rounded-xl border border-border/30 transition-all duration-200 font-medium"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span className={imageFile ? 'text-foreground' : 'text-muted-foreground'}>
                {imageFile ? t('mascot.aiChat.selected', { filename: imageFile.name }) : t('mascot.aiChat.upload')}
              </span>
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              className="w-full px-4 py-3 pr-20 text-sm bg-background/80 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/60"
              disabled={isLoading}
            />
            {/* AI Model Switcher in Input */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-xs bg-transparent border-none focus:outline-none text-muted-foreground hover:text-foreground cursor-pointer pr-1"
                title="Switch AI Model"
              >
                {AI_MODELS.map((model) => (
                  <option key={model.value} value={model.value} className="bg-popover text-foreground">
                    {model.label.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={(!inputValue.trim() && !imageFile) || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground/80">
            {t('mascot.aiChat.footer')}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>{t('mascot.aiChat.online')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
