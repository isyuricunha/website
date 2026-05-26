'use client'

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations, useMessages, useLocale } from '@isyuricunha/i18n/client'
import { useSound } from '@/hooks/use-sound'
import { getLocalizedPath } from '@/utils/get-localized-path'
import { canExplainSelectionOnPage, getMascotPageKey } from '../mascot-routing'

const STORAGE_KEY = 'vc_mascot_dismissed'
const HIDE_KEY = 'vc_mascot_hidden'
const PREFERENCES_KEY = 'vc_mascot_preferences'
const KONAMI_MODE_KEY = 'vc_mascot_konami_mode'
const BLOG_POST_VISITED_KEY = 'vc_mascot_blog_posts_visited'
const MASCOT_IMAGE_KEY = 'vc_mascot_current_image'
const LATEST_POST_CHECK_KEY = 'vc_mascot_latest_post_checked'

const DEFAULT_PREFERENCES: MascotPreferences = {
  animations: true,
  soundEffects: false,
  speechBubbles: true,
  messageDuration: 7000,
  bubblePosition: 'bottom-right'
}

export interface MascotPreferences {
  animations: boolean
  soundEffects: boolean
  speechBubbles: boolean
  messageDuration: number
  bubblePosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]

const createInitialState = () => ({
  isDismissed: false,
  isHiddenPref: false,
  isActive: false,
  isBlinking: false,
  showSettings: false,
  showGame: false,
  showMenu: false,
  showContact: false,
  showAIChat: false,
  isKonamiMode: false,
  konamiSequence: [] as number[],
  messageQueue: [] as Array<{ id: number; text: string; expiresAt: number }>,
  exitingIds: new Set<number>(),
  autoShowMessage: false,
  currentMascotImage: 0,
  isThinking: false,
  mousePosition: { x: 0, y: 0 },
  blogPostsVisited: new Set<string>(),
  clickCount: 0,
  lastClickTime: 0,
  isTickled: false,
  isDizzy: false,
  showSelectionBubble: false,
  selectedText: '',
  preferences: { ...DEFAULT_PREFERENCES }
})

type MascotState = ReturnType<typeof createInitialState>

