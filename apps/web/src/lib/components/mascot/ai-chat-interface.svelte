<script lang="ts">
	import { is_safe_internal_path } from './ai-chat-navigate-allowlist'
	import { tick } from 'svelte'
	import { goto } from '$app/navigation'
	import { cn } from '@isyuricunha/utils'
	import { marked } from 'marked'
	import MascotIcon from './mascot-icon.svelte'
	import SimpleIcon from '../simple-icon.svelte'
	import Turnstile from '../turnstile.svelte'
	import { toasts, toastSuccess, toastError } from '#lib/toasts.svelte'
	import {
		type ChatConversation,
		type ChatMessage,
		createEmptyConversation,
		decodeConversationShare,
		encodeConversationShare,
		loadYueChatState,
		saveYueChatState
	} from '#lib/utils/yue-chat-storage'
	import { SoundManager } from '#lib/sound-manager'
	import { type MascotStateController } from './mascot-state.svelte'

	let {
		isOpen,
		onClose,
		mascot,
		currentPage = '',
		pagePath = '',
		onMessageSent,
		onThinkingChange
	}: {
		isOpen: boolean
		onClose: () => void
		mascot: MascotStateController
		currentPage?: string
		pagePath?: string
		onMessageSent?: (message: string) => void
		onThinkingChange?: (isThinking: boolean) => void
	} = $props()

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

	const t = $derived(mascot.t)
	const locale = $derived(mascot.locale)
	const welcomeMessageText = $derived(t('mascot.aiChat.welcomeMessage'))

	let conversations = $state<ChatConversation[]>([])
	let activeConversationId = $state('')
	let importStatus = $state<'none' | 'success' | 'failed'>('none')
	let importStatusToastShown = false
	let messageIdCounter = 0
	let inputValue = $state('')
	let isLoading = $state(false)
	let isCancelling = $state(false)
	let connectionStatus = $state<ChatConnectionStatus>('checking')
	let turnstileToken = $state<string | null>(null)
	let isTurnstileEnabled = $state(
    import.meta.env.PUBLIC_FLAG_TURNSTILE === 'true' && import.meta.env.PUBLIC_TURNSTILE_SITE_KEY !== ''
  )
	let feedbackOpenForMessageId = $state<string | null>(null)
	let feedbackDraftByMessageId = $state<Record<string, string>>({})
	let feedbackIsSubmittingByMessageId = $state<Record<string, boolean>>({})
	let isDeleteDialogOpen = $state(false)
	let menuOpen = $state(false)
	let messagesEnd: HTMLDivElement | undefined = $state()
	let inputEl: HTMLInputElement | undefined = $state()
	let turnstileTokenCb: ((token: string) => void) | null = null
	let actionTimeouts = new Set<ReturnType<typeof setTimeout>>()
	let abortController: AbortController | null = null
	let mountedOnce = false

	const navigationSound = new SoundManager('navigation', true)
	const clickSound = new SoundManager('click', true)

	const scheduleActionTimeout = (callback: () => void, delay: number) => {
		const timer = setTimeout(() => {
			actionTimeouts.delete(timer)
			callback()
		}, delay)
		actionTimeouts.add(timer)
	}

	const activeConversation = $derived(
		conversations.find((c) => c.id === activeConversationId) ?? null
	)
	const messages = $derived(activeConversation?.messages ?? [])

	const chatStatusKey = $derived(isLoading ? 'responding' : connectionStatus)
	const canUseChat = $derived(connectionStatus !== 'unavailable' && connectionStatus !== 'offline')
	const shouldShowQuickPrompts = $derived(
		canUseChat && !isLoading && messages.every((message: ChatMessage) => !message.isUser)
	)
	const quickPrompts = $derived(
		get_quick_prompt_ids(currentPage).map((id) => ({
			id,
			label: t(`mascot.aiChat.quickPrompts.items.${id}.label`),
			prompt: t(`mascot.aiChat.quickPrompts.items.${id}.prompt`)
		}))
	)
	const statusDotClassName = $derived(
		chatStatusKey === 'ready'
			? 'bg-status-success'
			: chatStatusKey === 'responding' || chatStatusKey === 'checking'
				? 'bg-status-warning'
				: 'bg-status-danger'
	)

	const get_bubble_class_name = (message: ChatMessage) => {
		if (message.isUser) {
			return 'text-status-info rounded-br-md border border-[var(--status-info-border)] bg-status-info-soft'
		}
		if (message.isError) {
			return 'text-status-danger border-[var(--status-danger-border)] rounded-bl-md border bg-status-danger-soft'
		}
		return 'text-foreground border-[var(--border-subtle)] rounded-bl-md border bg-bg-surface'
	}

	const renderMarkdown = (text: string) => {
		const html = marked.parse(text, { async: false, gfm: true, breaks: true })
		return typeof html === 'string' ? html : ''
	}

	// Auto-scroll to bottom when new messages arrive
	$effect(() => {
		void messages
		if (messagesEnd && typeof messagesEnd.scrollIntoView === 'function') {
			messagesEnd.scrollIntoView({ behavior: 'smooth' })
		}
	})

	// Focus input when opened
	$effect(() => {
		if (!isOpen) return
		const timer = setTimeout(() => inputEl?.focus(), 100)
		return () => clearTimeout(timer)
	})

	// Notify the user when a shared conversation was imported from the URL.
	$effect(() => {
		if (!isOpen) return
		if (importStatus === 'none') return
		if (importStatusToastShown) return

		importStatusToastShown = true

		if (importStatus === 'success') {
			toastSuccess(t('mascot.aiChat.imported'))
		} else {
			toastError(t('mascot.aiChat.importFailed'))
		}
	})

	// Persist the conversation list while the chat is open.
	$effect(() => {
		if (!isOpen) return
		if (!activeConversationId) return

		saveYueChatState({ conversations, activeConversationId, provider: 'auto' })
	})

	// Report thinking state to parent
	$effect(() => {
		onThinkingChange?.(isLoading)
	})

	function getWelcomeMessage(): ChatMessage {
		return createWelcomeMessage(welcomeMessageText)
	}

	function updateConversationById(
		conversationId: string,
		updater: (conversation: ChatConversation) => ChatConversation
	) {
		conversations = conversations.map((c) => (c.id === conversationId ? updater(c) : c))
	}

	function updateActiveConversation(updater: (conversation: ChatConversation) => ChatConversation) {
		if (!activeConversation) return
		updateConversationById(activeConversation.id, updater)
	}

	async function refreshChatStatus() {
		if (is_browser_offline()) {
			connectionStatus = 'offline'
			return
		}

		connectionStatus = 'checking'

		try {
			const response = await fetch('/api/ai/chat/status', {
				cache: 'no-store'
			})

			if (!response.ok) {
				connectionStatus = 'unavailable'
				return
			}

			const data = (await response.json()) as { available?: boolean }
			connectionStatus = data.available === true ? 'ready' : 'unavailable'
		} catch {
			connectionStatus = is_browser_offline() ? 'offline' : 'unavailable'
		}
	}

	// Open/close lifecycle: status check, storage load, online listeners.
	$effect(() => {
		if (!isOpen) return

		const handleOnline = () => void refreshChatStatus()
		const handleOffline = () => {
			connectionStatus = 'offline'
		}

		addEventListener('online', handleOnline)
		addEventListener('offline', handleOffline)

		const timer = setTimeout(() => void refreshChatStatus(), 0)

		return () => {
			removeEventListener('online', handleOnline)
			removeEventListener('offline', handleOffline)
			clearTimeout(timer)
			for (const timerId of actionTimeouts) clearTimeout(timerId)
			actionTimeouts.clear()
			abortController?.abort()
			abortController = null
		}
	})

	// One-time initialization: load saved conversations and shared imports.
	$effect(() => {
		if (!isOpen || mountedOnce) return
		mountedOnce = true

		const loaded = loadYueChatState()
		let nextConversations = loaded.conversations
		let nextActiveId = loaded.activeConversationId
		let nextImportStatus: 'none' | 'success' | 'failed' = 'none'

		const params = new URLSearchParams(location.search)
		const shared = params.get('yue_chat')

		if (shared) {
			const decoded = decodeConversationShare(shared)

			if (decoded) {
				const imported: ChatConversation = {
					...decoded,
					id: createBrowserId(),
					title: decoded.title || t('mascot.aiChat.importedTitle'),
					updatedAt: new Date().toISOString()
				}

				nextConversations = [imported, ...nextConversations].slice(0, 50)
				nextActiveId = imported.id
				nextImportStatus = 'success'

				params.delete('yue_chat')
				const url = `${location.pathname}${params.size > 0 ? `?${params.toString()}` : ''}`
				history.replaceState(null, '', url)
			} else {
				nextImportStatus = 'failed'
			}
		}

		nextConversations = nextConversations.map((conversation) => {
			if (conversation.id !== nextActiveId) return conversation
			if (conversation.messages.length > 0) return conversation

			return {
				...conversation,
				messages: [createWelcomeMessage(welcomeMessageText)],
				updatedAt: new Date().toISOString()
			}
		})

		conversations = nextConversations
		activeConversationId = nextActiveId
		importStatus = nextImportStatus
	})

	function cancelCurrentResponse() {
		if (!abortController || abortController.signal.aborted) return

		isCancelling = true
		abortController.abort()
	}

	function appendCancelledResponse(conversationId: string, assistantMessageId: string | null) {
		const cancelledText = t('mascot.aiChat.cancelledMessage')

		updateConversationById(conversationId, (conversation) => {
			const existingAssistantMessage =
				assistantMessageId && conversation.messages.some((message) => message.id === assistantMessageId)

			if (existingAssistantMessage && assistantMessageId) {
				return {
					...conversation,
					messages: conversation.messages.map((message) => {
						if (message.id !== assistantMessageId) return message

						const text = message.text.trim()
						return {
							...message,
							text: text ? `${text}\n\n${cancelledText}` : cancelledText,
							isError: false
						}
					}),
					updatedAt: new Date().toISOString()
				}
			}

			const cancelledMessage: ChatMessage = {
				id: `ai-cancelled-${messageIdCounter++}-${Date.now()}`,
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
	}

	function startNewChat() {
		const created = createEmptyConversation(t('mascot.aiChat.newChatTitle'))
		const withWelcome: ChatConversation = {
			...created,
			messages: [getWelcomeMessage()],
			updatedAt: new Date().toISOString()
		}

		conversations = [withWelcome, ...conversations].slice(0, 50)
		activeConversationId = withWelcome.id
	}

	function renameChat() {
		if (!activeConversation) return
		const next = prompt(t('mascot.aiChat.renamePrompt'), activeConversation.title)
		if (!next?.trim()) return

		const title = next.trim().slice(0, 120)
		updateActiveConversation((c) => ({ ...c, title, updatedAt: new Date().toISOString() }))
	}

	function confirmDeleteChat() {
		if (!activeConversation) return
		isDeleteDialogOpen = false
		const remaining = conversations.filter((c) => c.id !== activeConversation.id)
		if (remaining.length > 0) {
			conversations = remaining
			activeConversationId = remaining[0]?.id ?? ''
			return
		}

		const created = createEmptyConversation(t('mascot.aiChat.newChatTitle'))
		const withWelcome: ChatConversation = {
			...created,
			messages: [getWelcomeMessage()],
			updatedAt: new Date().toISOString()
		}
		conversations = [withWelcome]
		activeConversationId = withWelcome.id
	}

	async function shareChat() {
		if (!activeConversation) return
		if (globalThis.window === undefined) return

		const payload = encodeConversationShare({
			...activeConversation,
			messages: activeConversation.messages.slice(-50)
		})

		const url = new URL(location.href)
		url.searchParams.set('yue_chat', payload)

		try {
			await navigator.clipboard.writeText(url.href)
			toastSuccess(t('mascot.aiChat.shareCopied'))
		} catch {
			toastError(t('mascot.aiChat.shareCopyFailed'))
		}
	}

	async function handleAutonomousActions(text: string) {
		// 1. Navigation
		const navMatch = /\[\[NAVIGATE:([^\]]+)\]\]/.exec(text)
		if (navMatch?.[1]) {
			const targetPath = navMatch[1].trim()
			if (is_safe_internal_path(targetPath)) {
				scheduleActionTimeout(() => {
					void navigationSound.play()
					void goto(targetPath)
				}, 1500)
			}
		}

		// 2. Site Search
		const searchMatch = /\[\[SEARCH:([^\]]+)\]\]/.exec(text)
		if (searchMatch?.[1]) {
			const query = searchMatch[1].trim()
			scheduleActionTimeout(() => {
				const event = new CustomEvent('yue-open-search', { detail: { query } })
				dispatchEvent(event)
				void clickSound.play()
			}, 800)
		}

		// 3. Scroll to Top
		if (text.includes('[[SCROLL_TO_TOP]]')) {
			scheduleActionTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' })
				void clickSound.play()
			}, 800)
		}
	}

	async function sendMessage() {
		const messageText = inputValue.trim()
		if (!messageText || isLoading || !canUseChat) return
		if (!activeConversation) return

		inputValue = ''
		const accepted = await send_chat_message(messageText)
		// Restore the draft when the send was rejected (e.g. turnstile still
		// arming) so the user's text is never swallowed.
		if (!accepted) {
			inputValue = messageText
		}
	}

	async function send_chat_message(rawText: string): Promise<boolean> {
		if (isLoading || !canUseChat) return false
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
							id: `turnstile-pending-${messageIdCounter++}-${Date.now()}`,
							text:
								// The catalog key is optional; fall back to English copy.
								t('mascot.aiChat.turnstilePending') ||
								'Security verification pending - please retry in a moment.',
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

		const userMessage: ChatMessage = {
			id: `user-${messageIdCounter++}-${Date.now()}`,
			text: messageText,
			isUser: true,
			timestamp: new Date().toISOString(),
			type: 'text'
		}

		const nextMessages = [...activeConversation.messages, userMessage]

		updateConversationById(conversationId, (c) => ({
			...c,
			messages: nextMessages,
			updatedAt: new Date().toISOString()
		}))
		isLoading = true
		isCancelling = false
		onMessageSent?.(messageText)

		const controller = new AbortController()
		abortController = controller
		let assistantMessageId: string | null = null

		try {
			// Enhanced context with more conversation history for better memory.
			// The welcome bubble is UI chrome, not assistant speech: excluding it
			// stops the model from echoing it verbatim ("who are you" -> welcome
			// text) and keeps real turns only.
			const conversationMessages = nextMessages.filter((message) => message.id !== 'welcome')
			const recentMessages = conversationMessages.slice(-15).map((message) => ({
				role: message.isUser ? ('user' as const) : ('assistant' as const),
				content: message.text,
				timestamp: message.timestamp,
				reactions: message.reactions
			}))

			const should_stream = (() => {
				const lower = messageText.toLowerCase()
				return !(
					lower.includes('blog') ||
					lower.includes('post') ||
					lower.includes('postagem') ||
					lower.includes('recomenda') ||
					lower.includes('sugere') ||
					lower.includes('link') ||
					lower.includes('url') ||
					lower.includes('direciona') ||
					lower.includes('onde ') ||
					lower.includes('where ')
				)
			})()

			const response = await fetch('/api/ai/chat', {
				method: 'POST',
				signal: controller.signal,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: messageText,
					stream: should_stream,
					locale,
					...(isTurnstileEnabled && { turnstileToken }),
					context: {
						currentPage,
						pagePath,
						previousMessages: conversationMessages.slice(-8).map((m) => m.text),
						conversation: recentMessages,
						conversationLength: nextMessages.length,
						userPreferences: {
							hasReactedToMessages: nextMessages.some((m) => m.reactions?.userReaction)
						}
					}
				})
			})

			const contentType = response.headers.get('content-type') || ''

			// Streaming path
			if (contentType.startsWith('text/plain') && response.body) {
				const reader = response.body.getReader()
				const decoder = new TextDecoder()
				const messageId = `ai-${messageIdCounter++}-${Date.now()}`
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
							type: 'text'
						}
					],
					updatedAt: new Date().toISOString()
				}))

				while (true) {
					const { value, done } = await reader.read()
					if (done) break
					accumulated += decoder.decode(value, { stream: true })
					updateConversationById(conversationId, (c) => ({
						...c,
						messages: c.messages.map((m) => (m.id === messageId ? { ...m, text: accumulated } : m))
					}))
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

				if (accumulated) {
					await handleAutonomousActions(accumulated)
				}

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

			if (!response.ok) {
				throw new Error(data.error ?? 'Failed to get response')
			}

			const safeTimestamp = data.timestamp ?? new Date().toISOString()

			const aiMessage: ChatMessage = {
				id: `ai-${messageIdCounter++}-${Date.now()}`,
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

			if (data.message) {
				await handleAutonomousActions(data.message)
			}

			return true
		} catch (error) {
			if (is_abort_error(error)) {
				appendCancelledResponse(conversationId, assistantMessageId)
				return true
			}

			if (process.env.NODE_ENV === 'development') {
				console.error('Chat error:', error)
			}

			const errorMessage: ChatMessage = {
				id: `ai-error-${messageIdCounter++}-${Date.now()}`,
				text: t('mascot.aiChat.errorMessage'),
				isUser: false,
				timestamp: new Date().toISOString(),
				isError: true,
				type: 'text'
			}

			updateConversationById(conversationId, (c) => ({
				...c,
				messages: [...c.messages, errorMessage],
				updatedAt: new Date().toISOString()
			}))
			return true
		} finally {
			if (abortController === controller) {
				abortController = null
			}
			// Consume the turnstile token per request: reset the widget so the
			// next message carries a fresh token.
			if (isTurnstileEnabled) {
				turnstileTokenCb = null
				turnstileToken = null
			}
			isCancelling = false
			isLoading = false
		}
	}

	// Handle pending prompts (like "Explain this selection").
	// The pending value is only consumed when the message was actually
	// accepted: a turnstile-unarmed rejection leaves it in sessionStorage so
	// the effect retries once the widget produces a token.
	$effect(() => {
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
	})

	async function copyLink(href: string) {
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
			toastSuccess(t('mascot.aiChat.citations.linkCopied'))
		} catch {
			toastError(t('mascot.aiChat.citations.linkCopyFailed'))
		}
	}

	async function more_like_this(citation: { title: string; type: CitationType }) {
		const prompt = t('mascot.aiChat.citations.moreLikeThisPrompt', {
			title: citation.title,
			type: t(`mascot.aiChat.citations.types.${citation.type}`)
		})

		await send_chat_message(prompt)
	}

	function handleKeyDown(event: KeyboardEvent) {
		const target = event.currentTarget as HTMLInputElement
		if (event.key !== 'Enter' || event.shiftKey) return
		event.preventDefault()
		if (target.value.trim() && !isLoading && canUseChat) void sendMessage()
	}

	const sendButtonLabel = $derived(t(isLoading ? 'mascot.aiChat.cancelResponse' : 'mascot.aiChat.sendMessage'))

	async function retry_message(messageId: string) {
		const conversation = conversations.find((c) => c.id === activeConversationId)
		if (!conversation) return

		const messageIndex = conversation.messages.findIndex((m) => m.id === messageId)
		if (messageIndex === -1) return

		// Find the last user message before this error
		const lastUserMessage = conversation.messages.slice(0, messageIndex).findLast((m) => m.isUser)

		if (!lastUserMessage) return

		// Remove the error message and any trailing messages
		updateActiveConversation((c) => ({
			...c,
			messages: c.messages.slice(0, messageIndex),
			updatedAt: new Date().toISOString()
		}))

		// Re-send the user message
		await send_chat_message(lastUserMessage.text)
	}

	function clearChat() {
		updateActiveConversation((c) => ({
			...c,
			messages: [getWelcomeMessage()],
			updatedAt: new Date().toISOString()
		}))
	}

	async function submit_feedback(input: {
		requestId: string
		messageId: string
		rating: 'like' | 'dislike'
		comment?: string
	}) {
		feedbackIsSubmittingByMessageId = { ...feedbackIsSubmittingByMessageId, [input.messageId]: true }
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

			toastSuccess(t('mascot.aiChat.feedback.sent'))
		} catch {
			toastError(t('mascot.aiChat.feedback.error'))
		} finally {
			feedbackIsSubmittingByMessageId = { ...feedbackIsSubmittingByMessageId, [input.messageId]: false }
		}
	}

	function handleReaction(messageId: string, reaction: 'like' | 'dislike') {
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
			messages: c.messages.map((msg) => {
				if (msg.id !== messageId || msg.isUser) return msg

				const msgReaction = msg.reactions?.userReaction
				let newLikes = msg.reactions?.likes ?? 0
				let newDislikes = msg.reactions?.dislikes ?? 0
				let newUserReaction: 'like' | 'dislike' | null = reaction

				// If clicking the same reaction, remove it
				if (msgReaction === reaction) {
					newUserReaction = null
					if (reaction === 'like') newLikes--
					else newDislikes--
				} else {
					// If switching reactions, remove old and add new
					if (msgReaction === 'like') newLikes--
					else if (msgReaction === 'dislike') newDislikes--

					if (reaction === 'like') newLikes++
					else newDislikes++
				}

				return {
					...msg,
					reactions: {
						likes: Math.max(0, newLikes),
						dislikes: Math.max(0, newDislikes),
						userReaction: newUserReaction
					}
				}
			})
		}))

		if (!nextUserReaction) {
			if (feedbackOpenForMessageId === messageId) feedbackOpenForMessageId = null
			return
		}

		if (nextUserReaction === 'dislike') {
			feedbackOpenForMessageId = messageId
			return
		}

		if (feedbackOpenForMessageId === messageId) feedbackOpenForMessageId = null
		void submit_feedback({
			requestId: message.requestId,
			messageId,
			rating: nextUserReaction
		})
	}

	async function copyMessage(text: string) {
		try {
			await navigator.clipboard.writeText(text)
			toastSuccess(t('mascot.aiChat.messageCopied'))
		} catch {
			toastError(t('mascot.aiChat.messageCopyFailed'))
		}
	}

	const user_display_name = $derived(locale.startsWith('pt') ? 'Eu' : 'Me')
	const yue_avatar_src = '/images/mascote-3.png'

	async function afterTurnstileSuccess(token: string) {
		turnstileToken = token
		await tick()
	}

	function handleTurnstileError() {
		turnstileToken = null
	}

	function handleTurnstileExpire() {
		turnstileToken = null
	}
