'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface SoundOptions {
  volume?: number
  loop?: boolean
  fadeIn?: number
  fadeOut?: number
}

interface SoundHookReturn {
  play: (options?: SoundOptions) => void
  stop: (fadeOut?: number) => void
  isPlaying: boolean
  volume: number
  setVolume: (volume: number) => void
}

const AUDIO_CONTEXTS = new Map<string, AudioContext>()

// Create a singleton audio context per sound type to avoid multiple contexts
const getAudioContext = (soundType: string): AudioContext => {
  if (AUDIO_CONTEXTS.has(soundType)) {
    return AUDIO_CONTEXTS.get(soundType)!
  }

  const context = new (window.AudioContext || (window as any).webkitAudioContext)()
  AUDIO_CONTEXTS.set(soundType, context)
  return context
}

// Generate different sound types using Web Audio API
const generateSound = (
  context: AudioContext,
  type: 'click' | 'success' | 'error' | 'notification' | 'gameClick' | 'gameSuccess' | 'gameOver'
): AudioBuffer => {
  const sampleRate = context.sampleRate
  const duration = 0.3 // seconds
  const frameCount = sampleRate * duration
  const buffer = context.createBuffer(1, frameCount, sampleRate)
  const channelData = buffer.getChannelData(0)

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate
    let sample = 0

    switch (type) {
      case 'click':
        // Short click sound
        sample = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 20)
        break
      case 'success':
        // Pleasant success chime
        sample = Math.sin(2 * Math.PI * 523.25 * t) * Math.exp(-t * 3) // C5 note
        break
      case 'error':
        // Low error tone
        sample = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 5)
        break
      case 'notification':
        // Gentle notification sound
        sample = (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 554.37 * t) * 0.5) * Math.exp(-t * 2)
        break
      case 'gameClick':
        // Quick game click
        sample = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 25)
        break
      case 'gameSuccess':
        // Game success sound
        sample = Math.sin(2 * Math.PI * 659.25 * t) * Math.exp(-t * 4) // E5 note
        break
      case 'gameOver':
        // Descending game over sound
        sample = Math.sin(2 * Math.PI * (440 - t * 200) * t) * Math.exp(-t * 2)
        break
    }

    // Apply fade out to prevent clicks
    const fadeOut = Math.max(0, 1 - (t / duration) * 0.3)
    channelData[i] = sample * fadeOut * 0.3 // Reduce volume to safe level
  }

  return buffer
}

// Cache for generated sounds
const soundCache = new Map<string, AudioBuffer>()

const getSoundBuffer = (context: AudioContext, soundType: string): AudioBuffer => {
  const cacheKey = `${context.sampleRate}_${soundType}`

  if (soundCache.has(cacheKey)) {
    return soundCache.get(cacheKey)!
  }

  const buffer = generateSound(context, soundType as any)
  soundCache.set(cacheKey, buffer)
  return buffer
}

export const useSound = (
  soundType: 'click' | 'success' | 'error' | 'notification' | 'gameClick' | 'gameSuccess' | 'gameOver',
  enabled: boolean = true
): SoundHookReturn => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Resume audio context if suspended (required by browser policies)
  const resumeContext = useCallback(async (context: AudioContext) => {
    if (context.state === 'suspended') {
      try {
        await context.resume()
      } catch (error) {
        console.warn('Failed to resume audio context:', error)
      }
    }
  }, [])

  const play = useCallback(
    async (options: SoundOptions = {}) => {
      if (!enabled) return

      try {
        const context = getAudioContext(soundType)
        await resumeContext(context)

        // Stop any currently playing sound
        if (sourceRef.current) {
          sourceRef.current.stop()
          sourceRef.current.disconnect()
        }

        const buffer = getSoundBuffer(context, soundType)

        // Create nodes
        const source = context.createBufferSource()
        const gain = context.createGain()

        source.buffer = buffer
        source.connect(gain)
        gain.connect(context.destination)

        // Apply options
        const finalVolume = (options.volume ?? volume) * 0.3 // Additional safety reduction
        gain.gain.setValueAtTime(0, context.currentTime)

        if (options.fadeIn && options.fadeIn > 0) {
          gain.gain.linearRampToValueAtTime(finalVolume, context.currentTime + options.fadeIn)
        } else {
          gain.gain.setValueAtTime(finalVolume, context.currentTime)
        }

        if (options.loop) {
          source.loop = true
        }

        // Store references
        sourceRef.current = source
        gainRef.current = gain

        // Handle completion
        source.onended = () => {
          setIsPlaying(false)
          sourceRef.current = null
          gainRef.current = null
        }

        // Start playback
        source.start()
        setIsPlaying(true)

      } catch (error) {
        console.warn('Failed to play sound:', error)
      }
    },
    [soundType, enabled, volume, resumeContext]
  )

  const stop = useCallback(
    (fadeOut: number = 0.1) => {
      if (!sourceRef.current || !gainRef.current) return

      try {
        const context = getAudioContext(soundType)

        if (fadeOut > 0) {
          gainRef.current.gain.linearRampToValueAtTime(0, context.currentTime + fadeOut)

          fadeTimeoutRef.current = setTimeout(() => {
            if (sourceRef.current) {
              sourceRef.current.stop()
              sourceRef.current.disconnect()
              sourceRef.current = null
            }
            if (gainRef.current) {
              gainRef.current.disconnect()
              gainRef.current = null
            }
            setIsPlaying(false)
          }, fadeOut * 1000)
        } else {
          sourceRef.current.stop()
          sourceRef.current.disconnect()
          sourceRef.current = null
          if (gainRef.current) {
            gainRef.current.disconnect()
            gainRef.current = null
          }
          setIsPlaying(false)
        }
      } catch (error) {
        console.warn('Failed to stop sound:', error)
      }
    },
    [soundType]
  )

  // Cleanup on unmount or when enabled changes
  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.stop()
          sourceRef.current.disconnect()
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
      if (gainRef.current) {
        try {
          gainRef.current.disconnect()
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    }
  }, [])

  // Stop sound when disabled
  useEffect(() => {
    if (!enabled && isPlaying) {
      stop(0.05)
    }
  }, [enabled, isPlaying, stop])

  return useMemo(
    () => ({
      play,
      stop,
      isPlaying,
      volume,
      setVolume
    }),
    [play, stop, isPlaying, volume, setVolume]
  )
}
