'use client'

import React from 'react'
import { useEffect, useRef, useState, useMemo } from 'react'
import { flags } from '@tszhong0411/env'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X as XIcon, Settings as SettingsIcon, Gamepad as GamepadIcon, Eye as EyeIcon, Menu as MenuIcon, Bug as BugIcon, Github as GithubIcon, Copy as CopyIcon, MessageCircle as MessageCircleIcon, Code } from 'lucide-react'
import { useTranslations, useLocale, useMessages } from '@tszhong0411/i18n/client'
import MascotGame from './mascot-game'
import AIChatInterface from './ai-chat-interface'
import ClaudePlayground from './claude-playground'

type VirtualMascotProps = {
  hidden?: boolean
}

const STORAGE_KEY = 'vc_mascot_dismissed'
const HIDE_KEY = 'vc_mascot_hidden'
const PREFERENCES_KEY = 'vc_mascot_preferences'
const KONAMI_MODE_KEY = 'vc_mascot_konami_mode'
const BLOG_POST_VISITED_KEY = 'vc_mascot_blog_posts_visited'
const MASCOT_IMAGE_KEY = 'vc_mascot_current_image'

const DEFAULT_PREFERENCES: MascotPreferences = {
  animations: true,
  soundEffects: false,
  speechBubbles: true,
  skin: 'default',
  messageDuration: 7000,
  bubblePosition: 'bottom-right'
}

