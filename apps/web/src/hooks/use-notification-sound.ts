'use client'

import { useCallback, useRef } from 'react'
import { useSoundPreferences } from './use-sound-preferences'

interface NotificationSoundOptions {
  volume?: number
  enabled?: boolean
  type?: 'toast' | 'banner'
}

export function useNotificationSound(options: NotificationSoundOptions = {}) {
  const { volume: defaultVolume = 0.5, enabled: defaultEnabled = true, type = 'toast' } = options
  const { preferences } = useSoundPreferences()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Use preferences if available, otherwise fall back to options
  const volume = preferences.volume ?? defaultVolume
  const enabled = preferences.enabled && 
    (type === 'toast' ? preferences.playOnToast : preferences.playOnBanner) &&
    defaultEnabled

  const playSound = useCallback(async () => {
    if (!enabled) return

    try {
      // Create audio instance if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/notification.wav')
        audioRef.current.volume = volume
        audioRef.current.preload = 'auto'
      }

      // Reset audio to beginning and play
      audioRef.current.currentTime = 0
      await audioRef.current.play()
    } catch (error) {
      // Silently handle audio play errors (e.g., user hasn't interacted with page yet)
      console.debug('Could not play notification sound:', error)
    }
  }, [enabled, volume])

  const preloadSound = useCallback(() => {
    if (!enabled) return

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/notification.wav')
        audioRef.current.volume = volume
        audioRef.current.preload = 'auto'
      }
    } catch (error) {
      console.debug('Could not preload notification sound:', error)
    }
  }, [enabled, volume])

  return {
    playSound,
    preloadSound
  }
}
