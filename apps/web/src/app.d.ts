declare global {
  namespace App {
    interface Locals {
      // Resolved by the locale negotiation in hooks.server.ts.
      locale: string
      // Populated by the Better Auth handle hook once authentication lands.
      user: unknown
      session: unknown
    }
    // interface PageData {}
    // interface Error {}
    // interface Platform {}
  }
}

export {}
