'use client'

import { flags } from '@isyuricunha/env'
import { useTranslations, useLocale } from '@isyuricunha/i18n/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@isyuricunha/ui'

import {
  Copy,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  type ChatConversation,
  type ChatMessage,
  type YueChatProvider,
  createEmptyConversation,
  decodeConversationShare,
  encodeConversationShare,
  loadYueChatState,
  saveYueChatState
} from '@/utils/yue-chat-storage'
import ConfirmationDialog from '../admin/confirmation-dialog'

interface AIChatInterfaceProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly currentPage?: string
  readonly pagePath?: string
  readonly onMessageSent?: (message: string) => void
}

export default function AIChatInterface({
  isOpen,
  onClose,
  currentPage = '',
  pagePath = '',
  onMessageSent
}: AIChatInterfaceProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string>('')
  const [provider, setProvider] = useState<YueChatProvider>('auto')
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingDots, setTypingDots] = useState('')
  const [feedbackOpenForMessageId, setFeedbackOpenForMessageId] = useState<string | null>(null)
  const [feedbackDraftByMessageId, setFeedbackDraftByMessageId] = useState<Record<string, string>>(
    {}
  )
  const [feedbackIsSubmittingByMessageId, setFeedbackIsSubmittingByMessageId] = useState<
    Record<string, boolean>
  >({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getWelcomeMessage = useCallback((): ChatMessage => {
    return {
      id: 'welcome',
      text: t('mascot.aiChat.welcomeMessage'),
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  }, [t])

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) ?? null
  }, [activeConversationId, conversations])

  const messages = useMemo(() => {
    return activeConversation?.messages ?? []
  }, [activeConversation])

  const get_bubble_class_name = (message: ChatMessage) => {
    if (message.isUser) {
      return 'from-primary to-primary/90 text-primary-foreground rounded-br-md bg-gradient-to-br'
    }
    if (message.isError) {
      return 'from-destructive/10 to-destructive/5 text-destructive border-destructive/20 rounded-bl-md border bg-gradient-to-br'
    }
    return 'from-muted/80 to-muted/60 text-foreground border-border/30 rounded-bl-md border bg-gradient-to-br'
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = messagesEndRef.current
    if (el && typeof (el as any).scrollIntoView === 'function') {
      ;(el as any).scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Load persisted conversations, migrate legacy storage, and optionally import a shared conversation.
  useEffect(() => {
    if (!isOpen) return

    const loaded = loadYueChatState()
    let nextConversations = loaded.conversations
    let nextActiveId = loaded.activeConversationId
    const nextProvider = loaded.provider

    if (globalThis.window !== undefined) {
      const params = new URLSearchParams(globalThis.location.search)
      const shared = params.get('yue_chat')

      if (shared) {
        const decoded = decodeConversationShare(shared)
        if (decoded) {
          const importedId = (() => {
            try {
              return globalThis.crypto.randomUUID()
            } catch {
              return `${Date.now()}-${Math.random().toString(16).slice(2)}`
            }
          })()

          const imported: ChatConversation = {
            ...decoded,
            id: importedId,
            title: decoded.title || t('mascot.aiChat.importedTitle'),
            updatedAt: new Date().toISOString()
          }

          nextConversations = [imported, ...nextConversations].slice(0, 50)
          nextActiveId = imported.id

          params.delete('yue_chat')
          const url = `${globalThis.location.pathname}${params.size > 0 ? `?${params.toString()}` : ''}`
          globalThis.history.replaceState(null, '', url)

          toast.success(t('mascot.aiChat.imported'))
        } else {
          toast.error(t('mascot.aiChat.importFailed'))
        }
      }
    }

    // Ensure active conversation has at least the welcome message
    nextConversations = nextConversations.map((c) => {
      if (c.id !== nextActiveId) return c
      if (c.messages.length > 0) return c
      return { ...c, messages: [getWelcomeMessage()], updatedAt: new Date().toISOString() }
    })

    setConversations(nextConversations)
    setActiveConversationId(nextActiveId)
    setProvider(nextProvider)
    saveYueChatState({ conversations: nextConversations, activeConversationId: nextActiveId, provider: nextProvider })
  }, [getWelcomeMessage, isOpen, t])

  useEffect(() => {
    if (!isOpen) return
    if (!activeConversationId) return

    saveYueChatState({ conversations, activeConversationId, provider })
  }, [activeConversationId, conversations, isOpen, provider])

  const updateActiveConversation = (
    updater: (conversation: ChatConversation) => ChatConversation
  ) => {
    if (!activeConversation) return

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c
        return updater(c)
      })
    )
  }

  const startNewChat = () => {
    const created = createEmptyConversation(t('mascot.aiChat.newChatTitle'))
    const withWelcome: ChatConversation = {
      ...created,
      messages: [getWelcomeMessage()],
      updatedAt: new Date().toISOString()
    }

    setConversations((prev) => [withWelcome, ...prev].slice(0, 50))
    setActiveConversationId(withWelcome.id)
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const renameChat = () => {
    if (!activeConversation) return
    const next = prompt(t('mascot.aiChat.renamePrompt'), activeConversation.title)
    if (!next?.trim()) return

    const title = next.trim().slice(0, 120)
    updateActiveConversation((c) => ({ ...c, title, updatedAt: new Date().toISOString() }))
  }

  const deleteChat = () => {
    if (!activeConversation) return
    setDeleteDialogOpen(true)
  }

  const confirmDeleteChat = () => {
    if (!activeConversation) return
    setDeleteDialogOpen(false)
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== activeConversation.id)
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0]?.id ?? '')
        return remaining
      }

      const created = createEmptyConversation(t('mascot.aiChat.newChatTitle'))
      const withWelcome: ChatConversation = {
        ...created,
        messages: [getWelcomeMessage()],
        updatedAt: new Date().toISOString()
      }
      setActiveConversationId(withWelcome.id)
      return [withWelcome]
    })
  }

  const shareChat = async () => {
    if (!activeConversation) return
    if (globalThis.window === undefined) return

    const payload = encodeConversationShare({
      ...activeConversation,
      messages: activeConversation.messages.slice(-50)
    })

    const url = new URL(globalThis.location.href)
    url.searchParams.set('yue_chat', payload)

    try {
      await navigator.clipboard.writeText(url.toString())
      toast.success(t('mascot.aiChat.shareCopied'))
    } catch {
      toast.error(t('mascot.aiChat.shareCopyFailed'))
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    if (!activeConversation) return

    const messageText = inputValue.trim()

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    const nextMessages = [...messages, userMessage]

    updateActiveConversation((c) => ({
      ...c,
      messages: nextMessages,
      updatedAt: new Date().toISOString()
    }))
    setInputValue('')
    setIsLoading(true)
    onMessageSent?.(messageText)

    try {
      // Enhanced context with more conversation history for better memory
      const recentMessages = nextMessages.slice(-15).map((message) => ({
        role: message.isUser ? 'user' : 'assistant',
        content: message.text,
        timestamp: message.timestamp,
        reactions: message.reactions
      }))

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          provider: provider === 'auto' ? undefined : provider,
          stream: provider === 'ollama',
          locale,
          context: {
            currentPage,
            pagePath,
            previousMessages: nextMessages.slice(-8).map((m) => m.text),
            conversation: recentMessages,
            conversationLength: nextMessages.length,
            userPreferences: {
              hasReactedToMessages: nextMessages.some((m) => m.reactions?.userReaction)
            }
          }
        })
      })

      const contentType = response.headers.get('content-type') || ''

      // Streaming path (Ollama)
      if (contentType.startsWith('text/plain') && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        const messageId = (Date.now() + 1).toString()

        let accumulated = ''
        const startTime = performance.now()

        updateActiveConversation((c) => ({
          ...c,
          messages: [
            ...c.messages,
            {
              id: messageId,
              text: '',
              isUser: false,
              timestamp: new Date().toISOString(),
              isError: false,
              type: 'text'
            }
          ],
          updatedAt: new Date().toISOString()
        }))

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          updateActiveConversation((c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, text: accumulated } : m
            )
          }))
        }

        const latency = Math.max(0, performance.now() - startTime)
        updateActiveConversation((c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text: accumulated || t('mascot.aiChat.errorMessage'),
                  latencyMs: latency
                }
              : m
          ),
          updatedAt: new Date().toISOString()
        }))

        return
      }

      // JSON path (fallback / non-stream providers)
      const data: {
        message?: string
        timestamp?: string
        isError?: boolean
        error?: string
        requestId?: string
        latencyMs?: number
        citations?: Array<{
          id: string
          title: string
          href: string
          excerpt?: string
          type: 'post' | 'project' | 'page'
        }>
      } = await response.json()

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
        type: 'text',
        requestId: data.requestId,
        latencyMs: data.latencyMs,
        citations: data.citations
      }

      updateActiveConversation((c) => ({
        ...c,
        messages: [...c.messages, aiMessage],
        updatedAt: new Date().toISOString()
      }))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Chat error:', error)
      }

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: t('mascot.aiChat.errorMessage'),
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
        type: 'text'
      }

      updateActiveConversation((c) => ({
        ...c,
        messages: [...c.messages, errorMessage],
        updatedAt: new Date().toISOString()
      }))
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
    updateActiveConversation((c) => ({
      ...c,
      messages: [getWelcomeMessage()],
      updatedAt: new Date().toISOString()
    }))
  }

  const submit_feedback = useCallback(
    async (input: {
      requestId: string
      messageId: string
      rating: 'like' | 'dislike'
      comment?: string
    }) => {
      setFeedbackIsSubmittingByMessageId((prev) => ({ ...prev, [input.messageId]: true }))
      try {
        const response = await fetch('/api/ai/chat/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requestId: input.requestId,
            messageId: input.messageId,
            rating: input.rating,
            comment: input.comment,
            pagePath,
            locale
          })
        })

        const data: { error?: string } = await response.json()

        if (!response.ok) {
          throw new Error(data.error ?? t('mascot.aiChat.feedback.error'))
        }

        toast.success(t('mascot.aiChat.feedback.sent'))
      } catch {
        toast.error(t('mascot.aiChat.feedback.error'))
      } finally {
        setFeedbackIsSubmittingByMessageId((prev) => ({ ...prev, [input.messageId]: false }))
      }
    },
    [locale, pagePath, t]
  )

  const handleReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    const message = messages.find((m) => m.id === messageId)
    if (!message || message.isUser || message.isError) return
    if (!message.requestId) return

    let nextUserReaction: 'like' | 'dislike' | null = reaction

    const currentReaction = message.reactions?.userReaction
    if (currentReaction === reaction) {
      nextUserReaction = null
    }

    updateActiveConversation((c) => ({
      ...c,
      updatedAt: new Date().toISOString(),
      messages: c.messages.map((message) => {
        if (message.id !== messageId || message.isUser) return message

        const currentReaction = message.reactions?.userReaction
        let newLikes = message.reactions?.likes ?? 0
        let newDislikes = message.reactions?.dislikes ?? 0
        let newUserReaction: 'like' | 'dislike' | null = reaction

        // If clicking the same reaction, remove it
        if (currentReaction === reaction) {
          newUserReaction = null
          if (reaction === 'like') newLikes--
          else newDislikes--
        } else {
          // If switching reactions, remove old and add new
          if (currentReaction === 'like') newLikes--
          else if (currentReaction === 'dislike') newDislikes--

          if (reaction === 'like') newLikes++
          else newDislikes++
        }

        return {
          ...message,
          reactions: {
            likes: Math.max(0, newLikes),
            dislikes: Math.max(0, newDislikes),
            userReaction: newUserReaction
          }
        }
      })
    }))

    if (!nextUserReaction) {
      setFeedbackOpenForMessageId((current) => (current === messageId ? null : current))
      return
    }

    if (nextUserReaction === 'dislike') {
      setFeedbackOpenForMessageId(messageId)
      return
    }

    setFeedbackOpenForMessageId((current) => (current === messageId ? null : current))
    void submit_feedback({
      requestId: message.requestId,
      messageId,
      rating: nextUserReaction
    })
  }

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('mascot.aiChat.messageCopied'))
    } catch {
      toast.error(t('mascot.aiChat.messageCopyFailed'))
    }
  }

  // Animated typing indicator
  useEffect(() => {
    if (!isLoading) {
      setTypingDots('')
      return
    }

    const interval = setInterval(() => {
      setTypingDots((prev) => {
        if (prev === '...') return '.'
        if (prev === '..') return '...'
        if (prev === '.') return '..'
        return '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isOpen) return null

  return (
    <>
      <div className='bg-popover/95 absolute right-0 bottom-full mb-2 max-h-[600px] w-96 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm sm:w-md'>
        {/* Header */}
        <div className='from-primary/10 to-primary/5 flex items-center justify-between border-b bg-linear-to-r p-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <div className='bg-primary/10 rounded-lg p-1.5'>
              <MessageCircle className='h-4 w-4' />
            </div>
            <div className='flex flex-col'>
              <span className='text-sm leading-none font-semibold'>{t('mascot.aiChat.title')}</span>
              <div className='text-muted-foreground mt-0.5 flex items-center gap-2 text-xs'>
                <Select value={activeConversationId} onValueChange={setActiveConversationId}>
                  <SelectTrigger
                    className='bg-background/40 border-border/40 max-w-[180px] rounded border px-2 py-0.5 text-xs'
                    aria-label={t('mascot.aiChat.conversations')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conversations.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={provider} onValueChange={(v) => setProvider(v as YueChatProvider)}>
                  <SelectTrigger
                    className='bg-background/40 border-border/40 max-w-[150px] rounded border px-2 py-0.5 text-xs'
                    aria-label={t('mascot.aiChat.provider')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='auto'>{t('mascot.aiChat.providers.auto')}</SelectItem>
                    {flags.hf && <SelectItem value='hf'>{t('mascot.aiChat.providers.hf')}</SelectItem>}
                    {flags.hfLocal && (
                      <SelectItem value='hf_local'>{t('mascot.aiChat.providers.hf_local')}</SelectItem>
                    )}
                    {flags.gemini && (
                      <SelectItem value='gemini'>{t('mascot.aiChat.providers.gemini')}</SelectItem>
                    )}
                    {flags.ollama && (
                      <SelectItem value='ollama'>{t('mascot.aiChat.providers.ollama')}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={startNewChat}
              className='hover:bg-muted rounded p-1 transition-colors'
              aria-label={t('mascot.aiChat.newChat')}
            >
              <Plus className='h-4 w-4' />
            </button>
            <button
              type='button'
              onClick={shareChat}
              className='hover:bg-muted rounded p-1 transition-colors'
              aria-label={t('mascot.aiChat.share')}
            >
              <Share2 className='h-4 w-4' />
            </button>
            <button
              type='button'
              onClick={renameChat}
              className='hover:bg-muted rounded px-2 py-1 text-xs transition-colors'
            >
              {t('mascot.aiChat.rename')}
            </button>
            <button
              type='button'
              onClick={deleteChat}
              className='hover:bg-muted rounded p-1 transition-colors'
              aria-label={t('mascot.aiChat.deleteChat')}
            >
              <Trash2 className='h-4 w-4' />
            </button>
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
        <div className='from-background/50 to-background/80 max-h-80 flex-1 space-y-4 overflow-y-auto bg-linear-to-b p-4'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm ${get_bubble_class_name(message)}`}
              >
                {!message.isUser && (
                  <div className='border-border/20 mb-2 flex items-center gap-2 border-b pb-2'>
                    <div className='bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full'>
                      <span className='text-primary text-xs font-bold'>Y</span>
                    </div>
                    <span className='text-muted-foreground text-xs font-medium'>Yue</span>
                    {!message.isError && (
                      <button
                        type='button'
                        onClick={() => copyMessage(message.text)}
                        className='text-muted-foreground hover:text-foreground ml-auto rounded p-1 transition-colors'
                        aria-label={t('mascot.aiChat.copyMessage')}
                      >
                        <Copy className='h-3.5 w-3.5' />
                      </button>
                    )}
                  </div>
                )}
                <p className='leading-relaxed whitespace-pre-wrap'>{message.text}</p>

                {!message.isUser && !message.isError && (message.citations?.length ?? 0) > 0 ? (
                  <div className='border-border/20 mt-3 space-y-2 border-t pt-2'>
                    <div className='text-muted-foreground text-[11px] font-medium'>Sources</div>
                    <div className='space-y-1'>
                      {message.citations?.map((c) => (
                        <a
                          key={c.id}
                          href={c.href}
                          className='text-primary block text-[11px] hover:underline'
                        >
                          {c.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
                {!message.isUser && !message.isError && message.requestId && (
                  <div className='mt-2 flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                      <button
                        type='button'
                        onClick={() => handleReaction(message.id, 'like')}
                        aria-label={t('mascot.aiChat.feedback.like')}
                        disabled={feedbackIsSubmittingByMessageId[message.id] === true}
                        className={`hover:bg-muted/80 flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
                          message.reactions?.userReaction === 'like'
                            ? 'bg-green-50 text-green-600 dark:bg-green-950'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <ThumbsUp className='h-3 w-3' />
                        {message.reactions?.likes ?? 0}
                      </button>
                      <button
                        type='button'
                        onClick={() => handleReaction(message.id, 'dislike')}
                        aria-label={t('mascot.aiChat.feedback.dislike')}
                        disabled={feedbackIsSubmittingByMessageId[message.id] === true}
                        className={`hover:bg-muted/80 flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
                          message.reactions?.userReaction === 'dislike'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <ThumbsDown className='h-3 w-3' />
                        {message.reactions?.dislikes ?? 0}
                      </button>
                    </div>
                    <div className='text-muted-foreground/60 text-xs'>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
                {!message.isUser &&
                !message.isError &&
                message.requestId &&
                feedbackOpenForMessageId === message.id &&
                message.reactions?.userReaction === 'dislike' ? (
                  <div className='border-border/20 mt-3 space-y-2 border-t pt-2'>
                    <textarea
                      rows={2}
                      value={feedbackDraftByMessageId[message.id] ?? ''}
                      onChange={(e) =>
                        setFeedbackDraftByMessageId((prev) => ({
                          ...prev,
                          [message.id]: e.target.value
                        }))
                      }
                      placeholder={t('mascot.aiChat.feedback.commentPlaceholder')}
                      className='bg-background/80 border-border/50 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/60 w-full resize-none rounded-lg border px-3 py-2 text-xs transition-all duration-200 focus:ring-2 focus:outline-none'
                      disabled={feedbackIsSubmittingByMessageId[message.id] === true}
                    />
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        type='button'
                        onClick={() => setFeedbackOpenForMessageId(null)}
                        className='text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs transition-colors'
                        disabled={feedbackIsSubmittingByMessageId[message.id] === true}
                      >
                        {t('mascot.aiChat.feedback.cancel')}
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          const raw = feedbackDraftByMessageId[message.id]
                          const comment = raw?.trim() ? raw.trim() : undefined

                          void submit_feedback({
                            requestId: message.requestId!,
                            messageId: message.id,
                            rating: 'dislike',
                            comment
                          })

                          setFeedbackOpenForMessageId(null)
                          setFeedbackDraftByMessageId((prev) => ({ ...prev, [message.id]: '' }))
                        }}
                        className='bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                        disabled={feedbackIsSubmittingByMessageId[message.id] === true}
                      >
                        {feedbackIsSubmittingByMessageId[message.id] === true ? (
                          <span className='flex items-center gap-2'>
                            <Loader2 className='h-3 w-3 animate-spin' />
                            {t('mascot.aiChat.feedback.send')}
                          </span>
                        ) : (
                          t('mascot.aiChat.feedback.send')
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
                {!message.isUser && message.isError && (
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
              <div className='from-muted/80 to-muted/60 text-foreground border-border/30 flex items-center gap-2 rounded-2xl rounded-bl-md border bg-linear-to-br p-3'>
                <div className='border-border/20 mb-2 flex w-full items-center gap-2 border-b pb-2'>
                  <div className='bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full'>
                    <span className='text-primary text-xs font-bold'>Y</span>
                  </div>
                  <span className='text-muted-foreground text-xs font-medium'>Yue</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Loader2 className='text-primary h-4 w-4 animate-spin' />
                  <span className='text-xs'>
                    {t('mascot.aiChat.thinking')}
                    {typingDots}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className='from-background/80 to-background/60 border-t bg-linear-to-r p-4 backdrop-blur-sm'>
          <div className='flex gap-2'>
            <input
              ref={inputRef}
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('mascot.aiChat.placeholder')}
              className='bg-background/80 border-border/50 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/60 flex-1 rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none'
              disabled={isLoading}
            />
            <button
              type='button'
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className='from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 rounded-xl bg-linear-to-r px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'
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
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('mascot.aiChat.deleteChat')}
        description={t('mascot.aiChat.deleteConfirm')}
        confirmText={t('common.delete') ?? 'Delete'}
        cancelText={t('common.cancel') ?? 'Cancel'}
        variant='destructive'
        onConfirm={confirmDeleteChat}
      />
    </>
  )
}