</script>

{#if isOpen}
	<div class="bg-bg-elevated shadow-feature-card absolute right-0 bottom-full mb-2 flex h-[70vh] max-h-[720px] min-h-[460px] w-[420px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)]">
		<!-- Header -->
		<div class="bg-bg-surface flex items-center justify-between gap-3 border-b px-4 py-3">
			<div class="flex min-w-0 items-center gap-2">
				<div class="bg-status-agent-soft text-status-agent rounded-lg p-1.5">
					<MascotIcon name="message_circle" size={16} />
				</div>
				<div class="flex flex-col">
					<span class="text-sm leading-none font-semibold">{t('mascot.aiChat.title')}</span>
					<div class="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
						<select
							bind:value={activeConversationId}
							aria-label={t('mascot.aiChat.conversations')}
							class="bg-background/30 hover:bg-background/40 focus:ring-2 focus:ring-[var(--action-primary-border)] focus:outline-none h-7 max-w-[200px] rounded-full border border-[var(--border-subtle)] px-2.5 text-xs shadow-none"
						>
							{#each conversations as c (c.id)}
								<option value={c.id}>{c.title}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
			<div class="flex items-center gap-1">
				<button
					type="button"
					class="hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none size-8 rounded-md"
					onclick={startNewChat}
					aria-label={t('mascot.aiChat.newChat')}
					title={t('mascot.aiChat.newChat')}
				>
					<MascotIcon name="plus" size={16} class="mx-auto" />
				</button>

				<button
					type="button"
					class="hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none size-8 rounded-md"
					onclick={() => void shareChat()}
					aria-label={t('mascot.aiChat.share')}
					title={t('mascot.aiChat.share')}
				>
					<MascotIcon name="share" size={16} class="mx-auto" />
				</button>

				<div class="relative">
					<button
						type="button"
						class="hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none size-8 rounded-md"
						aria-label={t('mascot.aiChat.more')}
						title={t('mascot.aiChat.more')}
						onclick={() => (menuOpen = !menuOpen)}
					>
						<MascotIcon name="more_vertical" size={16} class="mx-auto" />
					</button>
					{#if menuOpen}
							<div class="bg-popover text-popover-foreground absolute right-0 z-50 mt-1 w-48 rounded-lg border p-1 shadow-lg" role="menu">
								<button type="button" class="hover:bg-bg-hover flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs" role="menuitem" onclick={() => { menuOpen = false; renameChat() }}>
									<MascotIcon name="pencil" size={16} />
									{t('mascot.aiChat.rename')}
								</button>
								{#if messages.length > 1}
									<button type="button" class="hover:bg-bg-hover flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs" role="menuitem" onclick={() => { menuOpen = false; clearChat() }}>
										<MascotIcon name="eraser" size={16} />
										{t('mascot.aiChat.clear')}
									</button>
								{/if}
								<div class="my-1 border-t border-[var(--border-subtle)]"></div>
								<button type="button" class="text-status-info focus:text-accent-cyan-hover hover:bg-bg-hover flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs" role="menuitem" onclick={() => { menuOpen = false; isDeleteDialogOpen = true }}>
									<MascotIcon name="trash" size={16} />
									{t('mascot.aiChat.deleteChat')}
								</button>
							</div>
					{/if}
				</div>

				<button
					type="button"
					class="hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none size-8 rounded-md"
					onclick={onClose}
					aria-label={t('mascot.aiChat.close')}
					title={t('mascot.aiChat.close')}
				>
					<MascotIcon name="x" size={16} class="mx-auto" />
				</button>
			</div>
		</div>

		<!-- Messages -->
		<div class="bg-bg-surface flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
			{#each messages as message (message.id)}
				<div class={cn('flex', message.isUser ? 'justify-end' : 'justify-start', 'animate-in slide-in-from-bottom-2 duration-300')}>
					<div class={cn('max-w-[90%] rounded-lg px-3.5 py-3 text-sm shadow-sm sm:max-w-[85%]', get_bubble_class_name(message))}>
						{#if message.isUser}
							<div class="mb-2 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
								<span class="text-status-info/80 text-xs font-medium">{user_display_name}</span>
							</div>
						{/if}
						{#if !message.isUser}
							<div class="mb-2 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
								<img src={yue_avatar_src} alt="Yue" width={24} height={24} class="h-6 w-6 rounded-full" />
								<span class="text-muted-foreground text-xs font-medium">Yue</span>
								{#if !message.isError}
									<button
										type="button"
										onclick={() => void copyMessage(message.text.replace(/\[\[[A-Z_]+(?::[^\]]+)?\]\]/g, '').trim())}
										class="text-muted-foreground hover:text-foreground ml-auto rounded p-1 transition-colors"
										aria-label={t('mascot.aiChat.copyMessage')}
									>
										<MascotIcon name="copy" size={14} />
									</button>
								{/if}
							</div>
						{/if}
						{#if message.isUser}
							<p class="leading-relaxed whitespace-pre-wrap">{message.text}</p>
						{:else}
							<div class="flex flex-col gap-2">
								<div class="prose prose-sm dark:prose-invert max-w-none whitespace-normal [&_ol]:my-2 [&_p]:m-0 [&_pre]:my-2 [&_ul]:my-2">
									{@html renderMarkdown(message.text.replace(/\[\[[A-Z_]+(?::[^\]]+)?\]\]/g, '').trim())}
								</div>
								{#if message.isError}
									<button
										type="button"
										onclick={() => void retry_message(message.id)}
										class="hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none mt-1 flex w-fit items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 py-1.5 text-xs transition-colors"
									>
										<MascotIcon name="refresh_cw" size={12} />
										{t('mascot.aiChat.retry')}
									</button>
								{/if}
							</div>
						{/if}

						{#if !message.isUser && !message.isError && (message.citations?.length ?? 0) > 0}
							<div class="mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-2">
								<div class="text-muted-foreground text-[11px] font-medium">
									{t('mascot.aiChat.citations.title')}
								</div>
								<div class="space-y-2">
									{#each message.citations ?? [] as c (c.id)}
										<div class="bg-background/40 border-border/40 p-3 shadow-none rounded-lg border">
											<div class="flex items-start justify-between gap-3">
												<div class="min-w-0">
													<div class="mb-1 flex items-center gap-2">
														<span class={cn('h-5 rounded px-2 py-0.5 text-[10px] border', get_citation_badge_variant(c.type) === 'default' ? 'bg-[var(--accent-dim)] border-[var(--accent-border)]' : 'border-[var(--border-subtle)]')}>
															{t(`mascot.aiChat.citations.types.${c.type}`)}
														</span>
													</div>
													<a href={c.href} class="text-foreground block text-sm font-medium hover:underline">
														{c.title}
													</a>
													{#if c.excerpt}
														<div class="text-muted-foreground mt-1 line-clamp-2 text-xs">{c.excerpt}</div>
													{/if}

													<div class="mt-2 flex flex-wrap items-center gap-2">
														<a
															href={c.href}
															aria-label={t('mascot.aiChat.citations.actions.open')}
															title={t('mascot.aiChat.citations.actions.open')}
															class={cn('hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none inline-flex h-8 items-center justify-center gap-1 rounded-md border border-[var(--border-subtle)] px-2 text-xs')}
														>
															<MascotIcon name="external_link" size={14} />
															<span class="hidden sm:inline">{t('mascot.aiChat.citations.actions.open')}</span>
														</a>

														<button
															type="button"
															class="hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none inline-flex h-8 items-center justify-center gap-1 rounded-md px-2 text-xs"
															onclick={() => void copyLink(c.href)}
															aria-label={t('mascot.aiChat.citations.actions.copyLink')}
															title={t('mascot.aiChat.citations.actions.copyLink')}
														>
															<MascotIcon name="copy" size={14} />
															<span class="hidden sm:inline">{t('mascot.aiChat.citations.actions.copyLink')}</span>
														</button>

														<button
															type="button"
															class="hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none inline-flex h-8 items-center justify-center gap-1 rounded-md px-2 text-xs"
															disabled={isLoading}
															onclick={() => void more_like_this({ title: c.title, type: c.type })}
															aria-label={t('mascot.aiChat.citations.actions.moreLikeThis')}
															title={t('mascot.aiChat.citations.actions.moreLikeThis')}
														>
															<MascotIcon name="sparkles" size={14} />
															<span class="hidden sm:inline">{t('mascot.aiChat.citations.actions.moreLikeThis')}</span>
														</button>
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
						{#if !message.isUser && !message.isError && message.requestId}
							<div class="mt-2 flex items-center justify-between">
								<div class="flex items-center gap-1">
									<button
										type="button"
										onclick={() => handleReaction(message.id, 'like')}
										aria-label={t('mascot.aiChat.feedback.like')}
										disabled={feedbackIsSubmittingByMessageId[message.id] === true}
										class={cn('hover:bg-bg-hover flex items-center gap-1 rounded px-2 py-1 text-xs transition-all', message.reactions?.userReaction === 'like' ? 'text-status-success bg-status-success-soft' : 'text-muted-foreground')}
									>
										<MascotIcon name="thumbs_up" size={12} />
										{message.reactions?.likes ?? 0}
									</button>
									<button
										type="button"
										onclick={() => handleReaction(message.id, 'dislike')}
										aria-label={t('mascot.aiChat.feedback.dislike')}
										disabled={feedbackIsSubmittingByMessageId[message.id] === true}
										class={cn('hover:bg-bg-hover flex items-center gap-1 rounded px-2 py-1 text-xs transition-all', message.reactions?.userReaction === 'dislike' ? 'text-status-danger bg-status-danger-soft' : 'text-muted-foreground')}
									>
										<MascotIcon name="thumbs_down" size={12} />
										{message.reactions?.dislikes ?? 0}
									</button>
								</div>
								<div class="text-muted-foreground/60 text-xs">
									{new Date(message.timestamp).toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</div>
							</div>
						{/if}
						{#if !message.isUser && !message.isError && message.requestId && feedbackOpenForMessageId === message.id && message.reactions?.userReaction === 'dislike'}
							<div class="mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-2">
								<textarea
									rows={2}
									bind:value={feedbackDraftByMessageId[message.id]}
									placeholder={t('mascot.aiChat.feedback.commentPlaceholder')}
									class="placeholder:text-muted-foreground/60 w-full resize-none rounded-lg border border-[var(--border-subtle)] bg-[var(--yu-bg-input)] px-3 py-2 text-xs transition-all duration-200 focus:border-[var(--action-primary-border)] focus:ring-2 focus:ring-[var(--action-primary-border)] focus:outline-none"
									disabled={feedbackIsSubmittingByMessageId[message.id] === true}
								></textarea>
								<div class="flex items-center justify-end gap-2">
									<button
										type="button"
										onclick={() => (feedbackOpenForMessageId = null)}
										class="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs transition-colors"
										disabled={feedbackIsSubmittingByMessageId[message.id] === true}
									>
										{t('mascot.aiChat.feedback.cancel')}
									</button>
									<button
										type="button"
										onclick={() => {
											const raw = feedbackDraftByMessageId[message.id]
											const comment = raw?.trim() ? raw.trim() : undefined

											void submit_feedback({
												requestId: message.requestId ?? '',
												messageId: message.id,
												rating: 'dislike',
												comment
											})

											feedbackOpenForMessageId = null
											feedbackDraftByMessageId = { ...feedbackDraftByMessageId, [message.id]: '' }
										}}
										class="bg-action-primary text-text-inverse hover:bg-action-primary-hover rounded px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60"
										disabled={feedbackIsSubmittingByMessageId[message.id] === true}
									>
										{#if feedbackIsSubmittingByMessageId[message.id] === true}
											<span class="flex items-center gap-2">
												<MascotIcon name="loader" size={12} class="animate-spin" />
												{t('mascot.aiChat.feedback.send')}
											</span>
										{:else}
											{t('mascot.aiChat.feedback.send')}
										{/if}
									</button>
								</div>
							</div>
						{/if}
						{#if !message.isUser && message.isError}
							<div class="text-muted-foreground/60 mt-2 text-right text-xs">
								{new Date(message.timestamp).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</div>
						{/if}
					</div>
				</div>
			{/each}

			{#if isLoading}
				<div class="animate-in slide-in-from-bottom-2 flex justify-start duration-300">
					<div class="text-foreground bg-bg-surface flex items-center gap-2 rounded-lg rounded-bl-md border border-[var(--border-subtle)] p-3">
						<div class="mb-2 flex w-full items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
							<img src={yue_avatar_src} alt="Yue" width={20} height={20} class="h-5 w-5 rounded-full" />
							<span class="text-muted-foreground text-xs font-medium">Yue</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="yu-shimmer-agent text-xs">{t('mascot.aiChat.thinking')}</span>
						</div>
					</div>
				</div>
			{/if}

			<div bind:this={messagesEnd}></div>
		</div>

		<!-- Input -->
		<div class="bg-bg-surface border-t px-4 py-4">
			{#if shouldShowQuickPrompts}
				<div class="mb-3 space-y-2">
					<div class="text-muted-foreground/80 flex items-center gap-1.5 text-xs font-medium">
						<MascotIcon name="sparkles" size={14} />
						{t('mascot.aiChat.quickPrompts.title')}
					</div>
					<div class="flex flex-wrap gap-2">
						{#each quickPrompts as prompt (prompt.id)}
							<button
								type="button"
								onclick={() => void send_chat_message(prompt.prompt)}
								class="bg-bg-elevated hover:bg-bg-hover text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:outline-none rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs transition-colors"
							>
								{prompt.label}
							</button>
						{/each}
					</div>
				</div>
			{/if}
			{#if isTurnstileEnabled}
				<div class="mb-3" aria-hidden="true">
					<Turnstile siteKey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY} onSuccess={afterTurnstileSuccess} onError={handleTurnstileError} onExpire={handleTurnstileExpire} />
				</div>
			{/if}
			<div class="flex gap-2">
				<input
					bind:this={inputEl}
					type="text"
					bind:value={inputValue}
					onkeydown={handleKeyDown}
					placeholder={t('mascot.aiChat.placeholder')}
					class="placeholder:text-muted-foreground/60 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--yu-bg-input)] px-4 py-3 text-sm transition-all duration-200 hover:bg-[var(--yu-bg-input-hover)] focus:border-[var(--action-primary-border)] focus:ring-2 focus:ring-[var(--action-primary-border)] focus:outline-none"
					disabled={isLoading || !canUseChat}
				/>
				<button
					type="button"
					onclick={isLoading ? cancelCurrentResponse : sendMessage}
					disabled={isLoading ? isCancelling : !inputValue.trim() || !canUseChat}
					aria-label={sendButtonLabel}
					title={sendButtonLabel}
					class={cn(
						'text-text-inverse rounded-lg px-4 py-3 shadow-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
						isLoading ? 'bg-status-danger hover:bg-status-danger/90' : 'bg-action-primary hover:bg-action-primary-hover'
					)}
				>
					{#if isLoading}
						<MascotIcon name="x" size={16} />
					{:else}
						<MascotIcon name="send" size={16} />
					{/if}
				</button>
			</div>
			<div class="mt-3 flex items-center justify-between">
				<p class="text-muted-foreground/80 text-xs">{t('mascot.aiChat.footer')}</p>
				<div class="text-muted-foreground/60 flex items-center gap-1 text-xs">
					<div class={cn('h-2 w-2 rounded-full', statusDotClassName)}></div>
					<span>{t(`mascot.aiChat.status.${chatStatusKey}`)}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Delete confirmation dialog -->
	{#if isDeleteDialogOpen}
		<div class="bg-bg-base/80 fixed inset-0 z-50 flex items-center justify-center">
			<div class="bg-popover text-popover-foreground w-80 max-w-[90vw] rounded-lg border p-6 shadow-lg" role="dialog" aria-modal="true">
				<h2 class="mb-2 text-base font-semibold">{t('mascot.aiChat.deleteChat')}</h2>
				<p class="text-muted-foreground mb-4 text-sm">{t('mascot.aiChat.deleteConfirm')}</p>
				<div class="flex items-center justify-end gap-2">
					<button type="button" class="hover:bg-bg-hover rounded px-3 py-1.5 text-sm transition-colors" onclick={() => (isDeleteDialogOpen = false)}>
						{t('common.cancel') || 'Cancel'}
					</button>
					<button type="button" class="bg-status-danger text-text-inverse hover:bg-status-danger/90 rounded px-3 py-1.5 text-sm transition-colors" onclick={confirmDeleteChat}>
						{t('common.delete') || 'Delete'}
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}
