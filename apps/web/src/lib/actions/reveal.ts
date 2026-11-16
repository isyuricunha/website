/**
 * Scroll-reveal action mirroring the original framer-motion pattern:
 * useInView({ once: true, margin: '-100px' }) plus the y/opacity enter
 * transition. Adds .yu-reveal-in when the element enters the viewport and
 * keeps the final state permanently (once semantics). Skips entirely under
 * prefers-reduced-motion, matching the original useReducedMotion branches.
 */
export function reveal(node: HTMLElement, options?: { margin?: string }) {
  if (typeof globalThis === 'undefined' || typeof matchMedia !== 'function') return

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  node.classList.add('yu-reveal-pending')

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        node.classList.add('yu-reveal-in')
        observer.disconnect()
      }
    },
    { rootMargin: `0px 0px ${options?.margin ?? '-100px'} 0px` }
  )

  observer.observe(node)

  return {
    destroy() {
      observer.disconnect()
    }
  }
}
