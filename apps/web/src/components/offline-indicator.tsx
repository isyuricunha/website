'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WifiOff, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from '@isyuricunha/i18n/client'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)
  const t = useTranslations('component.offline-indicator')
  const hide_timeout_ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      toast.success(t('toast.restored'))

      if (hide_timeout_ref.current) {
        clearTimeout(hide_timeout_ref.current)
      }
      hide_timeout_ref.current = setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
      toast.error(t('toast.offline'))
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    globalThis.addEventListener('online', handleOnline)
    globalThis.addEventListener('offline', handleOffline)

    return () => {
      globalThis.removeEventListener('online', handleOnline)
      globalThis.removeEventListener('offline', handleOffline)

      if (hide_timeout_ref.current) {
        clearTimeout(hide_timeout_ref.current)
        hide_timeout_ref.current = null
      }
    }
  }, [t])

  return (
    <AnimatePresence>
      {(!isOnline || showIndicator) && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg ${
            isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {isOnline ? <Wifi className='size-4' /> : <WifiOff className='size-4' />}
          <span className='text-sm font-medium'>
            {isOnline ? t('status.online') : t('status.offline')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
