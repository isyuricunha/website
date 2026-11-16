/**
 * Minimal toast store replacing react-sonner for the SvelteKit app.
 * Svelte 5 class-based shared state.
 */

export type ToastKind = 'success' | 'error' | 'info'

export type ToastItem = {
  id: number
  kind: ToastKind
  message: string
}

let nextId = 1

class ToastStore {
  items = $state<ToastItem[]>([])

  push(kind: ToastKind, message: string): void {
    this.items = [...this.items, { id: nextId++, kind, message }].slice(-5)

    window.setTimeout(() => {
      this.dismiss(this.items[0]?.id)
    }, 2500)
  }

  dismiss(id: number | undefined): void {
    if (id === undefined) {
      return
    }

    this.items = this.items.filter((item) => item.id !== id)
  }
}

export const toasts = new ToastStore()

export function toastSuccess(message: string): void {
  toasts.push('success', message)
}

export function toastError(message: string): void {
  toasts.push('error', message)
}
