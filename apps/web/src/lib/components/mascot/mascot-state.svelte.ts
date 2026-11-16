import { goto } from '$app/navigation'

/* eslint-disable unicorn/consistent-class-member-order -- legacy class layout; reordering the whole controller is a separate cleanup. */
import { page } from '$app/state'
import { i18n } from '@isyuricunha/i18n/config'
import { getLocalizedPath } from '#lib/seo'
import { createTranslator, type Translator } from '#lib/i18n/translator'
import { SoundManager } from '#lib/sound-manager'
import { canExplainSelectionOnPage, getMascotPageKey } from './mascot-routing'

const STORAGE_KEY = 'vc_mascot_dismissed'
const HIDE_KEY = 'vc_mascot_hidden'
const PREFERENCES_KEY = 'vc_mascot_preferences'
const KONAMI_MODE_KEY = 'vc_mascot_konami_mode'
const BLOG_POST_VISITED_KEY = 'vc_mascot_blog_posts_visited'
const MASCOT_IMAGE_KEY = 'vc_mascot_current_image'
const LATEST_POST_CHECK_KEY = 'vc_mascot_latest_post_checked'

export interface MascotPreferences {
  animations: boolean
  soundEffects: boolean
  speechBubbles: boolean
  messageDuration: number
  bubblePosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const DEFAULT_PREFERENCES: MascotPreferences = {
  animations: true,
  soundEffects: false,
  speechBubbles: true,
  messageDuration: 7000,
  bubblePosition: 'bottom-right'
}

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
]

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
  konamiSequence: [] as string[],
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

type MascotStateData = ReturnType<typeof createInitialState>

/**
 * Port of the React hook useMascotState. One instance is created by the
 * mascot layout component; all reactive fields are runes so components read
 * them directly. Timers, storage and event listeners follow the same
 * behaviour as the original.
 */
export class MascotStateController {
  private translator = $state<Translator>(createTranslator(i18n.defaultLocale, {} as never))
  private allMessages: Record<string, unknown> | null = null
  private currentPathname = '/'
  private isProduction = false

  private clickSound = new SoundManager('click')
  private successSound = new SoundManager('success')
  private notificationSound = new SoundManager('notification')
  private alertSound = new SoundManager('alert')

  private blinkTimeout: ReturnType<typeof setTimeout> | null = null
  private resetAutoShowTimeout: ReturnType<typeof setTimeout> | null = null
  private scheduledTimeouts = new Set<ReturnType<typeof setTimeout>>()
  private konamiSequence: string[] = []
  private cleanupListeners: Array<() => void> = []

  // Reactive so attributes rendered before configure() re-evaluate once the
  // translator arrives from the server load.
  state = $state<MascotStateData>(createInitialState())
  mounted = $state(false)
  prefersReducedMotion = $state(false)
  locale = i18n.defaultLocale

  /** Wire translations, locale and the raw message catalog from the server load. */
  configure(options: {
    translator: Translator
    locale: string
    allMessages: Record<string, unknown> | null
    isProduction?: boolean
  }): void {
    this.translator = options.translator
    this.locale = options.locale
    this.allMessages = options.allMessages
    this.isProduction = options.isProduction ?? false
    const enabled = this.state.preferences.soundEffects
    this.clickSound.setEnabled(enabled)
    this.successSound.setEnabled(enabled)
    this.notificationSound.setEnabled(enabled)
    this.alertSound.setEnabled(enabled)
  }

  get t(): Translator {
    return this.translator
  }

  get pathname(): string {
    return this.currentPathname
  }

  /** Must run once from a client-side effect (browser APIs). */
  initialize(): () => void {
    this.currentPathname = page.url.pathname

    const scheduleCleanup = (teardown: () => void) => {
      this.cleanupListeners.push(teardown)
    }

    // Load browser-only preferences and saved state after hydration
    const loadTimer = setTimeout(() => {
      const updates: Partial<MascotStateData> = {
        preferences: this.loadPreferences()
      }

      try {
        const saved = sessionStorage.getItem(MASCOT_IMAGE_KEY)
        if (saved) {
          updates.currentMascotImage = Number(saved)
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
          updates.blogPostsVisited = new Set(JSON.parse(visited) as string[])
        }
      } catch {
        // ignore storage errors
      }

      this.mounted = true
      this.updateState(updates)
    }, 0)

    // Reduced motion preference
    const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)')
    const motionChange = () => {
      this.prefersReducedMotion = mediaQuery.matches
    }
    mediaQuery.addEventListener('change', motionChange)
    scheduleCleanup(() => {
      mediaQuery.removeEventListener('change', motionChange)
      clearTimeout(loadTimer)
    })
    motionChange()

