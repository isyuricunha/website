import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof globalThis.matchMedia === 'function'
        ? globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
        : false
  )

  useEffect(() => {
    if (typeof globalThis.matchMedia !== 'function') return
    const mql = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    mql.addEventListener('change', onChange)

    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
