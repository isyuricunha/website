'use client'

import { useState, useEffect } from 'react'

export interface SoundPreferences {
  enabled: boolean
  volume: number
  playOnToast: boolean
  playOnBanner: boolean
}

const DEFAULT_PREFERENCES: SoundPreferences = {
  enabled: true,
  volume: 0.5,
  playOnToast: true,
  playOnBanner: true
}

const STORAGE_KEY = 'notificationSoundPreferences'

export function useSoundPreferences() {
  const [preferences, setPreferences] = useState<SoundPreferences>(DEFAULT_PREFERENCES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      }
    } catch (error) {
      console.debug('Could not load sound preferences:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      } catch (error) {
        console.debug('Could not save sound preferences:', error)
      }
    }
  }, [preferences, isLoaded])

  const updatePreferences = (updates: Partial<SoundPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES)
  }

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoaded
  }
}
