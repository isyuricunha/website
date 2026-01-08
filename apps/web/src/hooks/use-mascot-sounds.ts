'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type SoundType =
  | 'hover'
  | 'click'
  | 'message'
  | 'menuOpen'
  | 'menuClose'
  | 'gameStart'
  | 'gameClick'
  | 'gameOver'
  | 'highScore'
  | 'notification'
  | 'success'
  | 'error'

interface UseMascotSoundsOptions {
  enabled?: boolean
  volume?: number
  preloadSounds?: boolean
}

interface MascotSoundsReturn {
  play: (sound: SoundType) => void
  setVolume: (volume: number) => void
  setEnabled: (enabled: boolean) => void
  isEnabled: boolean
  volume: number
}

// Map of sound types to their file paths
const SOUND_PATHS: Record<SoundType, string> = {
  hover: '/sounds/hover.mp3',
  click: '/sounds/click.mp3',
  message: '/sounds/message.mp3',
  menuOpen: '/sounds/menu-open.mp3',
  menuClose: '/sounds/menu-close.mp3',
  gameStart: '/sounds/game-start.mp3',
  gameClick: '/sounds/game-click.mp3',
  gameOver: '/sounds/game-over.mp3',
  highScore: '/sounds/high-score.mp3',
  notification: '/sounds/notification.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3'
}

/**
 * Custom hook to manage mascot sound effects
 * Handles sound playback with volume control and enable/disable functionality
 */
export function useMascotSounds({
  enabled = true,
  volume = 0.5,
  preloadSounds = true
}: UseMascotSoundsOptions = {}): MascotSoundsReturn {
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [currentVolume, setCurrentVolume] = useState(volume)
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map())
  const lastPlayTime = useRef<Map<SoundType, number>>(new Map())

  // Minimum time between same sound plays (ms) to prevent audio spam
  const DEBOUNCE_TIME = 100

  // Initialize and preload audio files
  useEffect(() => {
    if (!preloadSounds || typeof window === 'undefined') return

    // Create audio elements for each sound
    Object.entries(SOUND_PATHS).forEach(([soundType, path]) => {
      try {
        const audio = new Audio(path)
        audio.volume = currentVolume
        audio.preload = 'auto'
        
        // Handle loading errors gracefully
        audio.addEventListener('error', () => {
          console.warn(`Failed to load sound: ${soundType}`)
        })

        audioCache.current.set(soundType as SoundType, audio)
      } catch (error) {
        console.warn(`Error creating audio for ${soundType}:`, error)
      }
    })

    // Cleanup
    return () => {
      audioCache.current.forEach((audio) => {
        audio.pause()
        audio.src = ''
      })
      audioCache.current.clear()
    }
  }, [preloadSounds])

  // Update volume for all cached audio elements
  useEffect(() => {
    audioCache.current.forEach((audio) => {
      audio.volume = currentVolume
    })
  }, [currentVolume])

  /**
   * Play a specific sound effect
   */
  const play = useCallback(
    (sound: SoundType) => {
      if (!isEnabled || typeof window === 'undefined') return

      try {
        // Debounce rapid repeated sounds
        const now = Date.now()
        const lastPlay = lastPlayTime.current.get(sound) || 0
        if (now - lastPlay < DEBOUNCE_TIME) return

        lastPlayTime.current.set(sound, now)

        // Get or create audio element
        let audio = audioCache.current.get(sound)
        
        if (!audio) {
          audio = new Audio(SOUND_PATHS[sound])
          audio.volume = currentVolume
          audioCache.current.set(sound, audio)
        }

        // Reset and play
        audio.currentTime = 0
        const playPromise = audio.play()

        // Handle play promise (required for some browsers)
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Ignore errors from user interaction requirements
            if (error.name !== 'NotAllowedError') {
              console.warn(`Error playing sound ${sound}:`, error)
            }
          })
        }
      } catch (error) {
        console.warn(`Failed to play sound ${sound}:`, error)
      }
    },
    [isEnabled, currentVolume]
  )

  /**
   * Update volume (0 to 1)
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setCurrentVolume(clampedVolume)
  }, [])

  /**
   * Enable or disable sound effects
   */
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled)
  }, [])

  return {
    play,
    setVolume,
    setEnabled,
    isEnabled,
    volume: currentVolume
  }
}
