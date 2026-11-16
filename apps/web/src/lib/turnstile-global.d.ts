// Minimal typing for the native Cloudflare Turnstile script embed.
interface TurnstileApi {
  render: (el: Element, options: Record<string, unknown>) => string
  remove: (id: string) => void
  reset: (id?: string) => void
  getResponse: (id?: string) => string
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export {}
