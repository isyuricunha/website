declare global {
  namespace App {
    // Populated by the Better Auth handle hook once authentication lands.
    interface Locals {
      user: unknown
      session: unknown
    }
    // interface PageData {}
    // interface Error {}
    // interface Platform {}
  }
}

export {}
