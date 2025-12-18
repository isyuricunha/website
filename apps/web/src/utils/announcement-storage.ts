const dismissedKey = 'dismissedAnnouncements'
const shownToastsKey = 'shownAnnouncementToasts'

const safeGetSessionStorage = (): Storage | null => {
  try {
    if (globalThis.window === undefined) return null
    return sessionStorage
  } catch {
    return null
  }
}

const parseStringArray = (raw: string | null): string[] => {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    if (!parsed.every((item) => typeof item === 'string')) return []
    return parsed
  } catch {
    return []
  }
}

const uniqueAppend = (items: string[], next: string): string[] => {
  if (items.includes(next)) return items
  return [...items, next]
}

export const getDismissedAnnouncementIds = (): string[] => {
  const storage = safeGetSessionStorage()
  if (!storage) return []
  return parseStringArray(storage.getItem(dismissedKey))
}

export const setDismissedAnnouncementIds = (ids: string[]): void => {
  const storage = safeGetSessionStorage()
  if (!storage) return

  try {
    storage.setItem(dismissedKey, JSON.stringify(ids))
  } catch {
    // ignore storage errors
  }
}

export const addDismissedAnnouncementId = (current: string[], announcementId: string): string[] => {
  const next = uniqueAppend(current, announcementId)
  setDismissedAnnouncementIds(next)
  return next
}

export const getShownAnnouncementToastIds = (): string[] => {
  const storage = safeGetSessionStorage()
  if (!storage) return []
  return parseStringArray(storage.getItem(shownToastsKey))
}

export const setShownAnnouncementToastIds = (ids: string[]): void => {
  const storage = safeGetSessionStorage()
  if (!storage) return

  try {
    storage.setItem(shownToastsKey, JSON.stringify(ids))
  } catch {
    // ignore storage errors
  }
}

export const addShownAnnouncementToastId = (current: string[], announcementId: string): string[] => {
  const next = uniqueAppend(current, announcementId)
  setShownAnnouncementToastIds(next)
  return next
}
