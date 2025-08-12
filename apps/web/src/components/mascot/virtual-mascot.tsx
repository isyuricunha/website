'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { XIcon, SettingsIcon, GamepadIcon } from 'lucide-react'
import { useTranslations } from '@tszhong0411/i18n/client'
import MascotGame from './mascot-game'

type VirtualMascotProps = {
  hidden?: boolean
}

const STORAGE_KEY = 'vc_mascot_dismissed'
const HIDE_KEY = 'vc_mascot_hidden'
const PREFERENCES_KEY = 'vc_mascot_preferences'
const KONAMI_MODE_KEY = 'vc_mascot_konami_mode'

interface MascotPreferences {
  animations: boolean
  soundEffects: boolean
  speechBubbles: boolean
  skin: string
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
  const [isKonamiMode, setIsKonamiMode] = useState(false)
  const [konamiSequence, setKonamiSequence] = useState<number[]>([])
  const [autoShowMessage, setAutoShowMessage] = useState(false)
  const [preferences, setPreferences] = useState<MascotPreferences>({
    animations: true,
    soundEffects: false,
    speechBubbles: true,
    skin: 'default'
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
    } catch {}
  }, [])

  // Konami Code detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
            } catch {}
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

  // Get current page path for contextual messages
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const pageKey = currentPath === '/' ? 'home' :
                  currentPath.startsWith('/blog') ? 'blog' :
                  currentPath.startsWith('/projects') ? 'projects' :
                  currentPath.startsWith('/about') ? 'about' :
                  currentPath.startsWith('/uses') ? 'uses' :
                  currentPath.startsWith('/spotify') ? 'spotify' :
                  currentPath.startsWith('/guestbook') ? 'guestbook' : 'home'

  // Reset message index and show automatic message when page changes
  useEffect(() => {
    setMessageIndex(0)

    // Show automatic page-specific message after a short delay
    if (preferences.speechBubbles) {
      const timer = setTimeout(() => {
        setAutoShowMessage(true)
        setShowBubble(true)

        // Hide the message after 5 seconds
        const hideTimer = setTimeout(() => {
          setShowBubble(false)
          setAutoShowMessage(false)
        }, 5000)

        return () => clearTimeout(hideTimer)
      }, 1000) // 1 second delay after page load

      return () => clearTimeout(timer)
    }
  }, [pageKey, preferences.speechBubbles])

  // Build message list from i18n with time-based greetings and context
  const messages: string[] = useMemo(() => {
    const list: string[] = []

    // Add time-based greeting first
    try {
      list.push(getTimeBasedGreeting())
    } catch {
      // Fallback if greeting translation is missing
    }

    // First try to get page-specific messages
    for (let i = 0; i < 4; i += 1) {
      const key = `mascot.pageMessages.${pageKey}.${i}`
      try {
        const value = t(key as any)
        if (value) list.push(value)
      } catch {
        // Stop when we can't find more page-specific messages
        break
      }
    }

    // Then add general messages
    for (let i = 0; i < 16; i += 1) {
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
  }, [t, pageKey])

  const pickNextMessage = () => {
    if (messages.length === 0) return
    setMessageIndex((prev) => (prev + 1) % messages.length)
  }

  const handleDismiss = () => {
    setShowBubble(false)
    setIsDismissed(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {}
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
    } catch {}
  }

  const handleBubbleInteraction = () => {
    if (!autoShowMessage) {
      pickNextMessage()
      setShowBubble(true)
    }
  }

  if (hidden || isDismissed || isHiddenPref) return null

  return (
    <>
      <div className='fixed bottom-5 right-5 z-40'>
        {/* Settings Panel */}
        {showSettings && (
          <div className='absolute bottom-full right-0 mb-2 w-80 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-medium'>{t('mascot.settings.title')}</h3>
              <button
                type='button'
                aria-label={t('mascot.settings.close')}
                className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                onClick={() => setShowSettings(false)}
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

        {/* Speech Bubble */}
        {preferences.speechBubbles && (
          <div
            className={`absolute bottom-full right-0 mb-2 w-80 rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg outline-none ring-0 transition-all duration-200 ease-out ${
              showBubble && messages.length > 0
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
            role='dialog'
            aria-label={t('mascot.speechBubble')}
            aria-describedby='mascot-message'
          >
            <div className='flex items-start gap-3'>
              <div className='min-w-0 flex-1' id='mascot-message'>
                {messages[messageIndex]}
              </div>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  aria-label={t('mascot.game.open')}
                  className='rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  onClick={() => setShowGame(true)}
                >
                  <GamepadIcon className='h-3 w-3' />
                </button>
                <button
                  type='button'
                  aria-label={t('mascot.settings.open')}
                  className='rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  onClick={() => setShowSettings(true)}
                >
                  <SettingsIcon className='h-3 w-3' />
                </button>
                <button
                  type='button'
                  aria-label={t('mascot.hide')}
                  className='rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  onClick={() => {
                    try {
                      localStorage.setItem(HIDE_KEY, '1')
                    } catch {}
                    setIsHiddenPref(true)
                  }}
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
          className={`relative inline-flex h-[120px] w-[120px] items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-border shadow'
          } ${isWaving ? 'animate-bounce' : ''} ${prefersReducedMotion ? '' : 'hover:scale-105'} ${
            isKonamiMode ? 'animate-pulse border-yellow-400 shadow-yellow-400/20' : ''
          }`}
          onClick={handleMascotClick}
          onMouseEnter={() => {
            if (preferences.speechBubbles && !autoShowMessage) {
              handleBubbleInteraction()
            }
          }}
          onFocus={() => {
            if (preferences.speechBubbles && !autoShowMessage) {
              handleBubbleInteraction()
            }
          }}
          onBlur={() => {
            if (!autoShowMessage) {
              setShowBubble(false)
            }
          }}
          onMouseLeave={() => {
            if (!autoShowMessage) {
              setShowBubble(false)
            }
          }}
        >
          <Image
            src='/images/mascote.png'
            alt=''
            role='presentation'
            width={120}
            height={120}
            className={`rounded-full object-cover transition-all duration-200 ${
              isBlinking ? 'animate-pulse' : ''
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


