'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WifiOff, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from '@isyuricunha/i18n/client'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => globalThis.navigator?.onLine ?? true)
  const [showIndicator, setShowIndicator] = useState(false)
  const t = useTranslations('component.offline-indicator')
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      toast.success(t('toast.restored'))

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      hideTimeoutRef.current = setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
      toast.error(t('toast.offline'))
    }

    addEventListener('online', handleOnline)
    addEventListener('offline', handleOffline)

    return () => {
      removeEventListener('online', handleOnline)
      removeEventListener('offline', handleOffline)

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
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
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg ${
            isOnline
              ? 'text-accent-earth-text bg-[var(--accent-dim)]'
              : 'bg-bg-active text-text-primary'
          }`}
        >
          {isOnline ? <Wifi className='size-4' /> : <WifiOff className='size-4' />}
          <span className='text-sm font-medium'>
            {t(isOnline ? 'status.online' : 'status.offline')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
