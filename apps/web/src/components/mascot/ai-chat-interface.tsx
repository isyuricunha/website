'use client'

import { useTranslations, useLocale } from '@isyuricunha/i18n/client'
import { useRouter } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'
import { env, flags } from '@isyuricunha/env'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  buttonVariants,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DotMatrixLoader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@isyuricunha/yutheme'

import {
  Copy,
  Eraser,
  ExternalLink,
  Sparkles,
  Loader2,
  MessageCircle,
  Maximize2,
  Minimize2,
  MoreVertical,
  Pencil,
  Plus,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  RefreshCw,
  X
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { cn } from '@isyuricunha/utils'
import {
  type ChatConversation,
  type ChatMessage,
  createEmptyConversation,
  decodeConversationShare,
  encodeConversationShare,
  loadMascotChatState,
  saveMascotChatState
} from '@/utils/mascot-chat-storage'
import ConfirmationDialog from '../admin/confirmation-dialog'
import { useSound } from '../../hooks/use-sound'
import {
  type AssistantAction,
  ASSISTANT_CONTENT_TYPE,
  readAssistantEvents,
  type AssistantEvent
} from '@/lib/ai/assistant-protocol'
import { MASCOT_AVATAR_SRC } from './mascot-art'
import { NeryChatComposer } from './components/nery-chat-composer'
import { ChatMarkdown } from './components/chat-markdown'
import { is_safe_internal_path } from './chat-link-policy'

interface AIChatInterfaceProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly currentPage?: string
  readonly pagePath?: string
  readonly onMessageSent?: (message: string) => void
  readonly onThinkingChange?: (isThinking: boolean) => void
}

export { is_safe_internal_path } from './chat-link-policy'

type CitationType = 'post' | 'project' | 'page' | 'snippet'
type ChatConnectionStatus = 'checking' | 'ready' | 'unavailable' | 'offline'
type QuickPromptId =
  | 'siteGuide'
  | 'projects'
  | 'recentPosts'
  | 'recommendPost'
  | 'topicSearch'
  | 'summarizePage'
  | 'relatedPost'
  | 'keyTakeaway'
  | 'explainSnippet'
  | 'applySnippet'
  | 'relatedSnippet'
  | 'recommendProject'
  | 'projectStack'
  | 'summarizeProject'
  | 'relatedProject'
  | 'aboutYuri'
  | 'currentFocus'
  | 'contactYuri'
  | 'recommendContent'

const get_citation_badge_variant = (type: CitationType) => {
  if (type === 'post') return 'default'
  if (type === 'project') return 'secondary'
  if (type === 'snippet') return 'outline'
  return 'outline'
}

const is_abort_error = (error: unknown) => {
  if (error instanceof Error && error.name === 'AbortError') return true
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return error.name === 'AbortError'
  }
  return false
}

const is_browser_offline = () => !globalThis.navigator?.onLine

const DEFAULT_QUICK_PROMPT_IDS: QuickPromptId[] = ['siteGuide', 'recommendContent', 'contactYuri']

const QUICK_PROMPTS_BY_PAGE: Record<string, QuickPromptId[]> = {
  home: ['siteGuide', 'projects', 'recentPosts'],
  blog: ['recommendPost', 'recentPosts', 'topicSearch'],
  blogPost: ['summarizePage', 'relatedPost', 'keyTakeaway'],
  snippet: ['explainSnippet', 'applySnippet', 'relatedSnippet'],
  projects: ['recommendProject', 'projectStack', 'contactYuri'],
  projectsDetail: ['summarizeProject', 'projectStack', 'relatedProject'],
  about: ['aboutYuri', 'currentFocus', 'contactYuri'],
  now: ['currentFocus', 'projects', 'recentPosts'],
  contact: ['contactYuri', 'siteGuide', 'projects'],
  default: DEFAULT_QUICK_PROMPT_IDS
}

const get_quick_prompt_ids = (pageKey: string): QuickPromptId[] => {
  return QUICK_PROMPTS_BY_PAGE[pageKey] ?? DEFAULT_QUICK_PROMPT_IDS
}

type InitialChatState = {
  conversations: ChatConversation[]
  activeConversationId: string
  importStatus: 'none' | 'success' | 'failed'
}

const createWelcomeMessage = (text: string): ChatMessage => {
  return {
    id: 'welcome',
    text,
    isUser: false,
    timestamp: new Date().toISOString(),
    type: 'text'
  }
}

