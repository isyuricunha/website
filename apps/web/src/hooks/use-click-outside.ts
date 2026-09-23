import { useEffect } from 'react'

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    // Touch devices fire both touchstart and a synthetic mousedown for the
    // same tap; the mousedown would invoke the callback twice. The first
    // touch event wins, and a mousedown arriving within 500ms of a touch is
    // treated as the synthetic pair and skipped.
    let lastTouchAt = 0

    const listener = (event: MouseEvent | TouchEvent) => {
      if (event.type === 'touchstart') {
        lastTouchAt = Date.now()
      } else if (Date.now() - lastTouchAt < 500) {
        return
      }

      const target = event.target as Node

      if (!ref.current || ref.current.contains(target)) return

      callback(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [callback, ref])
}
