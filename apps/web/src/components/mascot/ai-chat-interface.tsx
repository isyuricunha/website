'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageCircle, X } from 'lucide-react'
import { useTranslations } from '@tszhong0411/i18n/client'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: string
  isError?: boolean
  type?: 'text'
}

interface AIChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
  currentPage?: string
  onMessageSent?: (message: string) => void
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputValue
    setInputValue('')
    setIsLoading(true)
    setHasError(false)
    onMessageSent?.(messageText)

    try {
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
        text: data.message || t('mascot.aiChat.errorMessage'),
        isUser: false,
        timestamp: data.timestamp || new Date().toISOString(),
        isError: data.isError || false,
        type: 'text'
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setHasError(true)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: t('mascot.aiChat.errorMessage'),
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
        type: 'text'
      }

      setMessages(prev => [...prev, errorMessage])
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

  return (
    <div className="absolute bottom-full right-0 mb-2 w-96 sm:w-[28rem] max-h-[600px] bg-popover/95 backdrop-blur-sm border rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-none">
              {t('mascot.aiChat.title')}
            </span>
            <span className="text-xs text-muted-foreground">
              Gemini AI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
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
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('mascot.aiChat.placeholder')}
            className="flex-1 px-4 py-3 text-sm bg-background/80 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/60"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
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
