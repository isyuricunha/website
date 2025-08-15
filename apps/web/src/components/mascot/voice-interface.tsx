'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { useTranslations } from '@tszhong0411/i18n/client'

interface VoiceInterfaceProps {
  onVoiceMessage: (message: string) => Promise<string>
  isEnabled: boolean
  onToggle: () => void
  className?: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function VoiceInterface({ 
  onVoiceMessage, 
  isEnabled, 
  onToggle, 
  className = '' 
}: VoiceInterfaceProps) {
  const t = useTranslations()
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Check browser support and HTTPS requirement
  useEffect(() => {
    const speechRecognitionSupported = 
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    const speechSynthesisSupported = 'speechSynthesis' in window
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:'
    
    // Voice features require HTTPS in production
    const voiceSupported = speechRecognitionSupported && speechSynthesisSupported && isSecureContext
    
    setIsSupported(voiceSupported)
    
    if (!isSecureContext && (speechRecognitionSupported || speechSynthesisSupported)) {
      setError('Voice features require HTTPS. Please use https:// or localhost for voice interaction.')
    }
    
    if (speechSynthesisSupported) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US' // TODO: Use current locale from i18n

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      setTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      if (finalTranscript) {
        handleVoiceInput(finalTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event)
      let errorMessage = ''
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access blocked. Click the microphone icon in your browser address bar to allow access.'
          break
        case 'no-speech':
          errorMessage = 'No speech detected. Try speaking louder or closer to the microphone.'
          break
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone connection.'
          break
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.'
          break
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Try refreshing the page.'
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }
      setError(errorMessage)
      setIsListening(false)
    }

    recognition.onend = () => {
      console.debug('Speech recognition ended')
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [isSupported])

  const handleVoiceInput = useCallback(async (text: string) => {
    if (!text.trim()) return

    setIsProcessing(true)
    setTranscript('')

    try {
      const response = await onVoiceMessage(text)
      if (response) {
        speakText(response)
      }
    } catch (error) {
      setError('Failed to process voice message')
      console.error('Voice processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onVoiceMessage])

  const speakText = useCallback((text: string) => {
    if (!synthRef.current || !text) return

    // Stop any current speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.volume = 0.8

    // Try to use a more natural voice
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.name.includes('Natural')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsSpeaking(false)
      setError('Speech synthesis failed')
    }

    currentUtteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }, [])

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening || isProcessing) return

    try {
      // Segurança: proíbe em origens que definitivamente não são seguras
      if (!window.isSecureContext && window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        setError('Voice features require HTTPS or localhost. Current URL is not secure.')
        return
      }

      // 1) Check permission status (may be 'granted' | 'prompt' | 'denied')
      if (navigator.permissions && (navigator.permissions as any).query) {
        try {
          const p = await (navigator.permissions as any).query({ name: 'microphone' })
          if (p.state === 'denied') {
            setError('Microphone permission is denied for this site. Please allow it in browser settings.')
            return
          }
          // optional: listen for changes
          p.onchange = () => {
            if (p.state === 'denied') setError('Microphone permission was denied.')
          }
        } catch (e) {
          // ignore if browser doesn't support the microphone permission descriptor
          console.debug('permission.query not supported for microphone', e)
        }
      }

      // 2) Some browsers won't show the mic permission prompt unless getUserMedia is called.
      //    This will prompt the user to allow mic access (or fail immediately if blocked).
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          // We don't need to keep stream; stop tracks right away
          stream.getTracks().forEach(t => t.stop())
        } catch (gErr) {
          // If user denies here, we get NotAllowedError
          if ((gErr as any).name === 'NotAllowedError' || (gErr as any).name === 'PermissionDeniedError') {
            setError('Microphone access denied. Please allow microphone access in the browser prompt.')
            return
          } else {
            console.warn('getUserMedia error', gErr)
          }
        }
      }

      recognitionRef.current.start()
    } catch (error) {
      console.error('startListening error', error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access and try again.')
        } else if (error.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.')
        } else {
          setError('Failed to start voice recognition: ' + error.message)
        }
      } else {
        setError('Failed to start voice recognition')
      }
    }
  }, [isListening, isProcessing])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [isSpeaking])

  if (!isSupported) {
    return (
      <div className={`text-xs text-muted-foreground p-2 ${className}`}>
        <div className="flex flex-col gap-1">
          <span>Voice interaction not available</span>
          {!window.isSecureContext && window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost') && (
            <span className="text-xs">Requires HTTPS or localhost</span>
          )}
        </div>
      </div>
    )
  }

  if (!isEnabled) {
    return (
      <button
        onClick={onToggle}
        className={`p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors ${className}`}
        title="Enable voice interaction"
      >
        <MicOff className="h-4 w-4 text-muted-foreground" />
      </button>
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Voice Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </button>

        <button
          onClick={isSpeaking ? stopSpeaking : onToggle}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          title={isSpeaking ? 'Stop speaking' : 'Disable voice interaction'}
        >
          {isSpeaking ? (
            <Volume2 className="h-4 w-4 text-primary animate-pulse" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Status Display */}
      {(isListening || isProcessing || transcript) && (
        <div className="bg-muted/50 rounded-lg p-2 text-xs">
          {isListening && (
            <div className="flex items-center gap-2 text-primary">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening...
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing...
            </div>
          )}
          {transcript && (
            <div className="text-foreground">
              <strong>You said:</strong> {transcript}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-2 text-xs border border-destructive/20">
          <div className="flex items-start gap-2">
            <span className="flex-1">{error}</span>
            {error.includes('denied') && (
              <button
                onClick={() => setError('')}
                className="text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            )}
          </div>
          {error.includes('denied') && (
            <div className="mt-2 text-xs text-muted-foreground">
              💡 Click the microphone icon in your browser's address bar to allow access
            </div>
          )}
        </div>
      )}

      {/* Voice Status Indicator */}
      {isSpeaking && (
        <div className="bg-primary/10 text-primary rounded-lg p-2 text-xs border border-primary/20">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3 animate-pulse" />
            Mascot is speaking...
          </div>
        </div>
      )}
    </div>
  )
}
