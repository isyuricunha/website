import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
  )

  useEffect(() => {
    const mql = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    mql.addEventListener('change', onChange)

    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
