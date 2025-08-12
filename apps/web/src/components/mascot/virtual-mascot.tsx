'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { XIcon } from 'lucide-react'
import { useTranslations } from '@tszhong0411/i18n/client'

type VirtualMascotProps = {
  hidden?: boolean
}

const STORAGE_KEY = 'vc_mascot_dismissed'
const HIDE_KEY = 'vc_mascot_hidden'

const VirtualMascot = ({ hidden = false }: VirtualMascotProps) => {
  const t = useTranslations()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHiddenPref, setIsHiddenPref] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const bubbleRef = useRef<HTMLDivElement | null>(null)

  // Read dismissal state once per session
  useEffect(() => {
    try {
      const v = sessionStorage.getItem(STORAGE_KEY)
      if (v === '1') setIsDismissed(true)
      const h = localStorage.getItem(HIDE_KEY)
      if (h === '1') setIsHiddenPref(true)
    } catch {}
  }, [])

  // Build message list from i18n. Expect keys mascot.messages.0, .1, ... up to a small count
  const messages: string[] = useMemo(() => {
    const list: string[] = []
    for (let i = 0; i < 5; i += 1) {
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
  }, [t])

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

  if (hidden || isDismissed || isHiddenPref) return null

  return (
    <div className='fixed bottom-5 right-5 z-40 hidden sm:block'>
      {/* Bubble */}
      {showBubble && messages.length > 0 && (
        <div
          ref={bubbleRef}
          role='dialog'
          aria-live='polite'
          className='mb-2 max-w-xs rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg outline-none ring-0 transition-all duration-200 ease-out animate-[fadeInUp_200ms_ease-out]'
        >
          <div className='flex items-start gap-3'>
            <div className='min-w-0 flex-1'>{messages[messageIndex]}</div>
            <div className='flex items-center gap-1'>
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
        type='button'
        aria-label={t('mascot.ariaLabel')}
        className={`inline-flex h-[120px] w-[120px] items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-border shadow'
        }`}
        onClick={() => setIsActive((v) => !v)}
        onMouseEnter={() => {
          pickNextMessage()
          setShowBubble(true)
        }}
        onFocus={() => {
          pickNextMessage()
          setShowBubble(true)
        }}
        onBlur={() => setShowBubble(false)}
        onMouseLeave={() => setShowBubble(false)}
      >
        <Image
          src='/images/avatar.png'
          alt=''
          role='presentation'
          width={120}
          height={120}
          className='rounded-full object-cover'
          priority={false}
        />
      </button>

    </div>
  )
}

export default VirtualMascot


