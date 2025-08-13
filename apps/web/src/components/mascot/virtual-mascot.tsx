'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { XIcon, SettingsIcon, GamepadIcon, EyeIcon, MenuIcon, BugIcon, GithubIcon, CopyIcon } from 'lucide-react'
import { useTranslations } from '@tszhong0411/i18n/client'
import MascotGame from './mascot-game'

type VirtualMascotProps = {
  hidden?: boolean
}

const STORAGE_KEY = 'vc_mascot_dismissed'
const HIDE_KEY = 'vc_mascot_hidden'
const PREFERENCES_KEY = 'vc_mascot_preferences'
const KONAMI_MODE_KEY = 'vc_mascot_konami_mode'
const BLOG_POST_VISITED_KEY = 'vc_mascot_blog_posts_visited'
const MASCOT_IMAGE_KEY = 'vc_mascot_current_image'

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
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHiddenPref, setIsHiddenPref] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [isWaving, setIsWaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [isKonamiMode, setIsKonamiMode] = useState(false)
  const [konamiSequence, setKonamiSequence] = useState<number[]>([])
  const [autoShowMessage, setAutoShowMessage] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null)
  const [lastMessageIndex, setLastMessageIndex] = useState(-1)
  const [currentMascotImage, setCurrentMascotImage] = useState(1)
  const [blogPostsVisited, setBlogPostsVisited] = useState<Set<string>>(new Set())
  const [preferences, setPreferences] = useState<MascotPreferences>({
    animations: true,
    soundEffects: false,
    speechBubbles: true,
    skin: 'default',
    messageDuration: 7000, // 7 seconds default
    bubblePosition: 'bottom-right'
  })
  const bubbleRef = useRef<HTMLDivElement | null>(null)
  const mascotRef = useRef<HTMLButtonElement | null>(null)

  // Konami Code sequence: ↑↑↓↓←→←→BA
  const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('mascot.greetings.morning')
    if (hour < 17) return t('mascot.greetings.afternoon')
    if (hour < 21) return t('mascot.greetings.evening')
    return t('mascot.greetings.night')
  }

  // Get idle message
  const getIdleMessage = () => {
    const idleMessages = [
      t('mascot.idle.tip1'),
      t('mascot.idle.tip2'),
      t('mascot.idle.tip3'),
      t('mascot.idle.tip4'),
      t('mascot.idle.tip5')
    ]
    return idleMessages[Math.floor(Math.random() * idleMessages.length)]
  }

  // Get blog post specific message
  const getBlogPostMessage = () => {
    const blogPostMessages = []
    for (let i = 0; i < 10; i += 1) {
      try {
        const key = `mascot.pageMessages.blogPost.${i}`
        const value = t(key as any)
        if (value) blogPostMessages.push(value)
      } catch {
        break
      }
    }
    return blogPostMessages[Math.floor(Math.random() * blogPostMessages.length)] || t('mascot.pageMessages.blogPost.0')
  }

  // Copy email to clipboard
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('me@yuricunha.com')
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  // Read dismissal state and preferences once per session
  useEffect(() => {
    try {
      const v = sessionStorage.getItem(STORAGE_KEY)
      if (v === '1') setIsDismissed(true)
      const h = localStorage.getItem(HIDE_KEY)
      if (h === '1') setIsHiddenPref(true)

      // Load preferences
      const prefs = localStorage.getItem(PREFERENCES_KEY)
      if (prefs) {
        const parsed = JSON.parse(prefs)
        setPreferences(prev => ({ ...prev, ...parsed }))
      }

      // Load Konami mode state
      const konami = localStorage.getItem(KONAMI_MODE_KEY)
      if (konami === '1') setIsKonamiMode(true)

      // Load visited blog posts
      const visited = localStorage.getItem(BLOG_POST_VISITED_KEY)
      if (visited) {
        setBlogPostsVisited(new Set(JSON.parse(visited)))
      }

      // Load or set random mascot image
      const savedImage = sessionStorage.getItem(MASCOT_IMAGE_KEY)
      if (savedImage) {
        setCurrentMascotImage(parseInt(savedImage))
      } else {
        const randomImage = Math.floor(Math.random() * 5) + 1
        setCurrentMascotImage(randomImage)
        sessionStorage.setItem(MASCOT_IMAGE_KEY, randomImage.toString())
      }
    } catch { }
  }, [])

  // Konami Code detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Keyboard shortcut to restore Yue (Shift+Y)
      if (event.shiftKey && event.key.toLowerCase() === 'y') {
        setIsDismissed(false)
        setIsHiddenPref(false)
        try {
          sessionStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(HIDE_KEY)
        } catch { }
        return
      }

      const newSequence = [...konamiSequence, event.keyCode]
      setKonamiSequence(newSequence)

      // Check if the sequence matches Konami Code
      if (newSequence.length === KONAMI_CODE.length) {
        const isKonami = newSequence.every((key, index) => key === KONAMI_CODE[index])
        if (isKonami) {
          setIsKonamiMode(prev => {
            const newMode = !prev
            try {
              localStorage.setItem(KONAMI_MODE_KEY, newMode ? '1' : '0')
            } catch { }
            return newMode
          })
        }
        setKonamiSequence([])
      } else if (newSequence.length > KONAMI_CODE.length) {
        setKonamiSequence([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [konamiSequence])

  // Blinking animation
  useEffect(() => {
    if (!preferences.animations || prefersReducedMotion) return

    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 3000 + Math.random() * 2000) // Random interval between 3-5 seconds

    return () => clearInterval(blinkInterval)
  }, [preferences.animations, prefersReducedMotion])

  // Idle timer for fun facts
  useEffect(() => {
    if (!preferences.speechBubbles || showBubble || autoShowMessage || showContact || showSettings) return

    const timer = setTimeout(() => {
      if (!showBubble && !autoShowMessage && !showContact && !showSettings) {
        setCurrentMessage(getIdleMessage())
        setShowBubble(true)

        // Hide idle message after 4 seconds
        setTimeout(() => {
          setShowBubble(false)
        }, 4000)
      }
    }, 25000) // 25 seconds idle

    setIdleTimer(timer)
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [preferences.speechBubbles, showBubble, autoShowMessage, showContact, showSettings])

  // Get current page path for contextual messages (language-aware)
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const getPageKey = (path: string) => {
    // Remove locale prefix if present
    const pathWithoutLocale = path.replace(/^\/(en|pt|fr|de|zh)\//, '/')

    if (pathWithoutLocale === '/' || pathWithoutLocale === '') return 'home'

    // Check for individual blog post first (more specific)
    const blogPostMatch = pathWithoutLocale.match(/^\/blog\/([^\/]+)$/)
    if (blogPostMatch) return 'blogPost'

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

  const pageKey = getPageKey(currentPath)

  // Check if we're on a specific blog post
  const isOnBlogPost = useMemo(() => {
    return pageKey === 'blogPost'
  }, [pageKey])

  // Get current blog post slug for tracking visits
  const currentBlogPostSlug = useMemo(() => {
    if (!isOnBlogPost) return null
    const pathWithoutLocale = currentPath.replace(/^\/(en|pt|fr|de|zh)\//, '/')
    const blogPostMatch = pathWithoutLocale.match(/^\/blog\/([^\/]+)$/)
    return blogPostMatch ? blogPostMatch[1] : null
  }, [currentPath, isOnBlogPost])

  // Reset message index and show automatic message when page changes
  useEffect(() => {
    setMessageIndex(0)
    setLastMessageIndex(-1)

    // Show automatic page-specific message after a short delay
    if (preferences.speechBubbles) {
      const timer = setTimeout(() => {
        setAutoShowMessage(true)
        setShowBubble(true)

        // Check if we're on a blog post and haven't visited it before
        if (isOnBlogPost && currentBlogPostSlug) {
          if (!blogPostsVisited.has(currentBlogPostSlug)) {
            // Show blog post specific message
            setCurrentMessage(getBlogPostMessage())
            // Mark this blog post as visited
            const newVisited = new Set(blogPostsVisited)
            newVisited.add(currentBlogPostSlug)
            setBlogPostsVisited(newVisited)
            try {
              localStorage.setItem(BLOG_POST_VISITED_KEY, JSON.stringify([...newVisited]))
            } catch { }
          } else {
            // Show regular page message (but not blog post specific)
            const pageMessages = []
            for (let i = 0; i < 6; i += 1) {
              const key = `mascot.pageMessages.${pageKey}.${i}`
              try {
                const value = t(key as any)
                if (value) pageMessages.push(value)
              } catch {
                break
              }
            }
            setCurrentMessage(pageMessages[0] || messages[0] || '')
          }
        } else {
          // Show regular page message
          setCurrentMessage(messages[0] || '')
        }

        // Hide the message after configured duration
        const hideTimer = setTimeout(() => {
          setShowBubble(false)
          setAutoShowMessage(false)
        }, preferences.messageDuration)

        return () => clearTimeout(hideTimer)
      }, 1000) // 1 second delay after page load

      return () => clearTimeout(timer)
    }
  }, [pageKey, preferences.speechBubbles, preferences.messageDuration, isOnBlogPost, currentBlogPostSlug, blogPostsVisited, t])

  // Build message list from i18n with time-based greetings and context
  const messages: string[] = useMemo(() => {
    const list: string[] = []

    // Only add time-based greeting on the root path (/)
    if (pageKey === 'home') {
      try {
        list.push(getTimeBasedGreeting())
      } catch {
        // Fallback if greeting translation is missing
      }
    }

    // For blog posts, don't include the general blog messages
    // Only include blog post specific messages if this is the first visit
    if (pageKey === 'blogPost' && currentBlogPostSlug && blogPostsVisited.has(currentBlogPostSlug)) {
      // Skip page-specific messages for visited blog posts
    } else {
      // First try to get page-specific messages
      for (let i = 0; i < 6; i += 1) {
        const key = `mascot.pageMessages.${pageKey}.${i}`
        try {
          const value = t(key as any)
          if (value) list.push(value)
        } catch {
          // Stop when we can't find more page-specific messages
          break
        }
      }
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
  }, [t, pageKey, currentBlogPostSlug, blogPostsVisited])

  // Get random message index (avoiding last message)
  const getRandomMessageIndex = () => {
    if (messages.length <= 1) return 0
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * messages.length)
    } while (newIndex === lastMessageIndex && messages.length > 1)
    return newIndex
  }

  const pickNextMessage = () => {
    if (messages.length === 0) return
    const newIndex = getRandomMessageIndex()
    setMessageIndex(newIndex)
    setLastMessageIndex(newIndex)
    setCurrentMessage(messages[newIndex])
  }

  const handleDismiss = () => {
    setShowBubble(false)
    setIsDismissed(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch { }
  }

  const handleMascotClick = () => {
    setIsActive((v) => !v)

    // Trigger waving animation
    if (preferences.animations && !prefersReducedMotion) {
      setIsWaving(true)
      setTimeout(() => setIsWaving(false), 600)
    }
  }

  const handlePreferencesChange = (key: keyof MascotPreferences, value: any) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
    } catch { }
  }

  const handleBubbleInteraction = () => {
    if (!autoShowMessage) {
      pickNextMessage()
      setShowBubble(true)
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (preferences.speechBubbles && !autoShowMessage && !showContact && !showSettings) {
      if (!currentMessage) {
        setCurrentMessage(messages[messageIndex] || '')
      }
      setShowBubble(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (!autoShowMessage && !showContact && !showSettings) {
      setShowBubble(false)
    }
  }

  const handleHideMascot = () => {
    setIsHiddenPref(true)
    try {
      localStorage.setItem(HIDE_KEY, '1')
    } catch { }
  }

  const handleRestoreMascot = () => {
    setIsDismissed(false)
    setIsHiddenPref(false)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(HIDE_KEY)
    } catch { }
  }

  const handleMenuAction = (action: string) => {
    // Hide all panels and bubbles first
    setShowMenu(false)
    setShowBubble(false)
    setShowContact(false)
    setShowChatbot(false)
    setShowSettings(false)

    // Small delay to ensure smooth transition
    setTimeout(() => {
      switch (action) {
        case 'contact':
          setShowContact(true)
          break
        case 'projects':
          window.open('https://github.com/isyuricunha', '_blank')
          break
        case 'game':
          setShowGame(true)
          break
        case 'settings':
          setShowSettings(true)
          break
      }
    }, 100)
  }



  // Get position classes based on preference
  const getPositionClasses = () => {
    switch (preferences.bubblePosition) {
      case 'bottom-left':
        return 'fixed bottom-5 left-5'
      case 'top-right':
        return 'fixed top-5 right-5'
      case 'top-left':
        return 'fixed top-5 left-5'
      default:
        return 'fixed bottom-5 right-5'
    }
  }

  if (hidden) return null

  // Show restore button when hidden or dismissed
  if (isHiddenPref || isDismissed) {
    return (
      <div className={getPositionClasses()}>
        <button
          type='button'
          aria-label={t('mascot.restore')}
          className='rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          onClick={handleRestoreMascot}
        >
          <EyeIcon className='h-6 w-6' />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={getPositionClasses()}>
        {/* Settings Panel */}
        {showSettings && (
          <div className='absolute bottom-full right-0 mb-2 w-80 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-medium'>{t('mascot.settings.title')}</h3>
              <button
                type='button'
                aria-label={t('mascot.settings.close')}
                className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => {
                  setShowSettings(false)
                  setShowBubble(false)
                }}
              >
                <XIcon className='h-4 w-4' />
              </button>
            </div>

            <div className='space-y-3'>
              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.animations')}</span>
                <input
                  type='checkbox'
                  checked={preferences.animations}
                  onChange={(e) => handlePreferencesChange('animations', e.target.checked)}
                  className='rounded border-gray-300'
                />
              </label>

              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.speechBubbles')}</span>
                <input
                  type='checkbox'
                  checked={preferences.speechBubbles}
                  onChange={(e) => handlePreferencesChange('speechBubbles', e.target.checked)}
                  className='rounded border-gray-300'
                />
              </label>

              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.soundEffects')}</span>
                <input
                  type='checkbox'
                  checked={preferences.soundEffects}
                  onChange={(e) => handlePreferencesChange('soundEffects', e.target.checked)}
                  className='rounded border-gray-300'
                />
              </label>

              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.messageDuration')}</span>
                <select
                  value={preferences.messageDuration}
                  onChange={(e) => handlePreferencesChange('messageDuration', parseInt(e.target.value))}
                  className='rounded border-gray-300 text-xs'
                >
                  <option value={3000}>3s</option>
                  <option value={5000}>5s</option>
                  <option value={7000}>7s</option>
                  <option value={10000}>10s</option>
                </select>
              </label>

              <label className='flex items-center justify-between'>
                <span>{t('mascot.settings.bubblePosition')}</span>
                <select
                  value={preferences.bubblePosition}
                  onChange={(e) => handlePreferencesChange('bubblePosition', e.target.value)}
                  className='rounded border-gray-300 text-xs'
                >
                  <option value='bottom-right'>{t('mascot.settings.positions.bottomRight')}</option>
                  <option value='bottom-left'>{t('mascot.settings.positions.bottomLeft')}</option>
                  <option value='top-right'>{t('mascot.settings.positions.topRight')}</option>
                  <option value='top-left'>{t('mascot.settings.positions.topLeft')}</option>
                </select>
              </label>

              {isKonamiMode && (
                <div className='pt-2 border-t'>
                  <p className='text-xs text-muted-foreground'>
                    🎮 {t('mascot.easterEgg.retroMode')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Panel */}
        {showContact && (
          <div className='absolute bottom-full right-0 mb-2 w-80 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-medium'>{t('mascot.contact.title')}</h3>
              <button
                type='button'
                aria-label={t('mascot.contact.close')}
                className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => {
                  setShowContact(false)
                  setShowBubble(false)
                }}
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
        {showMenu && (
          <div className='absolute bottom-full right-0 mb-2 w-48 rounded-lg border bg-popover p-2 text-sm text-popover-foreground shadow-lg'>
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

        {/* Speech Bubble */}
        {preferences.speechBubbles && !showContact && !showSettings && (
          <div
            className={`absolute bottom-full right-0 mb-2 w-80 rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg outline-none ring-0 transition-all duration-200 ease-out ${showBubble && (currentMessage || messages[messageIndex])
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            role='dialog'
            aria-label={t('mascot.speechBubble')}
            aria-describedby='mascot-message'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className='flex items-start gap-3'>
              <div className='min-w-0 flex-1' id='mascot-message'>
                {currentMessage || messages[messageIndex]}
              </div>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  aria-label={t('mascot.menu.open')}
                  className='rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MenuIcon className='h-3 w-3' />
                </button>
                <button
                  type='button'
                  aria-label={t('mascot.hide')}
                  className='rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  onClick={handleHideMascot}
                >
                  {t('mascot.hide')}
                </button>
                <button
                  type='button'
                  aria-label={t('mascot.close')}
                  className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  onClick={handleDismiss}
                >
                  <XIcon className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mascot button */}
        <button
          ref={mascotRef}
          type='button'
          aria-label={t('mascot.ariaLabel')}
          className={`relative inline-flex h-[120px] w-[120px] items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-border shadow'
            } ${isWaving ? 'animate-bounce' : ''} ${prefersReducedMotion ? '' : 'hover:scale-105'} ${isKonamiMode ? 'animate-pulse border-yellow-400 shadow-yellow-400/20' : ''
            }`}
          onClick={handleMascotClick}
          onMouseEnter={handleMouseEnter}
          onFocus={() => {
            if (preferences.speechBubbles && !autoShowMessage && !showContact && !showSettings) {
              if (!currentMessage) {
                setCurrentMessage(messages[messageIndex] || '')
              }
              setShowBubble(true)
            }
          }}
          onBlur={() => {
            if (!autoShowMessage && !isHovering && !showContact && !showSettings) {
              setShowBubble(false)
            }
          }}
        >
          <Image
            src={`/images/mascote-${currentMascotImage}.png`}
            alt=''
            role='presentation'
            width={120}
            height={120}
            className={`rounded-full object-cover transition-all duration-200 ${isBlinking ? 'animate-pulse' : ''
              } ${isKonamiMode ? 'filter sepia hue-rotate-180' : ''}`}
            priority={false}
          />
        </button>
      </div>

      {/* Mini Game */}
      <MascotGame isOpen={showGame} onClose={() => setShowGame(false)} />
    </>
  )
}

export default VirtualMascot