export function useMascotState() {
  const t = useTranslations()
  const locale = useLocale()
  const allMessages = useMessages()
  const pathname = usePathname()
  const router = useRouter()

  const [state, setState] = useState(createInitialState)
  const [mounted, setMounted] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const isProduction = process.env.NODE_ENV === 'production'

  // Sound hooks
  const clickSound = useSound('click', state.preferences.soundEffects)
  const successSound = useSound('success', state.preferences.soundEffects)
  const notificationSound = useSound('notification', state.preferences.soundEffects)
  const alertSound = useSound('alert', state.preferences.soundEffects)

  // Refs
  const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetAutoShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduledTimeoutsRef = useRef(new Set<ReturnType<typeof setTimeout>>())
  const clickSoundRef = useRef(clickSound.play)
  const successSoundRef = useRef(successSound.play)
  const notificationSoundRef = useRef(notificationSound.play)

  // Keep sound refs updated
  useEffect(() => {
    clickSoundRef.current = clickSound.play
  }, [clickSound.play])

  useEffect(() => {
    successSoundRef.current = successSound.play
  }, [successSound.play])

  useEffect(() => {
    notificationSoundRef.current = notificationSound.play
  }, [notificationSound.play])

  /**
   * Safely update state with partial updates
   */
  const updateState = useCallback((updates: Partial<MascotState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      scheduledTimeoutsRef.current.delete(timer)
      callback()
    }, delay)

    scheduledTimeoutsRef.current.add(timer)
    return timer
  }, [])

  useEffect(() => {
    const scheduledTimeouts = scheduledTimeoutsRef.current

    return () => {
      for (const timer of scheduledTimeouts) {
        clearTimeout(timer)
      }
      scheduledTimeouts.clear()
    }
  }, [])

  /**
   * Mark message for exit animation and remove it afterwards
   */
  const startExit = useCallback(
    (id: number) => {
      setState((prev) => {
        const exitingIds = new Set(prev.exitingIds)
        exitingIds.add(id)

        return {
          ...prev,
          exitingIds
        }
      })

      scheduleTimeout(() => {
        setState((prev) => {
          const exitingIds = new Set(prev.exitingIds)
          exitingIds.delete(id)

          return {
            ...prev,
            messageQueue: prev.messageQueue.filter((item) => item.id !== id),
            exitingIds
          }
        })
      }, 200)
    },
    [scheduleTimeout]
  )

  /**
   * Add a new message to the display queue
   */
  const enqueueMessage = useCallback(
    (text: string, duration?: number) => {
      if (!text) return
      const d = duration ?? state.preferences.messageDuration
      const id = Date.now() + Math.floor(Math.random() * 1000)
      const expiresAt = Date.now() + d

      setState((prev) => ({
        ...prev,
        messageQueue: [...prev.messageQueue, { id, text, expiresAt }]
      }))

      scheduleTimeout(() => {
        startExit(id)
      }, d)
    },
    [scheduleTimeout, startExit, state.preferences.messageDuration]
  )

  /**
   * Update preferences and persist to localStorage
   */
  const updatePreferences = useCallback(
    (updates: Partial<MascotPreferences>) => {
      setState((prev) => {
        const newPrefs = { ...prev.preferences, ...updates }
        try {
          localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
        } catch (error) {
          if (!isProduction) console.error('Error saving preferences:', error)
        }
        return { ...prev, preferences: newPrefs }
      })
    },
    [isProduction]
  )

  /**
   * Load saved preferences from localStorage
   */
  const loadPreferences = useCallback((): MascotPreferences => {
    if (globalThis.window === undefined) return { ...DEFAULT_PREFERENCES }

    try {
      const saved = localStorage.getItem(PREFERENCES_KEY)
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) }
      }
    } catch (error) {
      if (!isProduction) console.error('Error loading preferences:', error)
    }
    return { ...DEFAULT_PREFERENCES }
  }, [isProduction])

  const pageKey = getMascotPageKey(pathname || '/')

  /**
   * Get time based greeting message
   */
  const getTimeBasedGreeting = useCallback(() => {
    if (!mounted) return ''
    const hour = new Date().getHours()
    if (hour < 12) return t('mascot.greetings.morning')
    if (hour < 17) return t('mascot.greetings.afternoon')
    if (hour < 21) return t('mascot.greetings.evening')
    return t('mascot.greetings.night')
  }, [mounted, t])

  /**
   * Generic helper to fetch numbered messages from i18n structure
   */
  const fetchMessageList = useCallback((base: Record<string, unknown>): string[] => {
    const res: string[] = []
    try {
      const keys = Object.keys(base)
        .filter((k) => /^\d+$/.test(k))
        .map(Number)
        .toSorted((a, b) => a - b)

      for (const idx of keys) {
        const v = base[String(idx)]
        if (typeof v === 'string' && v) res.push(v)
      }
    } catch {
      // ignore errors
    }
    return res
  }, [])

  /**
   * Fetch page specific messages with proper fallbacks
   */
  const fetchPageMessages = useCallback(
    (key: string): string[] => {
      const tryKey = (k: string): string[] => {
        const base = (allMessages?.mascot?.pageMessages?.[k] ?? {}) as Record<string, unknown>
        return fetchMessageList(base)
      }

      const isDetail = key.endsWith('Detail')
      const baseKey = isDetail ? key.replace(/Detail$/, '') : key

      if (isDetail) {
        const detailMessages = tryKey(key)
        if (detailMessages.length > 0) return detailMessages
      }

      const baseMessages = tryKey(baseKey)
      if (baseMessages.length > 0) return baseMessages

      if (baseKey !== 'home') {
        return tryKey('home')
      }

      return []
    },
    [allMessages, fetchMessageList]
  )

  /**
   * Get random idle message
   */
  const getIdleMessage = useCallback(() => {
    const base = (allMessages?.mascot?.messages ?? {}) as Record<string, unknown>
    const list = fetchMessageList(base)

    if (list.length === 0) return t('mascot.messages.0')
    return list[Math.floor(Math.random() * list.length)] ?? t('mascot.messages.0')
  }, [allMessages, fetchMessageList, t])

  /**
   * Get random blog post specific message
   */
  const getBlogPostMessage = useCallback(() => {
    const base = (allMessages?.mascot?.pageMessages?.blogPost ?? {}) as Record<string, unknown>
    const list = fetchMessageList(base)

    if (list.length === 0) return t('mascot.messages.0')
    return list[Math.floor(Math.random() * list.length)] ?? t('mascot.messages.0')
  }, [allMessages, fetchMessageList, t])

  /**
   * Copy contact email to clipboard
   */
  const copyEmail = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText('me@yuricunha.com')
      enqueueMessage(t('mascot.contact.copySuccess'), 2000)
      successSoundRef.current()
    } catch (error) {
      enqueueMessage(t('mascot.contact.copyError'), 3000)
      if (!isProduction) console.error('Failed to copy email:', error)
    }
  }, [enqueueMessage, isProduction, t])

  /**
   * Hide mascot for the current browser session
   */
  const handleDismissMascot = useCallback(() => {
    updateState({
      isDismissed: true,
      showContact: false,
      showSettings: false,
      showMenu: false,
      showGame: false,
      showAIChat: false,
      messageQueue: []
    })
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch (error) {
      if (!isProduction) console.error('Error dismissing mascot:', error)
    }
  }, [updateState, isProduction])

  /**
   * Hide mascot until the user restores it
   */
  const handleHideMascot = useCallback(() => {
    updateState({
      isHiddenPref: true,
      showContact: false,
      showSettings: false,
      showMenu: false,
      showGame: false,
      showAIChat: false,
      messageQueue: []
    })
    try {
      localStorage.setItem(HIDE_KEY, '1')
    } catch (error) {
      if (!isProduction) console.error('Error hiding mascot:', error)
    }
  }, [updateState, isProduction])

  /**
   * Restore mascot and clear persisted hidden/dismissed flags
   */
  const restoreMascot = useCallback(() => {
    updateState({ isDismissed: false, isHiddenPref: false })

    try {
      sessionStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(HIDE_KEY)
    } catch (error) {
      if (!isProduction) console.error('Error restoring mascot:', error)
    }
  }, [isProduction, updateState])

  /**
   * Handle menu actions
   */
  const handleMenuAction = useCallback(
    (action: string) => {
      updateState({
        showContact: false,
        showSettings: false,
        showMenu: false,
        showGame: false,
        showAIChat: false
      })

      scheduleTimeout(() => {
        switch (action) {
          case 'contact':
            updateState({
              showContact: true
            })
            notificationSoundRef.current()
            break
          case 'projects':
            router.push(getLocalizedPath({ slug: '/projects', locale }))
            clickSoundRef.current()
            break
          case 'game':
            updateState({
              showGame: true
            })
            notificationSoundRef.current()
            break
          case 'chat':
            updateState({
              showAIChat: true
            })
            notificationSoundRef.current()
            break
          case 'settings':
            updateState({
              showSettings: true
            })
            clickSoundRef.current()
            break
        }
      }, 50)
    },
    [locale, router, scheduleTimeout, updateState]
  )

  /**
   * Handle AI Chat close
   */
  const handleAIClose = useCallback(() => {
    updateState({ showAIChat: false, isThinking: false })
  }, [updateState])

  /**
   * Handle AI thinking state changes
   */
  const handleThinkingChange = useCallback(
    (thinking: boolean) => {
      updateState({ isThinking: thinking })
    },
    [updateState]
  )

  /**
   * Explain selected text with AI
   */
  const explainSelection = useCallback(() => {
    const text = state.selectedText
    if (!text) return

    updateState({
      showAIChat: true,
      showSelectionBubble: false,
      selectedText: ''
    })

    const prompt = t('mascot.interactions.explainPrompt', { text })
    sessionStorage.setItem('yue_pending_prompt', prompt)
    notificationSoundRef.current()
  }, [state.selectedText, t, updateState])

  /**
   * Handle mascot click events
   */
  const handleMascotClick = useCallback(() => {
    const now = Date.now()
    const isRapid = now - state.lastClickTime < 1000
    const newCount = isRapid ? state.clickCount + 1 : 1

    updateState({
      clickCount: newCount,
      lastClickTime: now
    })

    if (newCount === 5) {
      updateState({ isTickled: true })
      enqueueMessage(t('mascot.interactions.tickle'), 3000)
      notificationSoundRef.current()
      scheduleTimeout(() => updateState({ isTickled: false }), 1000)
      return
    }

    if (newCount === 10) {
      updateState({ isDizzy: true, clickCount: 0 })
      enqueueMessage(t('mascot.interactions.dizzy'), 4000)
      alertSound.play()
      scheduleTimeout(() => updateState({ isDizzy: false }), 5000)
      return
    }

    updateState({
      isActive: !state.isActive,
      showMenu: !state.showMenu,
      showContact: false,
      showSettings: false,
      showGame: false,
      showAIChat: false
    })
    clickSoundRef.current()
  }, [
    state.lastClickTime,
    state.clickCount,
    state.isActive,
    state.showMenu,
    t,
    updateState,
    enqueueMessage,
    alertSound,
    scheduleTimeout
  ])

  /**
   * Get position classes based on user preference
   */
  const getPositionClasses = useCallback((): string => {
    switch (state.preferences.bubblePosition) {
      case 'bottom-left':
        return 'fixed bottom-3 left-3 sm:bottom-5 sm:left-5'
      case 'top-right':
        return 'fixed top-16 right-3 sm:top-5 sm:right-5'
      case 'top-left':
        return 'fixed top-16 left-3 sm:top-5 sm:left-5'
      case 'bottom-right':
      default:
        return 'fixed bottom-3 right-3 sm:bottom-5 sm:right-5'
    }
  }, [state.preferences.bubblePosition])

  /**
   * Get bubble positioning classes relative to mascot
   */
  const getBubblePositionClasses = useCallback((): string => {
    switch (state.preferences.bubblePosition) {
      case 'bottom-left':
        return 'absolute bottom-full left-0 mb-2 max-w-[calc(100vw-2rem)] sm:max-w-none'
      case 'top-right':
        return 'absolute top-full right-0 mt-2 max-w-[calc(100vw-2rem)] sm:max-w-none'
      case 'top-left':
        return 'absolute top-full left-0 mt-2 max-w-[calc(100vw-2rem)] sm:max-w-none'
      case 'bottom-right':
      default:
        return 'absolute bottom-full right-0 mb-2 max-w-[calc(100vw-2rem)] sm:max-w-none'
    }
  }, [state.preferences.bubblePosition])

  // Load browser-only preferences and saved state after hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      const updates: Partial<MascotState> = {
        preferences: loadPreferences()
      }

      try {
        const saved = sessionStorage.getItem(MASCOT_IMAGE_KEY)
        if (saved) {
          updates.currentMascotImage = Number.parseInt(saved, 10)
        } else {
          const chosen = Math.floor(Math.random() * 5) + 1
          sessionStorage.setItem(MASCOT_IMAGE_KEY, String(chosen))
          updates.currentMascotImage = chosen
        }

        const dismissed = sessionStorage.getItem(STORAGE_KEY)
        if (dismissed === '1') updates.isDismissed = true

        const hiddenPref = localStorage.getItem(HIDE_KEY)
        if (hiddenPref === '1') updates.isHiddenPref = true

        const konami = localStorage.getItem(KONAMI_MODE_KEY)
        if (konami === '1') updates.isKonamiMode = true

        const visited = localStorage.getItem(BLOG_POST_VISITED_KEY)
        if (visited) {
          updates.blogPostsVisited = new Set(JSON.parse(visited))
        }
      } catch {
        // ignore storage errors
      }

      setMounted(true)
      updateState(updates)
    }, 0)

    return () => clearTimeout(timer)
  }, [loadPreferences, updateState])

  // Reduced motion preference
  useEffect(() => {
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    const timer = setTimeout(handleChange, 0)

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      clearTimeout(timer)
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Konami Code detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === 'y') {
        restoreMascot()
        return
      }

      const newSequence = [...state.konamiSequence, event.keyCode]
      updateState({ konamiSequence: newSequence })

      if (newSequence.length === KONAMI_CODE.length) {
        const isKonami = newSequence.every((key, index) => key === KONAMI_CODE[index])
        if (isKonami) {
          const newMode = !state.isKonamiMode
          updateState({ isKonamiMode: newMode })
          try {
            localStorage.setItem(KONAMI_MODE_KEY, newMode ? '1' : '0')
          } catch {}
        }
        updateState({ konamiSequence: [] })
      } else if (newSequence.length > KONAMI_CODE.length) {
        updateState({ konamiSequence: [] })
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)
    return () => globalThis.removeEventListener('keydown', handleKeyDown)
  }, [restoreMascot, state.konamiSequence, state.isKonamiMode, updateState])

  // Blinking animation
  useEffect(() => {
    if (!state.preferences.animations || prefersReducedMotion) return

    const blinkInterval = setInterval(
      () => {
        updateState({ isBlinking: true })
        if (blinkTimeoutRef.current) {
          clearTimeout(blinkTimeoutRef.current)
        }
        blinkTimeoutRef.current = setTimeout(() => updateState({ isBlinking: false }), 150)
      },
      3000 + Math.random() * 2000
    )

    return () => {
      clearInterval(blinkInterval)
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current)
        blinkTimeoutRef.current = null
      }
    }
  }, [state.preferences.animations, prefersReducedMotion, updateState])

  // Mouse follow effect
  useEffect(() => {
    if (!state.preferences.animations || prefersReducedMotion || !state.isActive) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      updateState({ mousePosition: { x, y } })
    }

    globalThis.addEventListener('mousemove', handleMouseMove)
    return () => globalThis.removeEventListener('mousemove', handleMouseMove)
  }, [state.preferences.animations, prefersReducedMotion, state.isActive, updateState])

  // Contextual skin switching
  useEffect(() => {
    const timer = setTimeout(() => {
      let nextImage = state.currentMascotImage || 1

      if (state.isThinking) {
        nextImage = 8
      } else if (pageKey === '404') {
        nextImage = 6
      } else if (pageKey === 'projects' || pageKey === 'projectsDetail') {
        nextImage = 7
      } else {
        try {
          const saved = sessionStorage.getItem(MASCOT_IMAGE_KEY)
          const savedImage = saved ? Number.parseInt(saved, 10) : 0
          if (savedImage > 0) {
            nextImage = savedImage
          }
        } catch {
          // ignore storage errors
        }
      }

      if (nextImage !== state.currentMascotImage) {
        updateState({ currentMascotImage: nextImage })
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [pageKey, state.isThinking, state.currentMascotImage, updateState])

  // Idle timer for random messages
  useEffect(() => {
    if (
      !state.preferences.speechBubbles ||
      state.autoShowMessage ||
      state.showContact ||
      state.showGame ||
      state.showSettings ||
      state.showMenu ||
      state.showAIChat
    )
      return

    const timer = setTimeout(() => {
      if (
        !state.autoShowMessage &&
        !state.showContact &&
        !state.showGame &&
        !state.showSettings &&
        !state.showMenu &&
        !state.showAIChat
      ) {
        enqueueMessage(getIdleMessage(), 4000)
      }
    }, 25_000)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [
    state.preferences.speechBubbles,
    state.autoShowMessage,
    state.showContact,
    state.showGame,
    state.showSettings,
    state.showMenu,
    state.showAIChat,
    enqueueMessage,
    getIdleMessage
  ])

  // Check for new blog posts
  useEffect(() => {
    if (!mounted || !state.preferences.speechBubbles) return

    let notificationTimer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const checkForNewPost = async () => {
      try {
        const checkKey = `${LATEST_POST_CHECK_KEY}:${locale}`
        if (sessionStorage.getItem(checkKey) === '1') return

        const res = await fetch(`/api/mascot/latest-post?locale=${locale}`)
        if (!res.ok) return

        sessionStorage.setItem(checkKey, '1')
        const data = await res.json()

        if (data.post && data.post.slug) {
          const hasVisited = state.blogPostsVisited.has(data.post.slug)
          if (!hasVisited && !cancelled) {
            notificationTimer = setTimeout(() => {
              const msg = t('mascot.notifications.newPost', { title: data.post.title })
              enqueueMessage(msg, 10_000)
              alertSound.play()
            }, 5000)
          }
        }
      } catch {
        // silently fail for notifications
      }
    }

    void checkForNewPost()

    return () => {
      cancelled = true
      if (notificationTimer) clearTimeout(notificationTimer)
    }
  }, [
    mounted,
    locale,
    state.blogPostsVisited,
    state.preferences.speechBubbles,
    t,
    enqueueMessage,
    alertSound
  ])

  const isOnBlogPost = pageKey === 'blogPost'

  // Get current blog post slug
  const currentBlogPostSlug = useMemo(() => {
    if (!isOnBlogPost) return null
    const pathWithoutLocale = (pathname || '/').replace(/^\/(en|pt|fr|de|zh)\//, '/')
    const blogPostMatch = /^\/blog\/([^/]+)$/.exec(pathWithoutLocale)
    return blogPostMatch ? blogPostMatch[1] : null
  }, [pathname, isOnBlogPost])

  // Page change message effect
  useEffect(() => {
    if (state.preferences.speechBubbles) {
      const timer = setTimeout(() => {
        updateState({ autoShowMessage: true })

        if (isOnBlogPost && currentBlogPostSlug) {
          const msg = getBlogPostMessage()
          enqueueMessage(msg)

          if (!state.blogPostsVisited.has(currentBlogPostSlug)) {
            const newVisited = new Set(state.blogPostsVisited)
            newVisited.add(currentBlogPostSlug)
            updateState({ blogPostsVisited: newVisited })
            try {
              localStorage.setItem(BLOG_POST_VISITED_KEY, JSON.stringify([...newVisited]))
            } catch {}
          }
        } else {
          const pageMessages = fetchPageMessages(pageKey)
          const randomized =
            pageMessages.length > 0
              ? pageMessages[Math.floor(Math.random() * pageMessages.length)]
              : ''
          if (randomized) enqueueMessage(randomized)
        }

        if (resetAutoShowTimeoutRef.current) {
          clearTimeout(resetAutoShowTimeoutRef.current)
        }
        resetAutoShowTimeoutRef.current = setTimeout(() => {
          updateState({ autoShowMessage: false })
        }, state.preferences.messageDuration)
      }, 1000)

      return () => {
        clearTimeout(timer)
        if (resetAutoShowTimeoutRef.current) {
          clearTimeout(resetAutoShowTimeoutRef.current)
          resetAutoShowTimeoutRef.current = null
        }
      }
    }

    return
  }, [
    pageKey,
    state.preferences.speechBubbles,
    state.preferences.messageDuration,
    isOnBlogPost,
    currentBlogPostSlug,
    state.blogPostsVisited,
    enqueueMessage,
    fetchPageMessages,
    getBlogPostMessage,
    updateState
  ])

  // Text selection handler
  useEffect(() => {
    if (!mounted || !state.preferences.speechBubbles) return

    const handleSelectionChange = () => {
      const selection = globalThis.getSelection()
      const text = selection?.toString().trim() ?? ''

      if (text.length > 10 && canExplainSelectionOnPage(pageKey)) {
        updateState({ selectedText: text, showSelectionBubble: true })
      } else {
        updateState({ showSelectionBubble: false })
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [mounted, state.preferences.speechBubbles, pageKey, updateState])

  // Build available messages list
  const messages = useCallback(() => {
    const list: string[] = []

    if (mounted && pageKey === 'home') {
      try {
        list.push(getTimeBasedGreeting())
      } catch {}
    }

    if (pageKey === 'blogPost') {
      const blogSpecific = fetchPageMessages('blogPost')
      list.push(...blogSpecific)
    } else {
      const pageSpecific = fetchPageMessages(pageKey)
      list.push(...pageSpecific)
    }

    for (let i = 0; i < 50; i += 1) {
      const key = `mascot.messages.${i}`
      try {
        const value = t(key as any)
        if (value) list.push(value)
      } catch {
        break
      }
    }

    return list
  }, [mounted, t, pageKey, fetchPageMessages, getTimeBasedGreeting])()

  return {
    state,
    mounted,
    prefersReducedMotion,
    pageKey,
    messages,
    pathname,
    t,
    updateState,
    enqueueMessage,
    startExit,
    updatePreferences,
    copyEmail,
    handleDismissMascot,
    handleHideMascot,
    restoreMascot,
    handleMenuAction,
    handleAIClose,
    handleThinkingChange,
    explainSelection,
    handleMascotClick,
    getPositionClasses,
    getBubblePositionClasses,
    isProduction
  }
}

export type UseMascotStateReturn = ReturnType<typeof useMascotState>