interface MascotPreferences {
  animations: boolean
  soundEffects: boolean
  speechBubbles: boolean
  skin: string
  messageDuration: number
  bubblePosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const VirtualMascot = ({ hidden = false }: VirtualMascotProps) => {
  const t = useTranslations()
  const allMessages = useMessages() as any
  const [state, setState] = useState(() => ({
    isDismissed: false,
    isHiddenPref: false,
    isActive: false,
    showBubble: false,
    messageIndex: 0,
    isBlinking: false,
    showSettings: false,
    showGame: false,
    showMenu: false,
    showContact: false,
    showAIChat: false,
    showClaudePlayground: false,
    isKonamiMode: false,
    konamiSequence: [] as number[],
    isHovering: false,
    currentMessage: null as string | null,
    messageQueue: [] as { id: number; text: string; expiresAt: number }[],
    exitingIds: new Set<number>(),
    autoShowMessage: false,
    lastMessageIndex: -1,
    // 0 means "not chosen yet"; we will choose after mount to avoid SSR mismatch
    currentMascotImage: 0,
    blogPostsVisited: new Set<string>(),
    preferences: { ...DEFAULT_PREFERENCES }
  }))

  const mascotRef = useRef<HTMLButtonElement | null>(null)
  const [mounted, setMounted] = useState(false)

  // Helper functions to update state
  const updateState = (updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // Queue helpers
  const enqueueMessage = (text: string, duration?: number) => {
    if (!text) return
    const d = duration ?? state.preferences.messageDuration
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const expiresAt = Date.now() + d
    setState(prev => ({
      ...prev,
      messageQueue: [...prev.messageQueue, { id, text, expiresAt }]
    }))
    // schedule exit animation then removal
    setTimeout(() => {
      startExit(id)
    }, d)
  }

  const startExit = (id: number) => {
    // Mark as exiting to trigger fade-out animation
    setState(prev => ({
      ...prev,
      exitingIds: new Set(prev.exitingIds).add(id)
    }))
    // After animation completes, remove from queue
    setTimeout(() => {
      setState(prev => {
        const newExitingIds = new Set(prev.exitingIds)
        newExitingIds.delete(id)
        return {
          ...prev,
          messageQueue: prev.messageQueue.filter(item => item.id !== id),
          exitingIds: newExitingIds
        }
      })
    }, 200) // Match CSS transition duration
  }

  const updatePreferences = (updates: Partial<MascotPreferences>) => {
    const newPrefs = { ...state.preferences, ...updates }
    updateState({ preferences: newPrefs })
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  // Load preferences from localStorage
  const loadPreferences = (): MascotPreferences => {
    if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES }

    try {
      const saved = localStorage.getItem(PREFERENCES_KEY)
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
    return { ...DEFAULT_PREFERENCES }
  }

  // Konami Code sequence: ↑↑↓↓←→←→BA
  const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]

  // Check for reduced motion preference (client-side only)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // This will only run on the client side
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Get time-based greeting (only after mount to avoid SSR/client mismatch)
  const getTimeBasedGreeting = () => {
    if (!mounted) return ''
    const hour = new Date().getHours()
    if (hour < 12) return t('mascot.greetings.morning')
    if (hour < 17) return t('mascot.greetings.afternoon')
    if (hour < 21) return t('mascot.greetings.evening')
    return t('mascot.greetings.night')
  }

  // Get idle message - use all available messages instead of just first 5
  const getIdleMessage = () => {
    const list: string[] = []
    try {
      const base = (allMessages?.mascot?.messages ?? {}) as Record<string, unknown>
      const keys = Object.keys(base)
        .filter((k) => /^\d+$/.test(k))
        .map((k) => Number(k))
        .sort((a, b) => a - b)
      for (const idx of keys) {
        const v = (base as any)[String(idx)]
        if (typeof v === 'string' && v) list.push(v)
      }
    } catch { }
    if (list.length === 0) return t('mascot.messages.0')
    return list[Math.floor(Math.random() * list.length)]
  }

  // Get blog post specific message
  const getBlogPostMessage = () => {
    const list: string[] = []
    try {
      const base = (allMessages?.mascot?.pageMessages?.blogPost ?? {}) as Record<string, unknown>
      const keys = Object.keys(base)
        .filter((k) => /^\d+$/.test(k))
        .map((k) => Number(k))
        .sort((a, b) => a - b)
      for (const idx of keys) {
        const v = (base as any)[String(idx)]
        if (typeof v === 'string' && v) list.push(v)
      }
    } catch { }
    if (list.length === 0) return t('mascot.messages.0')
    return list[Math.floor(Math.random() * list.length)]
  }

  // Copy email to clipboard
  const copyEmail = (): void => {
    navigator.clipboard.writeText('me@yuricunha.com')
      .catch((err) => console.error('Failed to copy email:', err))
    enqueueMessage('Email copied to clipboard!', 2000)
  }

  // Mount flag to coordinate client-only behaviors and select session image
  useEffect(() => {
    setMounted(true)
    // Choose persistent session image only on client after mount
    try {
      const saved = sessionStorage.getItem(MASCOT_IMAGE_KEY)
      if (saved) {
        updateState({ currentMascotImage: parseInt(saved) })
      } else {
        const chosen = Math.floor(Math.random() * 5) + 1
        sessionStorage.setItem(MASCOT_IMAGE_KEY, String(chosen))
        updateState({ currentMascotImage: chosen })
      }
    } catch { }
  }, [])

  // Read dismissal state and preferences once per session
  useEffect(() => {
    try {
      const v = sessionStorage.getItem(STORAGE_KEY)
      if (v === '1') updateState({ isDismissed: true })
      const hiddenPref = localStorage.getItem(HIDE_KEY)
      if (hiddenPref === '1') updateState({ isHiddenPref: true })

      const prefs = loadPreferences()
      updateState({ preferences: prefs })

      // Load Konami mode state
      const konami = localStorage.getItem(KONAMI_MODE_KEY)
      if (konami === '1') updateState({ isKonamiMode: true })

      // Load visited blog posts
      const visited = localStorage.getItem(BLOG_POST_VISITED_KEY)
      if (visited) {
        updateState({ blogPostsVisited: new Set(JSON.parse(visited)) })
      }
    } catch { }
  }, [])

  // Konami Code detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Keyboard shortcut to restore Yue (Shift+Y)
      if (event.shiftKey && event.key.toLowerCase() === 'y') {
        updateState({ isDismissed: false, isHiddenPref: false })
        try {
          sessionStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(HIDE_KEY)
        } catch { }
        return
      }

      const newSequence = [...state.konamiSequence, event.keyCode]
      updateState({ konamiSequence: newSequence })

      // Check if the sequence matches Konami Code
      if (newSequence.length === KONAMI_CODE.length) {
        const isKonami = newSequence.every((key, index) => key === KONAMI_CODE[index])
        if (isKonami) {
          updateState({ isKonamiMode: !state.isKonamiMode })
          try {
            localStorage.setItem(KONAMI_MODE_KEY, state.isKonamiMode ? '1' : '0')
          } catch { }
        }
        updateState({ konamiSequence: [] })
      } else if (newSequence.length > KONAMI_CODE.length) {
        updateState({ konamiSequence: [] })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.konamiSequence])

  // Blinking animation
  useEffect(() => {
    if (!state.preferences.animations || prefersReducedMotion) return

    const blinkInterval = setInterval(() => {
      updateState({ isBlinking: true })
      setTimeout(() => updateState({ isBlinking: false }), 150)
    }, 3000 + Math.random() * 2000) // Random interval between 3-5 seconds

    return () => clearInterval(blinkInterval)
  }, [state.preferences.animations, prefersReducedMotion])

  // Idle timer for fun facts
  useEffect(() => {
    if (!state.preferences.speechBubbles || state.autoShowMessage || state.showContact || state.showGame || state.showSettings || state.showMenu || state.showAIChat || state.showClaudePlayground) return

    const timer = setTimeout(() => {
      if (!state.autoShowMessage && !state.showContact && !state.showGame && !state.showSettings && !state.showMenu && !state.showAIChat && !state.showClaudePlayground) {
        enqueueMessage(getIdleMessage(), 4000)
      }
    }, 25000) // 25 seconds idle

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [state.preferences.speechBubbles, state.autoShowMessage, state.showContact, state.showGame, state.showSettings, state.showMenu, state.showAIChat, state.showClaudePlayground])

  // Track current page path for contextual messages (language-aware)
  const pathname = usePathname()
  const getPageKey = (path: string) => {
    // Remove locale prefix if present
    const pathWithoutLocale = path.replace(/^\/(en|pt|fr|de|zh)\//, '/')

    if (pathWithoutLocale === '/' || pathWithoutLocale === '') return 'home'

    // Check for detail pages first (more specific)
    // Blog post detail
    const blogPostMatch = pathWithoutLocale.match(/^\/blog\/([^\/]+)$/)
    if (blogPostMatch) return 'blogPost'

    // Generic detail handling for known segments (e.g., /projects/[slug])
    const DETAIL_SEGMENTS = new Set(['projects'])
    const detailMatch = pathWithoutLocale.match(/^\/(\w+)\/([^\/]+)$/)
    if (detailMatch) {
      const seg = detailMatch[1]
      if (DETAIL_SEGMENTS.has(seg)) {
        return `${seg}Detail`
      }
    }

    if (pathWithoutLocale.startsWith('/blog')) return 'blog'
    if (pathWithoutLocale.startsWith('/projects')) return 'projects'
    if (pathWithoutLocale.startsWith('/about')) return 'about'
    if (pathWithoutLocale.startsWith('/uses')) return 'uses'
    if (pathWithoutLocale.startsWith('/spotify')) return 'spotify'
    if (pathWithoutLocale.startsWith('/guestbook')) return 'guestbook'
    if (pathWithoutLocale.startsWith('/admin')) return 'admin'
    if (pathWithoutLocale.includes('search') || pathWithoutLocale.includes('?q=')) return 'search'
    if (pathWithoutLocale === '/404' || pathWithoutLocale.includes('not-found')) return '404'
    return 'home'
  }

  const pageKey = getPageKey(pathname || '/')

  // Check if we're on a specific blog post
  const isOnBlogPost = useMemo(() => {
    return pageKey === 'blogPost'
  }, [pageKey])

  // Helper: fetch page-specific messages with graceful fallbacks
  const fetchPageMessages = (key: string): string[] => {
    const tryKey = (k: string): string[] => {
      const res: string[] = []
      try {
        const base = (allMessages?.mascot?.pageMessages?.[k] ?? {}) as Record<string, unknown>
        const keys = Object.keys(base)
          .filter((kk) => /^\d+$/.test(kk))
          .map((kk) => Number(kk))
          .sort((a, b) => a - b)
        for (const idx of keys) {
          const v = (base as any)[String(idx)]
          if (typeof v === 'string' && v) res.push(v)
        }
      } catch { }
      return res
    }

    // Prefer detail-specific messages when available, then fallback to base and home
    const isDetail = /Detail$/.test(key)
    const baseKey = isDetail ? key.replace(/Detail$/, '') : key
    let msgs: string[] = []
    if (isDetail) {
      msgs = tryKey(key)
      if (msgs.length > 0) return msgs
    }
    msgs = tryKey(baseKey)

    // Final fallback to home so we never show empty bubbles
    if (msgs.length === 0 && baseKey !== 'home') {
      msgs = tryKey('home')
    }

    return msgs
  }

  // Get current blog post slug for tracking visits
  const currentBlogPostSlug = useMemo(() => {
    if (!isOnBlogPost) return null
    const pathWithoutLocale = (pathname || '/').replace(/^\/(en|pt|fr|de|zh)\//, '/')
    const blogPostMatch = pathWithoutLocale.match(/^\/blog\/([^\/]+)$/)
    return blogPostMatch ? blogPostMatch[1] : null
  }, [pathname, isOnBlogPost])

  // Reset message index and show automatic message when page changes
  useEffect(() => {
    updateState({ messageIndex: 0, lastMessageIndex: -1 })

    // Show automatic page-specific message after a short delay
    if (state.preferences.speechBubbles) {
      const timer = setTimeout(() => {
        updateState({ autoShowMessage: true })

        // Check if we're on a blog post and haven't visited it before
        if (isOnBlogPost && currentBlogPostSlug) {
          // Always show a randomized blog post message on visit
          const msg = getBlogPostMessage()
          enqueueMessage(msg)
          // Track visited slug (kept for future logic)
          if (!state.blogPostsVisited.has(currentBlogPostSlug)) {
            const newVisited = new Set(state.blogPostsVisited)
            newVisited.add(currentBlogPostSlug)
            updateState({ blogPostsVisited: newVisited })
            try {
              localStorage.setItem(BLOG_POST_VISITED_KEY, JSON.stringify([...newVisited]))
            } catch { }
          }
        } else {
          // Show randomized page message for non-blog-post pages
          const pageMessages = fetchPageMessages(pageKey)
          const randomized = pageMessages.length
            ? pageMessages[Math.floor(Math.random() * pageMessages.length)]
            : ''
          if (randomized) enqueueMessage(randomized)
        }

        // Reset auto show flag after duration
        const hideTimer = setTimeout(() => {
          updateState({ autoShowMessage: false })
        }, state.preferences.messageDuration)
      }, 1000) // 1 second delay after page load

      return () => clearTimeout(timer)
    }
  }, [pageKey, state.preferences.speechBubbles, state.preferences.messageDuration, isOnBlogPost, currentBlogPostSlug, state.blogPostsVisited, t])

  // Build message list from i18n with time-based greetings and context
  const messages: string[] = useMemo(() => {
    const list: string[] = []

    // Only add time-based greeting on the home page, after mount
    if (mounted && pageKey === 'home') {
      try {
        list.push(getTimeBasedGreeting())
      } catch {
        // Fallback if greeting translation is missing
      }
    }

    // For blog posts, include blogPost page-specific messages in the pool so hover/click can show them.
    // Auto-show on first visit is still handled separately in the effect above.
    if (pageKey === 'blogPost') {
      const blogSpecific = fetchPageMessages('blogPost')
      list.push(...blogSpecific)
    } else {
      // First try to get page-specific messages for non-blog-post pages
      const pageSpecific = fetchPageMessages(pageKey, 6)
      list.push(...pageSpecific)
    }

    // Then add general messages
    for (let i = 0; i < 50; i += 1) {
      const key = `mascot.messages.${i}`
      try {
        const value = t(key as any)
        if (value) list.push(value)
      } catch {
        // Stop when we can't find more messages
        break
      }
    }

    return list
  }, [mounted, t, pageKey, currentBlogPostSlug, state.blogPostsVisited])

  // (Removed unused random picker helpers after introducing message queue)

  // (Removed dismiss handler; per-bubble close and Hide button cover behavior)

  const handleMascotClick = () => {
    // Toggle menu visibility when clicking on mascot
    updateState({
      isActive: !state.isActive,
      showMenu: !state.showMenu,
      // Close other panels when opening menu
      showContact: false,
      showSettings: false,
      showGame: false,
      showAIChat: false,
      showClaudePlayground: false
    })
  }

  const handleMouseEnter = () => {
    updateState({ isHovering: true })
    // Do not auto-enqueue on hover to avoid spam; only show if queue already has messages
  }

  // (Removed unused hover leave handler; visibility handled by queue existence)

  const handleHideMascot = () => {
    updateState({ isHiddenPref: true })
    try {
      localStorage.setItem(HIDE_KEY, '1')
    } catch (error) {
      console.error('Error hiding mascot:', error)
    }
  }

  // (Removed restore handler; Eye button toggles state directly)

  const handleMenuAction = (action: string) => {
    // First hide all UI elements
    updateState({
      showBubble: false,
      showContact: false,
      showSettings: false,
      showMenu: false,
      showGame: false,
      showAIChat: false,
      showClaudePlayground: false
    })

    // Use a small timeout to ensure the hide animation completes before showing new content
    setTimeout(() => {
      switch (action) {
        case 'contact':
          updateState({
            showContact: true,
            showBubble: true
          })
          break
        case 'projects':
          window.open('https://github.com/isyuricunha', '_blank')
          break
        case 'game':
          updateState({
            showGame: true,
            showBubble: true
          })
          break
        case 'chat':
          updateState({
            showAIChat: true,
            showBubble: true
          })
          break
        case 'claude':
          updateState({
            showClaudePlayground: true,
            showBubble: false
          })
          break
        case 'settings':
          updateState({
            showSettings: true,
            showBubble: true
          })
          break
        default:
          // No action needed for unknown actions
          break
      }
    }, 50) // Small delay to ensure clean transition
  }

  // Get position classes based on preference
  const getPositionClasses = (): string => {
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
  }

  // Get bubble positioning classes based on mascot position
  const getBubblePositionClasses = (): string => {
    switch (state.preferences.bubblePosition) {
      case 'bottom-left':
        // Bubbles appear above and to the right of mascot
        return 'absolute bottom-full left-0 mb-2 max-w-[calc(100vw-2rem)] sm:max-w-none'
      case 'top-right':
        // Bubbles appear below and to the left of mascot
        return 'absolute top-full right-0 mt-2 max-w-[calc(100vw-2rem)] sm:max-w-none'
      case 'top-left':
        // Bubbles appear below and to the right of mascot
        return 'absolute top-full left-0 mt-2 max-w-[calc(100vw-2rem)] sm:max-w-none'
      case 'bottom-right':
      default:
        // Bubbles appear above and to the left of mascot (original behavior)
        return 'absolute bottom-full right-0 mb-2 max-w-[calc(100vw-2rem)] sm:max-w-none'
    }
  }

  if (hidden) return null

  // Show restore button when hidden or dismissed
  if (state.isHiddenPref || state.isDismissed) {
    return (
      <div className={`${getPositionClasses()} z-50`}>
        <button
          type='button'
          aria-label={t('mascot.restore')}
          className='rounded-full bg-primary p-2 sm:p-3 text-primary-foreground shadow-lg transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px] min-w-[44px]'
          onClick={() => updateState({ isDismissed: false, isHiddenPref: false })}
        >
          <EyeIcon className='h-5 w-5 sm:h-6 sm:w-6' />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={`${getPositionClasses()} z-50`}>
        {/* Settings Panel */}
        {state.showSettings && (
          <div className={`${getBubblePositionClasses()} w-60 sm:w-64 rounded-2xl border bg-popover p-2 sm:p-3 text-xs text-popover-foreground shadow-lg`}>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-medium'>{t('mascot.settings.title')}</h3>
              <button
                type='button'
                aria-label={t('mascot.settings.close')}
                className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => updateState({ showSettings: false, showBubble: false })}
              >
                <XIcon className='h-4 w-4' />
              </button>
            </div>

            <div className='space-y-3'>
              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.animations')}</span>
                <input
                  type='checkbox'
                  checked={state.preferences.animations}
                  onChange={(e) => updatePreferences({ animations: e.target.checked })}
                  className='rounded border-input bg-background text-foreground accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2'
                />
              </label>

              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.speechBubbles')}</span>
                <input
                  type='checkbox'
                  checked={state.preferences.speechBubbles}
                  onChange={(e) => updatePreferences({ speechBubbles: e.target.checked })}
                  className='rounded border-input bg-background text-foreground accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2'
                />
              </label>

              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.soundEffects')}</span>
                <input
                  type='checkbox'
                  checked={state.preferences.soundEffects}
                  onChange={(e) => updatePreferences({ soundEffects: e.target.checked })}
                  className='rounded border-input bg-background text-foreground accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2'
                />
              </label>

              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.messageDuration')}</span>
                <select
                  value={state.preferences.messageDuration}
                  onChange={(e) => updatePreferences({ messageDuration: parseInt(e.target.value) })}
                  className='rounded-lg border border-input bg-background text-foreground text-xs px-3 py-2 shadow-sm transition-all duration-200 hover:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none focus:border-ring cursor-pointer'
                >
                  <option value={3000} className='bg-background text-foreground py-2 px-3 hover:bg-muted border-b border-border/50 last:border-b-0'>3s</option>
                  <option value={5000} className='bg-background text-foreground py-2 px-3 hover:bg-muted border-b border-border/50 last:border-b-0'>5s</option>
                  <option value={7000} className='bg-background text-foreground py-2 px-3 hover:bg-muted border-b border-border/50 last:border-b-0'>7s</option>
                  <option value={10000} className='bg-background text-foreground py-2 px-3 hover:bg-muted border-b border-border/50 last:border-b-0'>10s</option>
                </select>
              </label>

              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.bubblePosition')}</span>
                <select
                  value={state.preferences.bubblePosition}
                  onChange={(e) => updatePreferences({ bubblePosition: e.target.value as MascotPreferences['bubblePosition'] })}
                  className='rounded-lg border border-input bg-background text-foreground text-xs px-3 py-2 shadow-sm transition-all duration-200 hover:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none focus:border-ring cursor-pointer'
                >
                  <option value='bottom-right' className='bg-background text-foreground py-2 px-3 hover:bg-muted border-b border-border/50 last:border-b-0'>{t('mascot.settings.positions.bottomRight')}</option>
                  <option value='bottom-left' className='bg-background text-foreground py-2 px-3 hover:bg-muted border-b border-border/50 last:border-b-0'>{t('mascot.settings.positions.bottomLeft')}</option>
                  <option value='top-right' className='bg-background text-foreground py-2 px-3 hover:bg-muted border-b border-border/50 last:border-b-0'>{t('mascot.settings.positions.topRight')}</option>
                  <option value='top-left' className='bg-background text-foreground py-2 px-3 hover:bg-muted border-b border-border/50 last:border-b-0'>{t('mascot.settings.positions.topLeft')}</option>
                </select>
              </label>

              {state.isKonamiMode && (
                <div className='pt-2 border-t'>
                  <p className='text-xs text-muted-foreground'>
                    {t('mascot.easterEgg.retroMode')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Panel */}
        {state.showContact && (
          <div className={`${getBubblePositionClasses()} w-60 sm:w-64 rounded-2xl border bg-popover p-2 sm:p-3 text-xs text-popover-foreground shadow-lg`}>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-medium'>{t('mascot.contact.title')}</h3>
              <button
                type='button'
                aria-label={t('mascot.contact.close')}
                className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => updateState({ showContact: false, showBubble: false })}
              >
                <XIcon className='h-4 w-4' />
              </button>
            </div>

            <div className='space-y-3'>
              <p className='text-sm'>{t('mascot.contact.description')}</p>
              <div className='flex items-center gap-2'>
                <code className='flex-1 rounded bg-muted px-2 py-1 text-xs'>me@yuricunha.com</code>
                <button
                  type='button'
                  aria-label={t('mascot.contact.copy')}
                  className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  onClick={copyEmail}
                >
                  <CopyIcon className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Panel */}
        {state.showMenu && (
          <div className={`${getBubblePositionClasses()} w-36 sm:w-40 rounded-2xl border bg-popover p-2 text-xs text-popover-foreground shadow-lg`}>
            <div className='space-y-1'>
              <button
                type='button'
                className='flex w-full items-center gap-2 rounded px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => handleMenuAction('contact')}
              >
                <BugIcon className='h-4 w-4' />
                {t('mascot.menu.reportBug')}
              </button>
              <button
                type='button'
                className='flex w-full items-center gap-2 rounded px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => handleMenuAction('projects')}
              >
                <GithubIcon className='h-4 w-4' />
                {t('mascot.menu.viewProjects')}
              </button>
              {flags.gemini && (
                <>
                  <button
                    type='button'
                    className='flex w-full items-center gap-2 rounded px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    onClick={() => handleMenuAction('chat')}
                  >
                    <MessageCircleIcon className='h-4 w-4' />
                    AI Chat
                  </button>
                  <button
                    type='button'
                    className='flex w-full items-center gap-2 rounded px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    onClick={() => handleMenuAction('claude')}
                  >
                    <Code className='h-4 w-4' />
                    Claude API
                  </button>
                </>
              )}
              <button
                type='button'
                className='flex w-full items-center gap-2 rounded px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => handleMenuAction('game')}
              >
                <GamepadIcon className='h-4 w-4' />
                {t('mascot.menu.miniGame')}
              </button>
              <button
                type='button'
                className='flex w-full items-center gap-2 rounded px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => handleMenuAction('settings')}
              >
                <SettingsIcon className='h-4 w-4' />
                {t('mascot.menu.settings')}
              </button>
            </div>
          </div>
        )}

        {/* AI Chat Interface */}
        {state.showAIChat && (
          <AIChatInterface
            isOpen={state.showAIChat}
            onClose={() => updateState({ showAIChat: false, showBubble: false })}
            currentPage={pageKey}
            onMessageSent={(message) => {
              // Optional: track AI chat usage or show feedback
              console.log('AI message sent:', message)
            }}
          />
        )}

        {/* Speech Bubbles (Queued) */}
        {state.preferences.speechBubbles && !state.showContact && !state.showSettings && !state.showMenu && !state.showAIChat && (
          <div className={`${getBubblePositionClasses()} flex w-56 sm:w-60 flex-col gap-2`}>
            {state.messageQueue.map((item, idx) => {
              const isExiting = state.exitingIds.has(item.id)
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg outline-none ring-0 transition-all duration-200 ease-in-out ${isExiting ? 'opacity-0 translate-y-1 scale-95' : 'opacity-100 translate-y-0 scale-100'
                    }`}
                  role='dialog'
                  aria-label={t('mascot.speechBubble')}
                  style={!prefersReducedMotion ? { animation: 'fadeInUp 300ms ease-out' } : undefined}
                >
                  <div className='bubble-float p-2'>
                    <div className='flex items-start gap-2'>
                      <div className='min-w-0 flex-1 whitespace-pre-wrap break-words leading-relaxed text-xs'>
                        {item.text}
                      </div>
                      <div className='flex items-center gap-1 flex-shrink-0'>
                        {idx === state.messageQueue.length - 1 && (
                          <button
                            type='button'
                            aria-label={t('mascot.menu.open')}
                            className='rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            onClick={() => updateState({ showMenu: !state.showMenu })}
                          >
                            <MenuIcon className='h-3 w-3' />
                          </button>
                        )}
                        {idx === state.messageQueue.length - 1 && (
                          <button
                            type='button'
                            aria-label={t('mascot.hide')}
                            className='rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            onClick={handleHideMascot}
                          >
                            {t('mascot.hide')}
                          </button>
                        )}
                        <button
                          type='button'
                          aria-label={t('mascot.close')}
                          className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                          onClick={() => startExit(item.id)}
                        >
                          <XIcon className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mascot button */}
        <button
          ref={mascotRef}
          type='button'
          aria-label={t('mascot.ariaLabel')}
          className={`relative inline-flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${state.isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-border shadow'} ${state.preferences.animations ? 'hover:scale-105' : ''} ${state.isKonamiMode ? 'animate-pulse border-yellow-400 shadow-yellow-400/20' : ''}`}
          onClick={handleMascotClick}
          onMouseEnter={handleMouseEnter}
          onFocus={() => {
            if (state.preferences.speechBubbles && !state.autoShowMessage && !state.showContact && !state.showSettings && !state.showMenu) {
              if (!state.currentMessage) {
                updateState({ currentMessage: messages[state.messageIndex] || '' })
              }
              updateState({ showBubble: true })
            }
          }}
          onBlur={() => {
            if (!state.autoShowMessage && !state.isHovering && !state.showContact && !state.showSettings && !state.showMenu) {
              updateState({ showBubble: false })
            }
          }}
        >
          {mounted && state.currentMascotImage > 0 ? (
            <Image
              src={`/images/mascote-${state.currentMascotImage}.png`}
              alt=''
              role='presentation'
              width={64}
              height={64}
              className={`rounded-full object-cover transition-all duration-200 w-full h-full ${state.isBlinking ? 'animate-pulse' : ''} ${state.isKonamiMode ? 'filter sepia hue-rotate-180' : ''}`}
              priority={false}
            />
          ) : (
            <div aria-hidden className='w-full h-full rounded-full bg-muted/40' />)
          }
        </button>
      </div>

      {/* Mini Game */}
      <MascotGame isOpen={state.showGame} onClose={() => updateState({ showGame: false })} />
      
      {/* Claude Playground */}
      <ClaudePlayground isOpen={state.showClaudePlayground} onClose={() => updateState({ showClaudePlayground: false })} />
    </>
  )
}

export default VirtualMascot
