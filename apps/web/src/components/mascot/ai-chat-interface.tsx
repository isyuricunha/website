'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { Loader2, MessageCircle, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: string
  isError?: boolean
  type?: 'text'
}

interface AIChatInterfaceProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly currentPage?: string
  readonly onMessageSent?: (message: string) => void
}

export default function AIChatInterface({
  isOpen,
  onClose,
  currentPage = '',
  onMessageSent
}: AIChatInterfaceProps) {
  const t = useTranslations()
  const storageKey = 'yue_chat_history_v1'
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Load persisted history or show welcome when first opened
  useEffect(() => {
    if (!isOpen || messages.length > 0) return

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed: ChatMessage[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch {
      // ignore corrupted storage
    }

    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: t('mascot.aiChat.welcomeMessage'),
      isUser: false,
      timestamp: new Date().toISOString()
    }
    setMessages([welcomeMessage])
  }, [isOpen, messages.length, t, storageKey])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = inputValue
    setInputValue('')
    setIsLoading(true)
    onMessageSent?.(messageText)

    try {
      const recentMessages = messages.slice(-10).map((message) => ({
        role: message.isUser ? 'user' : 'assistant',
        content: message.text
      }))

      const response = await fetch('/api/mascot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          context: {
            currentPage,
            previousMessages: messages.slice(-5).map((m) => m.text),
            conversation: recentMessages
          }
        })
      })

      const data: { message?: string; timestamp?: string; isError?: boolean; error?: string } =
        await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to get response')
      }

      const safeTimestamp = data.timestamp ?? new Date().toISOString()

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message ?? t('mascot.aiChat.errorMessage'),
        isUser: false,
        timestamp: safeTimestamp,
        isError: data.isError ?? false,
        type: 'text'
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: t('mascot.aiChat.errorMessage'),
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
        type: 'text'
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // ignore storage errors
    }
  }

  // Persist chat history locally to reduce context loss
  useEffect(() => {
    if (messages.length === 0) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30)))
    } catch {
      // ignore storage errors
    }
  }, [messages, storageKey])

  if (!isOpen) return null

  return (
    <div className='bg-popover/95 absolute bottom-full right-0 mb-2 max-h-[600px] w-96 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm sm:w-[28rem]'>
      {/* Header */}
      <div className='from-primary/10 to-primary/5 flex items-center justify-between border-b bg-gradient-to-r p-3'>
        <div className='flex items-center gap-2'>
          <div className='bg-primary/10 rounded-lg p-1.5'>
            <MessageCircle className='h-4 w-4' />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold leading-none'>{t('mascot.aiChat.title')}</span>
            <span className='text-muted-foreground text-xs'>Gemini AI</span>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          {messages.length > 1 && (
            <button
              type='button'
              onClick={clearChat}
              className='text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs transition-colors'
            >
              {t('mascot.aiChat.clear')}
            </button>
          )}
          <button
            type='button'
            onClick={onClose}
            className='hover:bg-muted rounded p-1 transition-colors'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className='from-background/50 to-background/80 max-h-80 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b p-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm ${(() => {
                if (message.isUser) {
                  return 'from-primary to-primary/90 text-primary-foreground rounded-br-md bg-gradient-to-br'
                }
                if (message.isError) {
                  return 'from-destructive/10 to-destructive/5 text-destructive border-destructive/20 rounded-bl-md border bg-gradient-to-br'
                }
                return 'from-muted/80 to-muted/60 text-foreground border-border/30 rounded-bl-md border bg-gradient-to-br'
              })()}`}
            >
              {!message.isUser && (
                <div className='border-border/20 mb-2 flex items-center gap-2 border-b pb-2'>
                  <div className='bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full'>
                    <span className='text-primary text-xs font-bold'>Y</span>
                  </div>
                  <span className='text-muted-foreground text-xs font-medium'>Yue</span>
                </div>
              )}
              <p className='whitespace-pre-wrap leading-relaxed'>{message.text}</p>
              {!message.isUser && (
                <div className='text-muted-foreground/60 mt-2 text-right text-xs'>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className='animate-in slide-in-from-bottom-2 flex justify-start duration-300'>
            <div className='from-muted/80 to-muted/60 text-foreground border-border/30 flex items-center gap-2 rounded-2xl rounded-bl-md border bg-gradient-to-br p-3'>
              <div className='border-border/20 mb-2 flex w-full items-center gap-2 border-b pb-2'>
                <div className='bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full'>
                  <span className='text-primary text-xs font-bold'>Y</span>
                </div>
                <span className='text-muted-foreground text-xs font-medium'>Yue</span>
              </div>
              <div className='flex items-center gap-2'>
                <Loader2 className='text-primary h-4 w-4 animate-spin' />
                <span className='text-xs'>{t('mascot.aiChat.thinking')}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='from-background/80 to-background/60 border-t bg-gradient-to-r p-4 backdrop-blur-sm'>
        <div className='flex gap-2'>
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('mascot.aiChat.placeholder')}
            className='bg-background/80 border-border/50 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/60 flex-1 rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2'
            disabled={isLoading}
          />
          <button
            type='button'
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className='from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 rounded-xl bg-gradient-to-r px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </button>
        </div>
        <div className='mt-3 flex items-center justify-between'>
          <p className='text-muted-foreground/80 text-xs'>{t('mascot.aiChat.footer')}</p>
          <div className='text-muted-foreground/60 flex items-center gap-1 text-xs'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500'></div>
            <span>{t('mascot.aiChat.online')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
