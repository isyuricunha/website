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

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setHasError(false)
    onMessageSent?.(inputValue)

    try {
      const response = await fetch('/api/mascot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
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
        isError: data.isError
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
        isError: true
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
    <div className="absolute bottom-full right-0 mb-2 w-80 sm:w-96 max-h-96 bg-popover border rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{t('mascot.aiChat.title')}</span>
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
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('mascot.aiChat.placeholder')}
            className="flex-1 px-3 py-2 text-xs bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {hasError && (
          <p className="text-xs text-destructive mt-2">
            {t('mascot.aiChat.connectionError')}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {t('mascot.aiChat.footer')}
        </p>
      </div>
    </div>
  )
}
