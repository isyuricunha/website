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

// Generate different sound types using Web Audio API - Minimalist, Modern, Pleasant
const generateSound = (
  context: AudioContext,
  type: 'click' | 'success' | 'error' | 'notification' | 'gameClick' | 'gameSuccess' | 'gameOver'
): AudioBuffer => {
  const sampleRate = context.sampleRate

  // Determine duration based on sound type first
  let duration: number
  switch (type) {
    case 'click':
      duration = 0.15
      break
    case 'success':
      duration = 0.4
      break
    case 'error':
      duration = 0.3
      break
    case 'notification':
      duration = 0.25
      break
    case 'gameClick':
      duration = 0.12
      break
    case 'gameSuccess':
      duration = 0.35
      break
    case 'gameOver':
      duration = 0.5
      break
    default:
      duration = 0.2
  }

  // Calculate frame count based on actual duration
  const frameCount = Math.ceil(sampleRate * duration)
  const buffer = context.createBuffer(1, frameCount, sampleRate)
  const channelData = buffer.getChannelData(0)

  // ADSR envelope for more natural sound
  const adsr = (
    t: number,
    attack: number,
    decay: number,
    sustain: number,
    release: number
  ): number => {
    if (t < attack) return t / attack // Attack
    if (t < attack + decay) return 1 - ((1 - sustain) * (t - attack)) / decay // Decay
    if (t < duration - release) return sustain // Sustain
    return sustain * Math.max(0, (duration - t) / release) // Release
  }

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate
    let sample = 0

    switch (type) {
      case 'click':
        // Soft, modern click - gentle high frequency with quick decay
        const clickEnvelope = Math.exp(-t * 15) * (1 - t / duration)
        sample = Math.sin(2 * Math.PI * 1200 * t) * clickEnvelope * 0.4
        break

      case 'success':
        // Pleasant, modern success - gentle chord with smooth envelope
        const successEnvelope = adsr(t, 0.02, 0.1, 0.3, 0.15)
        // Major chord: C4, E4, G4
        const c4 = Math.sin(2 * Math.PI * 261.63 * t) * Math.exp(-t * 2)
        const e4 = Math.sin(2 * Math.PI * 329.63 * t) * Math.exp(-t * 2) * 0.7
        const g4 = Math.sin(2 * Math.PI * 392.0 * t) * Math.exp(-t * 2) * 0.5
        sample = (c4 + e4 + g4) * successEnvelope * 0.25
        break

      case 'error':
        // Subtle, modern error - low, gentle tone
        const errorEnvelope = adsr(t, 0.05, 0.15, 0.2, 0.1)
        sample = Math.sin(2 * Math.PI * 180 * t) * errorEnvelope * 0.35
        break

      case 'notification':
        // Gentle, modern notification - soft bell-like tone
        const notifEnvelope = adsr(t, 0.03, 0.1, 0.4, 0.12)
        // Fundamental + octave harmonic
        const fundamental = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 3)
        const octave = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 4) * 0.3
        sample = (fundamental + octave) * notifEnvelope * 0.3
        break

      case 'gameClick':
        // Clean, modern game click - crisp and responsive
        const gameClickEnvelope = Math.exp(-t * 20) * (1 - t / duration)
        sample = Math.sin(2 * Math.PI * 800 * t) * gameClickEnvelope * 0.35
        break

      case 'gameSuccess':
        // Bright, modern game success - uplifting chord
        const gameSuccessEnvelope = adsr(t, 0.02, 0.08, 0.5, 0.2)
        // Perfect fifth: C4 + G4
        const c4_game = Math.sin(2 * Math.PI * 261.63 * t) * Math.exp(-t * 2.5)
        const g4_game = Math.sin(2 * Math.PI * 392.0 * t) * Math.exp(-t * 3) * 0.8
        sample = (c4_game + g4_game) * gameSuccessEnvelope * 0.28
        break

      case 'gameOver':
        // Gentle, modern game over - descending, peaceful
        const gameOverEnvelope = adsr(t, 0.04, 0.2, 0.1, 0.26)
        // Slowly descending from G4 to C4
        const descendingFreq = 392 - t * 80 // Descend from G4 to C4
        sample = Math.sin(2 * Math.PI * descendingFreq * t) * gameOverEnvelope * 0.3
        break
    }

    // Additional subtle fade out for all sounds to prevent any clicks
    const finalFade = Math.max(0, 1 - Math.pow(t / duration, 2) * 0.1)
    channelData[i] = sample * finalFade
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
  soundType:
    | 'click'
    | 'success'
    | 'error'
    | 'notification'
    | 'gameClick'
    | 'gameSuccess'
    | 'gameOver',
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
        if (gainRef.current) {
          gainRef.current.disconnect()
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