const createBrowserId = () => {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

const getInitialChatState = (input: {
  welcomeMessageText: string
  importedTitle: string
  newChatTitle: string
}): InitialChatState => {
  const loaded = loadMascotChatState()
  let conversations = loaded.conversations
  let activeConversationId = loaded.activeConversationId
  let importStatus: InitialChatState['importStatus'] = 'none'

  if (globalThis.window !== undefined) {
    const params = new URLSearchParams(location.search)
    const fragment = new URLSearchParams(location.hash.slice(1))
    const shared = fragment.get('nery_chat') ?? params.get('nery_chat') ?? params.get('yue_chat')

    if (shared) {
      const decoded = decodeConversationShare(shared)

      if (decoded) {
        const imported: ChatConversation = {
          ...decoded,
          id: createBrowserId(),
          title: decoded.title || input.importedTitle,
          updatedAt: new Date().toISOString()
        }

        conversations = [imported, ...conversations].slice(0, 50)
        activeConversationId = imported.id
        importStatus = 'success'

        params.delete('nery_chat')
        params.delete('yue_chat')
        const hash = fragment.has('nery_chat') ? '' : location.hash
        const url = `${location.pathname}${params.size > 0 ? `?${params.toString()}` : ''}${hash}`
        history.replaceState(null, '', url)
      } else {
        importStatus = 'failed'
      }
    }
  }

  conversations = conversations.map((conversation) => {
    if (conversation.id !== activeConversationId) return conversation
    if (conversation.messages.length > 0) return conversation

    return {
      ...conversation,
      title: conversation.title === 'New chat' ? input.newChatTitle : conversation.title,
      messages: [createWelcomeMessage(input.welcomeMessageText)],
      updatedAt: new Date().toISOString()
    }
  })

  return { conversations, activeConversationId, importStatus }
}

export default function AIChatInterface({
  isOpen,
  onClose,
  currentPage = '',
  pagePath = '',
  onMessageSent,
  onThinkingChange
}: AIChatInterfaceProps) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { play: navigationPlay } = useSound('navigation')
  const { play: clickPlay } = useSound('click')

  const mascot_avatar_src = MASCOT_AVATAR_SRC

  const user_display_name = t('mascot.aiChat.userLabel')

  const welcomeMessageText = t('mascot.aiChat.welcomeMessage')
  const [initialChatState] = useState(() =>
    getInitialChatState({
      welcomeMessageText,
      importedTitle: t('mascot.aiChat.importedTitle'),
      newChatTitle: t('mascot.aiChat.newChatTitle')
    })
  )
  const [conversations, setConversations] = useState<ChatConversation[]>(
    initialChatState.conversations
  )
  const [activeConversationId, setActiveConversationId] = useState<string>(
    initialChatState.activeConversationId
  )
  const messageIdCounterRef = useRef(0)
  const importStatusToastShownRef = useRef(false)
  const [messageActions, setMessageActions] = useState<Record<string, AssistantAction[]>>({})
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [phase, setPhase] = useState<'searching' | 'reading' | 'responding'>('responding')
  const [isCancelling, setIsCancelling] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ChatConnectionStatus>('checking')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [isTurnstileEnabled] = useState(
    () => flags.turnstile && !!env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  )
  const turnstileRef = useRef<React.ElementRef<typeof Turnstile>>(null)
  const [feedbackOpenForMessageId, setFeedbackOpenForMessageId] = useState<string | null>(null)
  const [feedbackDraftByMessageId, setFeedbackDraftByMessageId] = useState<Record<string, string>>(
    {}
  )
  const [feedbackIsSubmittingByMessageId, setFeedbackIsSubmittingByMessageId] = useState<
    Record<string, boolean>
  >({})
  const messageListRef = useRef<HTMLDivElement>(null)
  const followBottomRef = useRef(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const getWelcomeMessage = useCallback((): ChatMessage => {
    return createWelcomeMessage(welcomeMessageText)
  }, [welcomeMessageText])

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) ?? null
  }, [activeConversationId, conversations])

  const messages = useMemo(() => {
    return activeConversation?.messages ?? []
  }, [activeConversation])

  const chatStatusKey = isLoading ? phase : connectionStatus
  const canUseChat = connectionStatus === 'ready'
  const shouldShowQuickPrompts =
    canUseChat && !isLoading && messages.every((message) => !message.isUser)
  const quickPrompts = useMemo(() => {
    return get_quick_prompt_ids(currentPage).map((id) => ({
      id,
      label: t(`mascot.aiChat.quickPrompts.items.${id}.label` as any),
      prompt: t(`mascot.aiChat.quickPrompts.items.${id}.prompt` as any)
    }))
  }, [currentPage, t])
  const statusDotClassName = (() => {
    if (chatStatusKey === 'ready') return 'bg-status-success'
    if (isLoading || chatStatusKey === 'checking') return 'bg-status-warning'
    return 'bg-status-danger'
  })()

  const get_bubble_class_name = (message: ChatMessage) => {
    if (message.isUser) {
      return 'text-status-info rounded-br-md border border-[var(--status-info-border)] bg-status-info-soft'
    }
    if (message.isError) {
      return 'text-status-danger border-[var(--status-danger-border)] rounded-bl-md border bg-status-danger-soft'
    }
    return 'text-foreground border-[var(--border-subtle)] rounded-bl-md border bg-bg-surface'
  }

  // Only scroll the message list, never its ancestors or the document.
  useEffect(() => {
    const list = messageListRef.current
    if (list && followBottomRef.current) list.scrollTop = list.scrollHeight
  }, [messages])

  useEffect(() => {
    followBottomRef.current = true
    const list = messageListRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [activeConversationId, isOpen])

  // Touch visitors explicitly focus the composer to avoid opening the keyboard.
  useEffect(() => {
    if (!isOpen || globalThis.matchMedia?.('(pointer: coarse)').matches) return
    const timer = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Notify the user when a shared conversation was imported from the URL.
  useEffect(() => {
    if (!isOpen) return
    if (initialChatState.importStatus === 'none') return
    if (importStatusToastShownRef.current) return

    importStatusToastShownRef.current = true

    if (initialChatState.importStatus === 'success') {
      toast.success(t('mascot.aiChat.imported'))
    } else {
      toast.error(t('mascot.aiChat.importFailed'))
    }
  }, [initialChatState.importStatus, isOpen, t])

  useEffect(() => {
    if (!isOpen) return
    if (!activeConversationId || isLoading) return

    saveMascotChatState({ conversations, activeConversationId, provider: 'auto' })
  }, [activeConversationId, conversations, isOpen, isLoading])

  const updateConversationById = useCallback(
    (conversationId: string, updater: (conversation: ChatConversation) => ChatConversation) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c
          const updated = updater(c)
          return { ...updated, messages: updated.messages.slice(-200) }
        })
      )
    },
    []
  )

  const updateActiveConversation = useCallback(
    (updater: (conversation: ChatConversation) => ChatConversation) => {
      if (!activeConversation) return
      updateConversationById(activeConversation.id, updater)
    },
    [activeConversation, updateConversationById]
  )

  const refreshChatStatus = useCallback(async () => {
    if (is_browser_offline()) {
      setConnectionStatus('offline')
      return
    }

    setConnectionStatus('checking')

    try {
      const response = await fetch('/api/ai/chat/status', {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) {
        setConnectionStatus('unavailable')
        return
      }

      const data = (await response.json()) as { available?: boolean }
      setConnectionStatus(data.available === true ? 'ready' : 'unavailable')
    } catch {
      setConnectionStatus(is_browser_offline() ? 'offline' : 'unavailable')
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleOnline = () => {
      void refreshChatStatus()
    }
    const handleOffline = () => {
      setConnectionStatus('offline')
    }

    addEventListener('online', handleOnline)
    addEventListener('offline', handleOffline)

    // Check status when opening; use setTimeout to avoid set-state-in-effect lint warning
    const timer = setTimeout(() => {
      void refreshChatStatus()
    }, 0)

    return () => {
      removeEventListener('online', handleOnline)
      removeEventListener('offline', handleOffline)
      clearTimeout(timer)
    }
  }, [isOpen, refreshChatStatus])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
    }
  }, [])

  const cancelCurrentResponse = useCallback(() => {
    const controller = abortControllerRef.current
    if (!controller || controller.signal.aborted) return

    setIsCancelling(true)
    controller.abort()
  }, [])

  const appendCancelledResponse = useCallback(
    (conversationId: string, assistantMessageId: string | null) => {
      const cancelledText = t('mascot.aiChat.cancelledMessage')

      updateConversationById(conversationId, (conversation) => {
        const existingAssistantMessage =
          assistantMessageId &&
          conversation.messages.some((message) => message.id === assistantMessageId)

        if (existingAssistantMessage && assistantMessageId) {
          return {
            ...conversation,
            messages: conversation.messages.map((message) => {
              if (message.id !== assistantMessageId) return message

              const text = message.text.trim()
              return {
                ...message,
                text: text ? `${text}\n\n${cancelledText}` : cancelledText,
                isError: false,
                cancelled: true
              }
            }),
            updatedAt: new Date().toISOString()
          }
        }

        const cancelledMessage: ChatMessage = {
          id: `ai-cancelled-${messageIdCounterRef.current++}-${Date.now()}`,
          cancelled: true,
          text: cancelledText,
          isUser: false,
          timestamp: new Date().toISOString(),
          isError: false,
          type: 'text'
        }

        return {
          ...conversation,
          messages: [...conversation.messages, cancelledMessage],
          updatedAt: new Date().toISOString()
        }
      })
    },
    [t, updateConversationById]
  )

  const startNewChat = () => {
    const created = createEmptyConversation(t('mascot.aiChat.newChatTitle'))
    const withWelcome: ChatConversation = {
      ...created,
      messages: [getWelcomeMessage()],
      updatedAt: new Date().toISOString()
    }

    setConversations((prev) => [withWelcome, ...prev].slice(0, 50))
    setActiveConversationId(withWelcome.id)
    setEditingMessageId(null)
    setInputValue('')
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const lastUserId = messages.findLast((message) => message.isUser)?.id

  const renameChat = () => {
    if (activeConversation) setRenameValue(activeConversation.title)
  }

  const saveChatName = () => {
    const title = renameValue?.trim().slice(0, 120)
    if (!title) return
    updateActiveConversation((conversation) => ({
      ...conversation,
      title,
      updatedAt: new Date().toISOString()
    }))
    setRenameValue(null)
  }

  const deleteChat = () => {
    if (!activeConversation) return
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteChat = () => {
    if (!activeConversation) return
    setIsDeleteDialogOpen(false)
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

    try {
      const payload = encodeConversationShare({
        ...activeConversation,
        messages: activeConversation.messages.slice(-50)
      })
      const url = new URL(location.href)
      url.searchParams.delete('yue_chat')
      url.searchParams.delete('nery_chat')
      url.hash = new URLSearchParams({ nery_chat: payload }).toString()
      await navigator.clipboard.writeText(url.href)
      toast.success(t('mascot.aiChat.shareCopied'))
    } catch {
      toast.error(t('mascot.aiChat.shareCopyFailed'))
    }
  }

  const sendMessage = async () => {
    const messageText = inputValue.trim()
    if (!messageText || isLoading || !canUseChat) return
    if (!activeConversation) return

    setInputValue('')
    const accepted = await send_chat_message(messageText, undefined, editingMessageId ?? undefined)
    // Restore the draft when the send was rejected (e.g. turnstile still
    // arming) so the user's text is never swallowed.
    if (accepted) {
      setEditingMessageId(null)
    } else {
      setInputValue(messageText)
    }
  }

  const send_chat_message = useCallback(
    async (rawText: string, retryMessageId?: string, editUserId?: string): Promise<boolean> => {
      if (isLoading || !canUseChat || abortControllerRef.current) return false
      if (!activeConversation) return false

      const messageText = rawText.trim()
      if (!messageText) return false
      const conversationId = activeConversation.id

      // Turnstile must be armed before any UI mutation: without a token the
      // message would be swallowed after the optimistic update and a pending
      // prompt would be lost, so reject visibly and keep the input intact.
      // Repeated clicks while the widget is still arming must not stack
      // identical bubbles, so only push one when the last message is not
      // already a turnstile-pending notice.
      if (isTurnstileEnabled && !turnstileToken) {
        const lastMessage = activeConversation.messages.at(-1)
        const alreadyPending =
          lastMessage !== undefined && lastMessage.id.startsWith('turnstile-pending-')

        if (!alreadyPending) {
          updateConversationById(conversationId, (c) => ({
            ...c,
            messages: [
              ...c.messages,
              {
                id: `turnstile-pending-${messageIdCounterRef.current++}-${Date.now()}`,
                text: t.has('mascot.aiChat.turnstilePending')
                  ? t('mascot.aiChat.turnstilePending')
                  : 'Security verification pending - please retry in a moment.',
                isUser: false,
                timestamp: new Date().toISOString(),
                isError: true,
                type: 'text'
              }
            ],
            updatedAt: new Date().toISOString()
          }))
        }
        return false
      }

      const retryIndex = retryMessageId
        ? activeConversation.messages.findIndex(
            (message) =>
              message.id === retryMessageId && !message.isUser && message.id !== 'welcome'
          )
        : -1
      if (retryMessageId && retryIndex < 0) return false

      const previousMessages = activeConversation.messages
      const retryUser =
        retryIndex >= 0
          ? previousMessages.slice(0, retryIndex).findLast((message) => message.isUser)
          : undefined
      if (retryMessageId && !retryUser) return false

      const editIndex = editUserId
        ? previousMessages.findIndex((item) => item.id === editUserId && item.isUser)
        : -1
      if (editUserId && editIndex < 0) return false
      const userMessage: ChatMessage = {
        id: `user-${messageIdCounterRef.current++}-${Date.now()}`,
        text: messageText,
        isUser: true,
        timestamp: new Date().toISOString(),
        type: 'text' as const
      }
      let nextMessages = [...previousMessages, userMessage]
      if (editIndex >= 0) {
        nextMessages = [...previousMessages.slice(0, editIndex), userMessage]
      } else if (retryUser) {
        nextMessages = previousMessages.slice(0, previousMessages.indexOf(retryUser) + 1)
      }

      nextMessages = nextMessages.slice(-200)
      const updatedAt = new Date().toISOString()
      updateConversationById(conversationId, (c) => ({ ...c, messages: nextMessages, updatedAt }))
      saveMascotChatState({
        conversations: conversations.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, messages: nextMessages, updatedAt }
            : conversation
        ),
        activeConversationId: conversationId,
        provider: 'auto'
      })
      const retained = new Set(
        conversations.flatMap((conversation) =>
          (conversation.id === conversationId ? nextMessages : conversation.messages).map(
            (item) => item.id
          )
        )
      )
      setMessageActions((previous) =>
        Object.fromEntries(Object.entries(previous).filter(([id]) => retained.has(id)))
      )
      setFeedbackDraftByMessageId((previous) =>
        Object.fromEntries(Object.entries(previous).filter(([id]) => retained.has(id)))
      )
      setFeedbackIsSubmittingByMessageId((previous) =>
        Object.fromEntries(Object.entries(previous).filter(([id]) => retained.has(id)))
      )
      followBottomRef.current = true
      setPhase('responding')
      setIsLoading(true)
      setIsCancelling(false)
      onMessageSent?.(messageText)

      const abortController = new AbortController()
      abortControllerRef.current = abortController
      let assistantMessageId: string | null = null

      const appendError = (requestId?: string) => {
        const errorMessage: ChatMessage = {
          id: `ai-error-${messageIdCounterRef.current++}-${Date.now()}`,
          text: t('mascot.aiChat.errorMessage'),
          isUser: false,
          timestamp: new Date().toISOString(),
          isError: true,
          type: 'text',
          requestId
        }

        updateConversationById(conversationId, (c) => ({
          ...c,
          messages: [...c.messages, errorMessage],
          updatedAt: new Date().toISOString()
        }))
      }

      try {
        // The final message is sent separately in the request's message field.
        // Preserve earlier turns (including intentional repeated questions),
        // excluding UI-only welcome/error notices. Retry uses the same boundary.
        const recentMessages = nextMessages
          .slice(0, -1)
          .filter(
            (message) =>
              message.id !== 'welcome' &&
              !message.isError &&
              !message.cancelled &&
              message.text.trim()
          )
          .slice(-15)
          .map((message) => ({
            role: message.isUser ? 'user' : 'assistant',
            content: message.text.slice(0, 4000),
            timestamp: message.timestamp
          }))

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageText,
            assistantVersion: 2,
            stream: true,
            locale,
            ...(isTurnstileEnabled && { turnstileToken }),
            context: {
              currentPage,
              pagePath,
              historyVersion: 2,
              conversation: recentMessages
            }
          })
        })

        const contentType = response.headers.get('content-type') || ''

        if (!response.ok) {
          appendError(response.headers.get('x-request-id') ?? undefined)
          if (response.status === 503) setConnectionStatus('unavailable')
          return true
        }

        if (contentType.startsWith(ASSISTANT_CONTENT_TYPE) && response.body) {
          const messageId = `ai-${messageIdCounterRef.current++}-${Date.now()}`
          assistantMessageId = messageId
          const requestId = response.headers.get('x-request-id') ?? undefined
          let accumulated = ''
          let completed = false
          let lastRender = 0
          const update = (text: string, extra: Partial<ChatMessage> = {}) => {
            updateConversationById(conversationId, (conversation) => ({
              ...conversation,
              messages: conversation.messages.map((item) =>
                item.id === messageId ? { ...item, text, ...extra } : item
              ),
              updatedAt: new Date().toISOString()
            }))
          }
          updateConversationById(conversationId, (conversation) => ({
            ...conversation,
            messages: [
              ...conversation.messages,
              {
                id: messageId,
                text: '',
                isUser: false,
                timestamp: new Date().toISOString(),
                type: 'text',
                requestId
              }
            ]
          }))
          const applyEvent = (event: AssistantEvent) => {
            switch (event.type) {
              case 'phase': {
                setPhase(event.phase)
                break
              }
              case 'delta': {
                setPhase('responding')
                accumulated += event.text
                if (performance.now() - lastRender >= 45) {
                  update(accumulated)
                  lastRender = performance.now()
                }
                break
              }
              case 'reset': {
                accumulated = ''
                update('')
                break
              }
              case 'done': {
                update(event.text, {
                  requestId: event.requestId,
                  latencyMs: event.latencyMs,
                  citations: event.citations
                })
                if (event.actions?.length)
                  setMessageActions((previous) => ({
                    ...previous,
                    [messageId]: event.actions ?? []
                  }))
                completed = true
                break
              }
              case 'error': {
                update(t('mascot.aiChat.errorMessage'), {
                  isError: true,
                  requestId: event.requestId
                })
                completed = true
                break
              }
            }
          }
          for await (const event of readAssistantEvents(response.body)) {
            if (!completed) applyEvent(event)
          }
          if (!completed) {
            if (abortController.signal.aborted) {
              appendCancelledResponse(conversationId, assistantMessageId)
            } else {
              update(t('mascot.aiChat.errorMessage'), { isError: true })
            }
          }
          return true
        }

        // Streaming path
        if (contentType.startsWith('text/plain') && response.body) {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          const messageId = `ai-${messageIdCounterRef.current++}-${Date.now()}`
          assistantMessageId = messageId

          let accumulated = ''
          const startTime = performance.now()

          updateConversationById(conversationId, (c) => ({
            ...c,
            messages: [
              ...c.messages,
              {
                id: messageId,
                text: '',
                isUser: false,
                timestamp: new Date().toISOString(),
                isError: false,
                type: 'text',
                requestId: response.headers.get('x-request-id') ?? undefined
              }
            ],
            updatedAt: new Date().toISOString()
          }))

          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) break
              accumulated += decoder.decode(value, { stream: true })
              updateConversationById(conversationId, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, text: accumulated } : m
                )
              }))
            }

            accumulated += decoder.decode()
          } finally {
            reader.releaseLock()
          }

          const latency = Math.max(0, Math.round(performance.now() - startTime))
          updateConversationById(conversationId, (c) => ({
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

          return true
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
            type: 'post' | 'project' | 'page' | 'snippet'
          }>
        } = await response.json()

        const safeTimestamp = data.timestamp ?? new Date().toISOString()

        const aiMessage: ChatMessage = {
          id: `ai-${messageIdCounterRef.current++}-${Date.now()}`,
          text: data.message ?? t('mascot.aiChat.errorMessage'),
          isUser: false,
          timestamp: safeTimestamp,
          isError: data.isError ?? false,
          type: 'text',
          requestId: data.requestId,
          latencyMs: data.latencyMs,
          citations: data.citations
        }
        assistantMessageId = aiMessage.id

        updateConversationById(conversationId, (c) => ({
          ...c,
          messages: [...c.messages, aiMessage],
          updatedAt: new Date().toISOString()
        }))

        return true
      } catch (error) {
        if (is_abort_error(error)) {
          appendCancelledResponse(conversationId, assistantMessageId)
          return true
        }

        // Transport/parse failures have an explicit retryable message. The
        // server records HTTP failures with a request ID; do not leak upstream
        // error text to visitors.
        if (assistantMessageId) {
          updateConversationById(conversationId, (conversation) => ({
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.id === assistantMessageId
                ? { ...message, text: t('mascot.aiChat.errorMessage'), isError: true }
                : message
            )
          }))
        } else appendError()
        return true
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null
        }
        // Consume the turnstile token per request: reset the widget so the
        // next message carries a fresh token.
        if (isTurnstileEnabled) {
          turnstileRef.current?.reset()
          setTurnstileToken(null)
        }
        setIsCancelling(false)
        setIsLoading(false)
      }
    },
    [
      activeConversation,
      appendCancelledResponse,
      canUseChat,
      currentPage,
      conversations,
      isLoading,
      isTurnstileEnabled,
      locale,
      onMessageSent,
      pagePath,
      t,
      turnstileToken,
      updateConversationById
    ]
  )

  // Handle pending prompts (like "Explain this selection").
  // The pending value is only consumed when the message was actually
  // accepted: a turnstile-unarmed rejection leaves it in sessionStorage so
  // the effect retries once the widget produces a token. The effect is
  // gated on the token so a rejection bubble cannot loop the retry.
  useEffect(() => {
    if (!isOpen || isLoading || !canUseChat) return
    if (isTurnstileEnabled && !turnstileToken) return
    const pending = sessionStorage.getItem('yue_pending_prompt')
    if (pending) {
      void send_chat_message(pending).then((accepted) => {
        if (accepted) {
          sessionStorage.removeItem('yue_pending_prompt')
        }
      })
    }
  }, [canUseChat, isOpen, isLoading, isTurnstileEnabled, send_chat_message, turnstileToken])

  const copyLink = async (href: string) => {
    try {
      const absolute = (() => {
        if (globalThis.window === undefined) return href
        try {
          return new URL(href, location.origin).href
        } catch {
          return href
        }
      })()

      await navigator.clipboard.writeText(absolute)
      toast.success(t('mascot.aiChat.citations.linkCopied'))
    } catch {
      toast.error(t('mascot.aiChat.citations.linkCopyFailed'))
    }
  }

  const more_like_this = async (citation: { title: string; type: CitationType }) => {
    const prompt = t('mascot.aiChat.citations.moreLikeThisPrompt', {
      title: citation.title,
      type: t(`mascot.aiChat.citations.types.${citation.type}` as any)
    })

    await send_chat_message(prompt)
  }

  const sendButtonLabel = t(
    isLoading ? 'mascot.aiChat.cancelResponse' : 'mascot.aiChat.sendMessage'
  )

  const retry_message = async (messageId: string) => {
    const conversation = conversations.find((c) => c.id === activeConversationId)
    if (!conversation) return

    const messageIndex = conversation.messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1) return

    // Find the last user message before this error
    const lastUserMessage = conversation.messages.slice(0, messageIndex).findLast((m) => m.isUser)

    if (!lastUserMessage) return

    // Retry from the original user message in one state update.
    await send_chat_message(lastUserMessage.text, messageId)
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

  // Report thinking state to parent
  useEffect(() => {
    onThinkingChange?.(isLoading)
  }, [isLoading, onThinkingChange])

  if (!isOpen) return null

  return (
    <TooltipProvider>
      <div
        className={cn(
          'bg-bg-elevated shadow-feature-card flex max-w-[min(calc(100vw-2rem),var(--nery-panel-width,100vw))] flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)]',
          expanded
            ? 'h-[var(--nery-panel-height,calc(100dvh-13rem))] w-[680px]'
            : 'h-[min(70dvh,var(--nery-panel-height,calc(100dvh-13rem)))] max-h-[720px] w-[420px]'
        )}
      >
        {/* Header */}
        <div className='bg-bg-surface flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <div className='bg-status-agent-soft text-status-agent rounded-lg p-1.5'>
              <MessageCircle className='h-4 w-4' />
            </div>
            <div className='flex flex-col'>
              <span className='text-sm leading-none font-semibold'>{t('mascot.aiChat.title')}</span>
              <div className='text-muted-foreground mt-0.5 flex items-center gap-2 text-xs'>
                <Select
                  value={activeConversationId}
                  onValueChange={(id) => {
                    setActiveConversationId(id)
                    setEditingMessageId(null)
                    setInputValue('')
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className='bg-background/30 hover:bg-background/40 h-7 max-w-[200px] rounded-full border border-[var(--border-subtle)] px-2.5 text-xs shadow-none focus:ring-2 focus:ring-[var(--action-primary-border)] focus:outline-none'
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
              </div>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  onClick={startNewChat}
                  disabled={isLoading}
                  aria-label={t('mascot.aiChat.newChat')}
                >
                  <Plus className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('mascot.aiChat.newChat')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  onClick={shareChat}
                  disabled={isLoading}
                  aria-label={t('mascot.aiChat.share')}
                >
                  <Share2 className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('mascot.aiChat.share')}</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='size-8'
                      aria-label={t('mascot.aiChat.more')}
                    >
                      <MoreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('mascot.aiChat.more')}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem onClick={() => setExpanded((value) => !value)} className='gap-2'>
                  {expanded ? <Minimize2 className='size-4' /> : <Maximize2 className='size-4' />}
                  {t(expanded ? 'mascot.aiChat.compactChat' : 'mascot.aiChat.expandChat')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={renameChat} disabled={isLoading} className='gap-2'>
                  <Pencil className='size-4' />
                  {t('mascot.aiChat.rename')}
                </DropdownMenuItem>
                {messages.length > 1 ? (
                  <DropdownMenuItem onClick={clearChat} disabled={isLoading} className='gap-2'>
                    <Eraser className='size-4' />
                    {t('mascot.aiChat.clear')}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={deleteChat}
                  disabled={isLoading}
                  className='text-status-info focus:text-accent-cyan-hover gap-2'
                >
                  <Trash2 className='size-4' />
                  {t('mascot.aiChat.deleteChat')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  onClick={onClose}
                  aria-label={t('mascot.aiChat.close')}
                >
                  <X className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('mascot.aiChat.close')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messageListRef}
          role='log'
          aria-live='polite'
          aria-busy={isLoading}
          onScroll={() => {
            const list = messageListRef.current
            if (list)
              followBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80
          }}
          className='bg-bg-surface flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4'
        >
          {messages
            .filter((message) => message.text.trim() || message.isUser)
            .map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} motion-safe:animate-in motion-safe:slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[90%] min-w-0 rounded-lg px-3.5 py-3 text-sm [overflow-wrap:anywhere] break-words shadow-sm sm:max-w-[85%] ${get_bubble_class_name(message)}`}
                >
                  {message.isUser && (
                    <div className='mb-2 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2'>
                      <span className='text-status-info/80 text-xs font-medium'>
                        {user_display_name}
                      </span>
                      {message.id === lastUserId && !isLoading && (
                        <button
                          type='button'
                          className='ml-auto rounded p-1'
                          aria-label={t('mascot.aiChat.editMessage')}
                          onClick={() => {
                            setEditingMessageId(message.id)
                            setInputValue(message.text)
                            inputRef.current?.focus({ preventScroll: true })
                          }}
                        >
                          <Pencil className='size-3.5' />
                        </button>
                      )}
                    </div>
                  )}
                  {!message.isUser && (
                    <div className='mb-2 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2'>
                      <Avatar className='h-6 w-6'>
                        <AvatarImage src={mascot_avatar_src} alt='Nery' />
                        <AvatarFallback className='text-status-agent bg-status-agent-soft text-[10px] font-medium'>
                          N
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-muted-foreground text-xs font-medium'>Nery</span>
                      {!message.isError &&
                        message.id !== 'welcome' &&
                        message.id === messages.at(-1)?.id &&
                        !isLoading &&
                        canUseChat && (
                          <button
                            type='button'
                            className='text-muted-foreground hover:text-foreground ml-auto rounded p-1'
                            aria-label={t('mascot.aiChat.regenerate')}
                            onClick={() => void retry_message(message.id)}
                          >
                            <RefreshCw className='size-3.5' />
                          </button>
                        )}
                      {!message.isError && (
                        <button
                          type='button'
                          onClick={() =>
                            copyMessage(
                              message.text.replace(/\[\[[A-Z_]+(?::[^\]]+)?\]\]/g, '').trim()
                            )
                          }
                          className='text-muted-foreground hover:text-foreground ml-auto rounded p-1 transition-colors'
                          aria-label={t('mascot.aiChat.copyMessage')}
                        >
                          <Copy className='h-3.5 w-3.5' />
                        </button>
                      )}
                    </div>
                  )}
                  {message.isUser ? (
                    <p className='leading-relaxed whitespace-pre-wrap'>{message.text}</p>
                  ) : (
                    <div className='flex flex-col gap-2'>
                      <ChatMarkdown
                        allowedHrefs={
                          message.citations?.map((citation) => citation.href) ??
                          (isLoading && message.id === messages.at(-1)?.id ? [] : undefined)
                        }
                      >
                        {message.text.replace(/\[\[[A-Z_]+(?::[^\]]+)?\]\]/g, '').trim()}
                      </ChatMarkdown>
                      {message.isError && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => void retry_message(message.id)}
                          disabled={isLoading || !canUseChat}
                          className='mt-1 flex w-fit items-center gap-2 rounded-full px-4 text-xs'
                        >
                          <RefreshCw className='h-3 w-3' />
                          {t('mascot.aiChat.retry')}
                        </Button>
                      )}
                    </div>
                  )}

                  {!message.isUser &&
                    !message.isError &&
                    !message.cancelled &&
                    (messageActions[message.id]?.length ?? 0) > 0 && (
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {messageActions[message.id]?.map((action, index) => {
                          if (action.type === 'navigate' && is_safe_internal_path(action.href)) {
                            return (
                              <Button
                                key={index}
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  navigationPlay()
                                  router.push(action.href)
                                }}
                              >
                                {t('mascot.aiChat.citations.actions.open')}: {action.title}
                              </Button>
                            )
                          }
                          if (action.type === 'search') {
                            return (
                              <Button
                                key={index}
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  dispatchEvent(
                                    new CustomEvent('mascot-open-search', {
                                      detail: { query: action.query }
                                    })
                                  )
                                  clickPlay()
                                }}
                              >
                                {t('mascot.aiChat.openSearch')}: {action.query}
                              </Button>
                            )
                          }
                          return null
                        })}
                      </div>
                    )}
                  {!message.isUser && !message.isError && (message.citations?.length ?? 0) > 0 ? (
                    <details className='mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-2'>
                      <summary className='text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium'>
                        {t('mascot.aiChat.citations.title')} ({message.citations?.length})
                      </summary>
                      <div className='space-y-2'>
                        {message.citations
                          ?.filter((c) => is_safe_internal_path(c.href))
                          .map((c) => (
                            <Card
                              key={c.id}
                              className='bg-background/40 border-border/40 p-3 shadow-none'
                            >
                              <div className='flex items-start justify-between gap-3'>
                                <div className='min-w-0'>
                                  <div className='mb-1 flex items-center gap-2'>
                                    <Badge
                                      variant={get_citation_badge_variant(c.type)}
                                      className='h-5 px-2 text-[10px]'
                                    >
                                      {t(`mascot.aiChat.citations.types.${c.type}` as any)}
                                    </Badge>
                                  </div>
                                  <a
                                    href={c.href}
                                    className='text-foreground block text-sm font-medium hover:underline'
                                  >
                                    {c.title}
                                  </a>
                                  {c.excerpt ? (
                                    <div className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                                      {c.excerpt}
                                    </div>
                                  ) : null}

                                  <div className='mt-2 flex flex-wrap items-center gap-2'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <a
                                          href={c.href}
                                          aria-label={t('mascot.aiChat.citations.actions.open')}
                                          className={cn(
                                            buttonVariants({ variant: 'outline', size: 'sm' }),
                                            'h-8 w-8 justify-center px-0 text-xs sm:w-auto sm:px-2'
                                          )}
                                        >
                                          <ExternalLink className='h-3.5 w-3.5 sm:mr-1' />
                                          <span className='hidden sm:inline'>
                                            {t('mascot.aiChat.citations.actions.open')}
                                          </span>
                                        </a>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {t('mascot.aiChat.citations.actions.open')}
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          className='h-8 w-8 justify-center px-0 text-xs sm:w-auto sm:px-2'
                                          onClick={() => void copyLink(c.href)}
                                          aria-label={t('mascot.aiChat.citations.actions.copyLink')}
                                        >
                                          <Copy className='h-3.5 w-3.5 sm:mr-1' />
                                          <span className='hidden sm:inline'>
                                            {t('mascot.aiChat.citations.actions.copyLink')}
                                          </span>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {t('mascot.aiChat.citations.actions.copyLink')}
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          className='h-8 w-8 justify-center px-0 text-xs sm:w-auto sm:px-2'
                                          disabled={isLoading}
                                          onClick={() =>
                                            void more_like_this({ title: c.title, type: c.type })
                                          }
                                          aria-label={t(
                                            'mascot.aiChat.citations.actions.moreLikeThis'
                                          )}
                                        >
                                          <Sparkles className='h-3.5 w-3.5 sm:mr-1' />
                                          <span className='hidden sm:inline'>
                                            {t('mascot.aiChat.citations.actions.moreLikeThis')}
                                          </span>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {t('mascot.aiChat.citations.actions.moreLikeThis')}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </details>
                  ) : null}
                  {!message.isUser &&
                    !message.isError &&
                    !message.cancelled &&
                    message.requestId &&
                    (!isLoading || message.id !== messages.at(-1)?.id) && (
                      <div className='mt-2 flex items-center justify-between'>
                        <div className='flex items-center gap-1'>
                          <button
                            type='button'
                            onClick={() => handleReaction(message.id, 'like')}
                            aria-label={t('mascot.aiChat.feedback.like')}
                            disabled={feedbackIsSubmittingByMessageId[message.id] === true}
                            className={`hover:bg-bg-hover flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
                              message.reactions?.userReaction === 'like'
                                ? 'text-status-success bg-status-success-soft'
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
                            className={`hover:bg-bg-hover flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
                              message.reactions?.userReaction === 'dislike'
                                ? 'text-status-danger bg-status-danger-soft'
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
                    <div className='mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-2'>
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
                        className='placeholder:text-muted-foreground/60 w-full resize-none rounded-lg border border-[var(--border-subtle)] bg-[var(--yu-bg-input)] px-3 py-2 text-xs transition-all duration-200 focus:border-[var(--action-primary-border)] focus:ring-2 focus:ring-[var(--action-primary-border)] focus:outline-none'
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
                          className='bg-action-primary text-text-inverse hover:bg-action-primary-hover rounded px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60'
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

          {isLoading && (messages.at(-1)?.isUser || !messages.at(-1)?.text) && (
            <div className='motion-safe:animate-in motion-safe:slide-in-from-bottom-2 flex justify-start duration-300'>
              <div className='text-foreground bg-bg-surface flex flex-col items-start gap-2 rounded-lg rounded-bl-md border border-[var(--border-subtle)] p-3'>
                <div className='mb-2 flex w-full items-center gap-2 border-b border-[var(--border-subtle)] pb-2'>
                  <Avatar className='h-5 w-5'>
                    <AvatarImage src={mascot_avatar_src} alt='Nery' />
                    <AvatarFallback className='text-status-agent bg-status-agent-soft text-[10px] font-medium'>
                      N
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-muted-foreground text-xs font-medium'>Nery</span>
                </div>
                <div className='flex items-center gap-2'>
                  <DotMatrixLoader agent label={t(`mascot.aiChat.status.${phase}`)} />
                  <span className='yu-shimmer-agent text-xs'>
                    {t(`mascot.aiChat.status.${phase}`)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className='bg-bg-surface shrink-0 border-t px-4 py-4'>
          {shouldShowQuickPrompts && (
            <div className='mb-3 max-h-[min(96px,20dvh)] space-y-2 overflow-y-auto overscroll-contain'>
              <div className='text-muted-foreground/80 flex items-center gap-1.5 text-xs font-medium'>
                <Sparkles className='h-3.5 w-3.5' />
                {t('mascot.aiChat.quickPrompts.title')}
              </div>
              <div className='flex flex-wrap gap-2'>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    type='button'
                    onClick={() => void send_chat_message(prompt.prompt)}
                    className='bg-bg-elevated hover:bg-bg-hover text-text-primary rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none'
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isTurnstileEnabled && (
            <div className='mb-3' aria-hidden='true'>
              <Turnstile
                ref={turnstileRef}
                siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''}
                onSuccess={(token: string) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null)
                  turnstileRef.current?.reset()
                }}
                onExpire={() => setTurnstileToken(null)}
                options={{
                  theme: 'auto',
                  size: 'invisible'
                }}
              />
            </div>
          )}
          {editingMessageId && (
            <div className='text-muted-foreground mb-2 flex items-center justify-between text-xs'>
              <span>{t('mascot.aiChat.editMessage')}</span>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => {
                  setEditingMessageId(null)
                  setInputValue('')
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          )}
          <NeryChatComposer
            inputRef={inputRef}
            value={inputValue}
            onChange={setInputValue}
            onSend={() => void sendMessage()}
            onCancel={cancelCurrentResponse}
            loading={isLoading}
            cancelling={isCancelling}
            disabled={!canUseChat}
            placeholder={t('mascot.aiChat.placeholder')}
            label={sendButtonLabel}
          />
          <div className='mt-3 flex items-center justify-between'>
            <p className='text-muted-foreground/80 text-xs'>{t('mascot.aiChat.footer')}</p>
            <div role='status' className='text-muted-foreground/60 flex items-center gap-1 text-xs'>
              <div className={cn('h-2 w-2 rounded-full', statusDotClassName)}></div>
              <span>{t(`mascot.aiChat.status.${chatStatusKey}` as any)}</span>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={renameValue !== null}
        onOpenChange={(open) => {
          if (!open) setRenameValue(null)
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('mascot.aiChat.renamePrompt')}</DialogTitle>
            <DialogDescription>{t('mascot.aiChat.renamePrompt')}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              saveChatName()
            }}
          >
            <input
              aria-label={t('mascot.aiChat.renamePrompt')}
              value={renameValue ?? ''}
              maxLength={120}
              onChange={(event) => setRenameValue(event.target.value)}
              className='bg-bg-surface w-full rounded-lg border px-3 py-2'
            />
            <DialogFooter className='mt-4'>
              <Button type='button' variant='outline' onClick={() => setRenameValue(null)}>
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={!renameValue?.trim()}>
                {t('mascot.aiChat.rename')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('mascot.aiChat.deleteChat')}
        description={t('mascot.aiChat.deleteConfirm')}
        confirmText={t('common.delete') ?? 'Delete'}
        cancelText={t('common.cancel') ?? 'Cancel'}
        variant='destructive'
        onConfirm={confirmDeleteChat}
      />
    </TooltipProvider>
  )
}