    // Konami Code detection
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === 'y') {
        this.restoreMascot()
        return
      }

      // Classic sliding-window matching: keep only the longest suffix of the
      // typed keys that matches a prefix of the code. A wrong key shifts the
      // window instead of poisoning the buffer.
      const next = [...this.konamiSequence, event.key]
      let keep = 0
      for (let size = Math.min(next.length, KONAMI_CODE.length); size > 0; size -= 1) {
        const matches = next
          .slice(-size)
          .every((key, index) => key.toLowerCase() === KONAMI_CODE[index]?.toLowerCase())
        if (matches) {
          keep = size
          break
        }
      }
      this.konamiSequence = keep > 0 ? next.slice(-keep) : []

      // `keep` is the length of the longest typed suffix that matches a code
      // prefix; only a full 10-key match may toggle the mode. Checking the
      // raw buffer length would fire on 9 correct keys + any 10th key.
      if (keep === KONAMI_CODE.length) {
        this.konamiSequence = []
        const newMode = !this.state.isKonamiMode
        this.updateState({ isKonamiMode: newMode, konamiSequence: [] })
        try {
          localStorage.setItem(KONAMI_MODE_KEY, newMode ? '1' : '0')
        } catch {}
        return
      }

      this.updateState({ konamiSequence: next })
    }
    addEventListener('keydown', handleKeyDown)
    scheduleCleanup(() => removeEventListener('keydown', handleKeyDown))

    // Mouse follow effect
    const handleMouseMove = (e: MouseEvent) => {
      if (this.prefersReducedMotion || !this.state.preferences.animations || !this.state.isActive)
        return
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      this.updateState({ mousePosition: { x, y } })
    }
    addEventListener('mousemove', handleMouseMove)
    scheduleCleanup(() => removeEventListener('mousemove', handleMouseMove))

    // Text selection handler
    const handleSelectionChange = () => {
      const selection = getSelection()
      const text = selection?.toString().trim() ?? ''

      if (text.length > 10 && canExplainSelectionOnPage(this.pageKey)) {
        this.updateState({ selectedText: text, showSelectionBubble: true })
      } else {
        this.updateState({ showSelectionBubble: false })
      }
    }
    document.addEventListener('selectionchange', handleSelectionChange)
    scheduleCleanup(() => document.removeEventListener('selectionchange', handleSelectionChange))

    // Return the cleanup for the caller's effect
    return () => {
      for (const teardown of this.cleanupListeners) teardown()
      this.cleanupListeners = []
      for (const timer of this.scheduledTimeouts) {
        clearTimeout(timer)
      }
      this.scheduledTimeouts.clear()
      this.clickSound.dispose()
      this.successSound.dispose()
      this.notificationSound.dispose()
      this.alertSound.dispose()
    }
  }

  /** Reactive effects that need the runes graph; call from an $effect root. */
  startReactiveEffects(): void {
    $effect(() => {
      // Blinking animation
      if (this.prefersReducedMotion || !this.state.preferences.animations) return

      const blinkInterval = setInterval(
        () => {
          this.updateState({ isBlinking: true })
          if (this.blinkTimeout) {
            clearTimeout(this.blinkTimeout)
          }
          this.blinkTimeout = setTimeout(() => this.updateState({ isBlinking: false }), 150)
        },
        3000 + Math.random() * 2000
      )

      return () => {
        clearInterval(blinkInterval)
        if (this.blinkTimeout) {
          clearTimeout(this.blinkTimeout)
          this.blinkTimeout = null
        }
      }
    })

    $effect(() => {
      // Contextual skin switching
      const pageKey = this.pageKey
      const isThinking = this.state.isThinking
      const currentImage = this.state.currentMascotImage

      let nextImage = currentImage || 1

      if (isThinking) {
        nextImage = 8
      } else if (pageKey === '404') {
        nextImage = 6
      } else if (pageKey === 'projects' || pageKey === 'projectsDetail') {
        nextImage = 7
      } else {
        try {
          const saved = sessionStorage.getItem(MASCOT_IMAGE_KEY)
          const savedImage = saved ? Number(saved) : 0
          if (savedImage > 0) {
            nextImage = savedImage
          }
        } catch {
          // ignore storage errors
        }
      }

      if (nextImage !== currentImage) {
        this.updateState({ currentMascotImage: nextImage })
      }
    })

    $effect(() => {
      // Idle timer for random messages
      if (
        !this.state.preferences.speechBubbles ||
        this.state.autoShowMessage ||
        this.state.showContact ||
        this.state.showGame ||
        this.state.showSettings ||
        this.state.showMenu ||
        this.state.showAIChat
      )
        return

      const timer = setTimeout(() => {
        if (
          !this.state.autoShowMessage &&
          !this.state.showContact &&
          !this.state.showGame &&
          !this.state.showSettings &&
          !this.state.showMenu &&
          !this.state.showAIChat
        ) {
          this.enqueueMessage(this.getIdleMessage(), 4000)
        }
      }, 25_000)

      return () => {
        if (timer) clearTimeout(timer)
      }
    })

    $effect(() => {
      // Page change message effect
      if (!this.state.preferences.speechBubbles) return
      const pageKey = this.pageKey
      const isOnBlogPost = pageKey === 'blogPost'
      const currentBlogPostSlug = this.currentBlogPostSlug

      const timer = setTimeout(() => {
        this.updateState({ autoShowMessage: true })

        if (isOnBlogPost && currentBlogPostSlug) {
          if (!this.state.blogPostsVisited.has(currentBlogPostSlug)) {
            const msg = this.getBlogPostMessage()
            this.enqueueMessage(msg)
            const newVisited = new Set(this.state.blogPostsVisited)
            newVisited.add(currentBlogPostSlug)
            this.updateState({ blogPostsVisited: newVisited })
            try {
              localStorage.setItem(BLOG_POST_VISITED_KEY, JSON.stringify([...newVisited]))
            } catch {}
          }
        } else {
          const pageSpecific = this.fetchPageMessages(pageKey)
          const msg =
            pageSpecific.length > 0
              ? (pageSpecific[Math.floor(Math.random() * pageSpecific.length)] ?? '')
              : ''
          if (msg) this.enqueueMessage(msg)
        }

        if (this.resetAutoShowTimeout) {
          clearTimeout(this.resetAutoShowTimeout)
        }
        this.resetAutoShowTimeout = setTimeout(
          () => this.updateState({ autoShowMessage: false }),
          this.state.preferences.messageDuration
        )
      }, 1000)

      return () => clearTimeout(timer)
    })

    $effect(() => {
      // Check for new blog posts
      if (!this.mounted || !this.state.preferences.speechBubbles) return

      let notificationTimer: ReturnType<typeof setTimeout> | null = null
      let cancelled = false

      const checkForNewPost = async () => {
        try {
          const checkKey = `${LATEST_POST_CHECK_KEY}:${this.locale}`
          if (sessionStorage.getItem(checkKey) === '1') return

          const res = await fetch(`/api/mascot/latest-post?locale=${this.locale}`)
          if (!res.ok) return

          sessionStorage.setItem(checkKey, '1')
          const data = (await res.json()) as { post?: { slug?: string; title?: string } | null }

          if (data.post && data.post.slug) {
            const hasVisited = this.state.blogPostsVisited.has(data.post.slug)
            if (!hasVisited && !cancelled) {
              notificationTimer = setTimeout(() => {
                const msg = this.t('mascot.notifications.newPost', {
                  title: data.post?.title ?? ''
                })
                this.enqueueMessage(msg, 10_000)
                this.alertSound.play()
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
    })
  }

  get pageKey(): string {
    return getMascotPageKey(this.currentPathname || '/')
  }

  get isOnBlogPost(): boolean {
    return this.pageKey === 'blogPost'
  }

  get currentBlogPostSlug(): string | null {
    if (!this.isOnBlogPost) return null
    const localePattern = new RegExp(`^/(${i18n.locales.join('|')})/`, '')
    const pathWithoutLocale = (this.currentPathname || '/').replace(localePattern, '/')
    const blogPostMatch = /^\/blog\/([^/]+)$/.exec(pathWithoutLocale)
    return blogPostMatch ? blogPostMatch[1] : null
  }

  /** Sync the pathname when navigation happens (called from the layout effect). */
  syncPathname(pathname: string): void {
    this.currentPathname = pathname
  }

  /** Safely update state with partial updates. */
  updateState(updates: Partial<MascotStateData>): void {
    Object.assign(this.state, updates)
  }

  private scheduleTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    const timer = setTimeout(() => {
      this.scheduledTimeouts.delete(timer)
      callback()
    }, delay)

    this.scheduledTimeouts.add(timer)
    return timer
  }

  /** Mark message for exit animation and remove it afterwards. */
  startExit(id: number): void {
    const exitingIds = new Set(this.state.exitingIds)
    exitingIds.add(id)
    this.updateState({ exitingIds })

    this.scheduleTimeout(() => {
      const next = new Set(this.state.exitingIds)
      next.delete(id)
      this.updateState({
        messageQueue: this.state.messageQueue.filter((item) => item.id !== id),
        exitingIds: next
      })
    }, 200)
  }

  /** Add a new message to the display queue. */
  enqueueMessage(text: string, duration?: number): void {
    if (!text) return
    const d = duration ?? this.state.preferences.messageDuration
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const expiresAt = Date.now() + d

    this.updateState({
      messageQueue: [...this.state.messageQueue, { id, text, expiresAt }]
    })

    this.scheduleTimeout(() => {
      this.startExit(id)
    }, d)
  }

  /** Update preferences and persist to localStorage. */
  updatePreferences(updates: Partial<MascotPreferences>): void {
    const newPrefs = { ...this.state.preferences, ...updates }
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
    } catch (error) {
      if (!this.isProduction) console.error('Error saving preferences:', error)
    }
    this.updateState({ preferences: newPrefs })
    const enabled = newPrefs.soundEffects
    this.clickSound.setEnabled(enabled)
    this.successSound.setEnabled(enabled)
    this.notificationSound.setEnabled(enabled)
    this.alertSound.setEnabled(enabled)
  }

  /** Load saved preferences from localStorage. */
  loadPreferences(): MascotPreferences {
    if (globalThis.window === undefined) return { ...DEFAULT_PREFERENCES }

    try {
      const saved = localStorage.getItem(PREFERENCES_KEY)
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...(JSON.parse(saved) as MascotPreferences) }
      }
    } catch (error) {
      if (!this.isProduction) console.error('Error loading preferences:', error)
    }
    return { ...DEFAULT_PREFERENCES }
  }

  /** Get time based greeting message. */
  getTimeBasedGreeting(): string {
    if (!this.mounted) return ''
    const hour = new Date().getHours()
    if (hour < 12) return this.t('mascot.greetings.morning')
    if (hour < 17) return this.t('mascot.greetings.afternoon')
    if (hour < 21) return this.t('mascot.greetings.evening')
    return this.t('mascot.greetings.night')
  }

  /** Generic helper to fetch numbered messages from i18n structure. */
  private fetchMessageList(base: Record<string, unknown>): string[] {
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
  }

  /** Fetch page specific messages with proper fallbacks. */
  fetchPageMessages(key: string): string[] {
    const tryKey = (k: string): string[] => {
      const mascot = this.allMessages?.mascot as Record<string, unknown> | undefined
      const pageMessages = mascot?.pageMessages as
        Record<string, Record<string, unknown>> | undefined
      const base = pageMessages?.[k] ?? {}
      return this.fetchMessageList(base)
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
  }

  /** Get random idle message. */
  getIdleMessage(): string {
    const mascot = this.allMessages?.mascot as Record<string, unknown> | undefined
    const base = (mascot?.messages ?? {}) as Record<string, unknown>
    const list = this.fetchMessageList(base)

    if (list.length === 0) return this.t('mascot.messages.0')
    return list[Math.floor(Math.random() * list.length)] ?? this.t('mascot.messages.0')
  }

  /** Get random blog post specific message. */
  getBlogPostMessage(): string {
    const mascot = this.allMessages?.mascot as Record<string, unknown> | undefined
    const pageMessages = mascot?.pageMessages as Record<string, Record<string, unknown>> | undefined
    const base = pageMessages?.blogPost ?? {}
    const list = this.fetchMessageList(base)

    if (list.length === 0) return this.t('mascot.messages.0')
    return list[Math.floor(Math.random() * list.length)] ?? this.t('mascot.messages.0')
  }

  /** Copy contact email to clipboard. */
  async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText('me@yuricunha.com')
      this.enqueueMessage(this.t('mascot.contact.copySuccess'), 2000)
      this.successSound.play()
    } catch (error) {
      this.enqueueMessage(this.t('mascot.contact.copyError'), 3000)
      if (!this.isProduction) console.error('Failed to copy email:', error)
    }
  }

  /** Hide mascot for the current browser session. */
  handleDismissMascot(): void {
    this.updateState({
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
      if (!this.isProduction) console.error('Error dismissing mascot:', error)
    }
  }

  /** Hide mascot until the user restores it. */
  handleHideMascot(): void {
    this.updateState({
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
      if (!this.isProduction) console.error('Error hiding mascot:', error)
    }
  }

  /** Restore mascot and clear persisted hidden/dismissed flags. */
  restoreMascot(): void {
    this.updateState({ isDismissed: false, isHiddenPref: false })

    try {
      sessionStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(HIDE_KEY)
    } catch (error) {
      if (!this.isProduction) console.error('Error restoring mascot:', error)
    }
  }

  /** Handle menu actions. */
  handleMenuAction(action: string): void {
    this.updateState({
      showContact: false,
      showSettings: false,
      showMenu: false,
      showGame: false,
      showAIChat: false
    })

    this.scheduleTimeout(() => {
      switch (action) {
        case 'contact':
          this.updateState({ showContact: true })
          this.notificationSound.play()
          break
        case 'projects':
          void goto(getLocalizedPath({ slug: '/projects', locale: this.locale }))
          this.clickSound.play()
          break
        case 'game':
          this.updateState({ showGame: true })
          this.notificationSound.play()
          break
        case 'chat':
          this.updateState({ showAIChat: true })
          this.notificationSound.play()
          break
        case 'settings':
          this.updateState({ showSettings: true })
          this.clickSound.play()
          break
      }
    }, 50)
  }

  /** Handle AI Chat close. */
  handleAIClose(): void {
    this.updateState({ showAIChat: false, isThinking: false })
  }

  /** Handle AI thinking state changes. */
  handleThinkingChange(thinking: boolean): void {
    this.updateState({ isThinking: thinking })
  }

  /** Explain selected text with AI. */
  explainSelection(): void {
    const text = this.state.selectedText
    if (!text) return

    this.updateState({
      showAIChat: true,
      showSelectionBubble: false,
      selectedText: ''
    })

    const prompt = this.t('mascot.interactions.explainPrompt', { text })
    sessionStorage.setItem('yue_pending_prompt', prompt)
    this.notificationSound.play()
  }

  /** Handle mascot click events. */
  handleMascotClick(): void {
    const now = Date.now()
    const isRapid = now - this.state.lastClickTime < 1000
    const newCount = isRapid ? this.state.clickCount + 1 : 1

    this.updateState({
      clickCount: newCount,
      lastClickTime: now
    })

    if (newCount === 5) {
      this.updateState({ isTickled: true })
      this.enqueueMessage(this.t('mascot.interactions.tickle'), 3000)
      this.notificationSound.play()
      this.scheduleTimeout(() => this.updateState({ isTickled: false }), 1000)
      return
    }

    if (newCount === 10) {
      this.updateState({ isDizzy: true, clickCount: 0 })
      this.enqueueMessage(this.t('mascot.interactions.dizzy'), 4000)
      this.alertSound.play()
      this.scheduleTimeout(() => this.updateState({ isDizzy: false }), 5000)
      return
    }

    this.updateState({
      isActive: !this.state.isActive,
      showMenu: !this.state.showMenu,
      showContact: false,
      showSettings: false,
      showGame: false,
      showAIChat: false
    })
    this.clickSound.play()
  }

  /** Get position classes based on user preference. */
  getPositionClasses(): string {
    switch (this.state.preferences.bubblePosition) {
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

  /** Get bubble positioning classes relative to mascot. */
  getBubblePositionClasses(): string {
    switch (this.state.preferences.bubblePosition) {
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
  }

  /** Build available messages list (same shape as the React hook return). */
  messages(): string[] {
    const list: string[] = []

    if (this.mounted && this.pageKey === 'home') {
      try {
        list.push(this.getTimeBasedGreeting())
      } catch {}
    }

    if (this.pageKey === 'blogPost') {
      const blogSpecific = this.fetchPageMessages('blogPost')
      list.push(...blogSpecific)
    } else {
      const pageSpecific = this.fetchPageMessages(this.pageKey)
      list.push(...pageSpecific)
    }

    return list
  }
}
/* eslint-enable unicorn/consistent-class-member-order -- cleanup companion to the file-top disable. */
